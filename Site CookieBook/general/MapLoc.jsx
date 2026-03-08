import React, { useEffect, useMemo, useRef, useState } from "react";

// Utils
function toRad(deg) {
  return deg * (Math.PI / 180);
}

function distanceKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function extractLatLng(location) {
  if (!location) return null;

  const lat = typeof location.lat === "function" ? location.lat() : location.lat;
  const lng = typeof location.lng === "function" ? location.lng() : location.lng;

  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return { lat, lng };
}

function makeRedPin() {
  const wrap = document.createElement("div");
  wrap.style.pointerEvents = "none";
  wrap.style.position = "relative";
  wrap.style.width = "18px";
  wrap.style.height = "18px";

  const pin = document.createElement("div");
  pin.style.pointerEvents = "none";
  pin.style.width = "18px";
  pin.style.height = "18px";
  pin.style.background = "#e2182d";
  pin.style.borderRadius = "999px";
  pin.style.border = "3px solid #fff";
  pin.style.boxShadow = "0 10px 18px rgba(226,24,45,.25)";

  const tail = document.createElement("div");
  tail.style.pointerEvents = "none";
  tail.style.position = "absolute";
  tail.style.left = "50%";
  tail.style.top = "100%";
  tail.style.transform = "translateX(-50%)";
  tail.style.width = "0";
  tail.style.height = "0";
  tail.style.borderLeft = "7px solid transparent";
  tail.style.borderRight = "7px solid transparent";
  tail.style.borderTop = "10px solid #e2182d";

  wrap.appendChild(pin);
  wrap.appendChild(tail);
  return wrap;
}

async function geocodeAddress(geocoder, address) {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        reject(new Error(`Geocode failed (${status}) for: ${address}`));
      }
    });
  });
}

async function waitForGoogleMaps(maxWaitMs = 15000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
        return;
      }

      if (Date.now() - start > maxWaitMs) {
        reject(new Error("Google Maps a pris trop de temps à charger."));
        return;
      }

      requestAnimationFrame(check);
    };

    check();
  });
}

async function waitForInnerMap(mapEl, maxWaitMs = 10000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (mapEl?.innerMap) {
        resolve(mapEl.innerMap);
        return;
      }

      if (Date.now() - start > maxWaitMs) {
        reject(new Error("innerMap n'est pas prêt."));
        return;
      }

      requestAnimationFrame(check);
    };

    check();
  });
}

export default function MapPicker({
  mode = "delivery",
  onPickShop,
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAP_ID || "DEMO_MAP_ID";

  const mapRef = useRef(null);
  const placeHostRef = useRef(null);

  const initializedRef = useRef(false);
  const cleanupRef = useRef(() => {});

  const [status, setStatus] = useState("Initialisation…");
  const [nearest, setNearest] = useState(null);
  const [chosen, setChosen] = useState(null);

  const shops = useMemo(
    () => [
      {
        id: "matane",
        name: "CookieBook – Matane",
        address: "616 avenue Saint-Rédempteur, Matane, QC, Canada",
      },
      {
        id: "sblg",
        name: "CookieBook – Saint-Basile-le-Grand",
        address: "20 rue des Perdrix, Saint-Basile-le-Grand, QC, Canada",
      },
    ],
    []
  );

  useEffect(() => {
    if (!apiKey) {
      setStatus("Clé API Google Maps manquante.");
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        setStatus("Chargement de Google Maps…");

        let loader = document.querySelector("gmpx-api-loader[data-cookiebook='1']");
        if (!loader) {
          loader = document.createElement("gmpx-api-loader");
          loader.setAttribute("key", apiKey);
          loader.setAttribute("solution-channel", "CookieBook_Checkout");
          loader.setAttribute("data-cookiebook", "1");
          document.body.appendChild(loader);
        }

        await waitForGoogleMaps();
        await customElements.whenDefined("gmp-map");

        if (cancelled) return;

        const mapEl = mapRef.current;
        const placeHostEl = placeHostRef.current;

        if (!mapEl || !placeHostEl) {
          setStatus("Éléments de carte introuvables.");
          return;
        }

        const map = await waitForInnerMap(mapEl);

        if (cancelled) return;

        // Important: on nettoie le host avant de recréer le picker
        placeHostEl.innerHTML = "";
        mapEl.innerHTML = "";

        map.setOptions({
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        const geocoder = new window.google.maps.Geocoder();
        const bounds = new window.google.maps.LatLngBounds();

        setStatus("Géocodage des boutiques…");

        const shopsWithPos = await Promise.all(
          shops.map(async (shop) => {
            try {
              const pos = await geocodeAddress(geocoder, shop.address);
              return { ...shop, pos };
            } catch (error) {
              console.error(error);
              return { ...shop, pos: null };
            }
          })
        );

        if (cancelled) return;

        const validShops = shopsWithPos.filter((s) => s.pos);

        const shopMarkers = new Map();
        const markerCleanup = [];
        let userMarker = null;

        const shopInfo = new window.google.maps.InfoWindow();
        const userInfo = new window.google.maps.InfoWindow();

        validShops.forEach((shop) => {
          const marker = document.createElement("gmp-advanced-marker");
          marker.position = shop.pos;
          marker.appendChild(makeRedPin());
          mapEl.appendChild(marker);

          const clickHandler = () => {
            shopInfo.setContent(
              `<strong>${shop.name}</strong><br><span>${shop.address}</span>`
            );
            shopInfo.open({
              map,
              anchor: marker,
            });
          };

          marker.addEventListener("gmp-click", clickHandler);
          markerCleanup.push(() => marker.removeEventListener("gmp-click", clickHandler));

          shopMarkers.set(shop.id, marker);
          bounds.extend(shop.pos);
        });

        if (validShops.length > 0) {
          map.fitBounds(bounds);

          // évite un zoom trop éloigné / trop proche après fitBounds
          window.google.maps.event.addListenerOnce(map, "idle", () => {
            const currentZoom = map.getZoom();
            if (typeof currentZoom === "number" && currentZoom > 14) {
              map.setZoom(14);
            }
          });

          setStatus("Carte chargée ✅");
        } else {
          map.setCenter({ lat: 47.6584, lng: -67.9978 });
          map.setZoom(5);
          setStatus("Aucune boutique géocodée.");
        }

        // Nouveau champ autocomplete plus stable
        await window.google.maps.importLibrary("places");

        if (cancelled) return;

        const placeAutocomplete =
          new window.google.maps.places.PlaceAutocompleteElement({
            placeholder:
              mode === "delivery"
                ? "Entrez votre adresse de livraison"
                : "Entrez votre adresse",
          });

        placeAutocomplete.style.width = "100%";
        placeHostEl.appendChild(placeAutocomplete);

        const computeNearestShop = (fromPos) => {
          let best = null;
          let bestKm = Infinity;

          for (const shop of validShops) {
            const km = distanceKm(fromPos, shop.pos);
            if (km < bestKm) {
              bestKm = km;
              best = { ...shop, km };
            }
          }

          return best;
        };

        const focusShop = (shop) => {
          if (!shop?.pos) return;

          map.setCenter(shop.pos);
          map.setZoom(14);

          const marker = shopMarkers.get(shop.id);
          if (marker) {
            shopInfo.setContent(
              `<strong>${shop.name}</strong><br><span>${shop.address}</span>`
            );
            shopInfo.open({
              map,
              anchor: marker,
            });
          }
        };

        const selectNearestFromLocation = (location) => {
          const userPos = extractLatLng(location);
          if (!userPos) return;

          map.setCenter(userPos);
          map.setZoom(12);

          if (!userMarker) {
            userMarker = document.createElement("gmp-advanced-marker");
            userMarker.appendChild(makeRedPin());
            mapEl.appendChild(userMarker);
          }

          userMarker.position = userPos;

          userInfo.setContent("<strong>📍 C’est vous ici</strong>");
          userInfo.open({
            map,
            anchor: userMarker,
          });

          const best = computeNearestShop(userPos);
          setNearest(best);

          if (best) {
            focusShop(best);
          }
        };

        const onPlaceChange = async (event) => {
          try {
            const prediction = event.placePrediction;
            if (!prediction) return;

            const place = prediction.toPlace();
            await place.fetchFields({
              fields: ["displayName", "formattedAddress", "location"],
            });

            if (!place.location) return;
            selectNearestFromLocation(place.location);
          } catch (error) {
            console.error("Erreur autocomplete:", error);
            setStatus("Impossible de lire l’adresse sélectionnée.");
          }
        };

        placeAutocomplete.addEventListener("gmp-select", onPlaceChange);

        cleanupRef.current = () => {
          placeAutocomplete.removeEventListener("gmp-select", onPlaceChange);
          markerCleanup.forEach((fn) => fn());
          shopInfo.close();
          userInfo.close();
          placeHostEl.innerHTML = "";
          mapEl.innerHTML = "";
        };

        initializedRef.current = true;
      } catch (error) {
        console.error(error);
        setStatus("La carte n'a pas pu être initialisée.");
      }
    }

    init();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = () => {};
      initializedRef.current = false;
    };
  }, [apiKey, mapId, mode, shops]);

  const chooseShop = (shop) => {
    setChosen(shop);
    onPickShop?.(shop);
  };

  return (
    <div className="mapWrap">
      <div className="mapHeader">
        <div className="strong">Localisation</div>
        <div className="muted small">{status}</div>
      </div>

      <div className="mapGrid">
        <div className="mapCard">
          <div ref={placeHostRef} />

          <div className="muted small" style={{ marginTop: 8 }}>
            Boutique la plus proche :{" "}
            <span className="strong">
              {nearest ? `${nearest.name} (~${nearest.km.toFixed(1)} km)` : "—"}
            </span>
          </div>

          <gmp-map
            ref={mapRef}
            map-id={mapId}
            style={{
              display: "block",
              width: "100%",
              minHeight: "420px",
              height: "420px",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid var(--border)",
              background: "#fff",
              marginTop: 12,
            }}
          />
        </div>

        <aside className="mapSide">
          <div className="card soft">
            <div className="strong">Points CookieBook</div>
            <div className="muted small">Choisis un point de ramassage.</div>
          </div>

          <div className="stack gap">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className={"card soft " + (chosen?.id === shop.id ? "selected" : "")}
              >
                <div className="strong">{shop.name}</div>
                <div className="muted small">{shop.address}</div>

                <div className="row gap" style={{ marginTop: 10 }}>
                  <button
                    className="btn tiny"
                    type="button"
                    onClick={() => chooseShop(shop)}
                  >
                    Choisir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
