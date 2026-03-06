import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatCAD, useCart } from "../context/CartContext.jsx";
import confetti from "canvas-confetti";
import Swal from "sweetalert2";
import MapPicker from "../components/MapPicker.jsx";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaiementStripe from "../components/PaiementStripe.jsx";

function round2(n) {
  return Math.round(n * 100) / 100;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Checkout() {
  const nav = useNavigate();
  const location = useLocation();
  const { items, subtotal, clear } = useCart();

  const [pickupShop, setPickupShop] = useState(null);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [clientSecret, setClientSecret] = useState("");
  const [preference, setPreference] = useState("pickup"); // pickup | delivery
  const [address, setAddress] = useState({
    line1: "",
    city: "",
    postal: "",
    notes: "",
  });

  const [tipType, setTipType] = useState("percent"); // percent | amount
  const [tipValue, setTipValue] = useState(10);
  const [payment, setPayment] = useState("visa");

  const taxes = useMemo(() => round2(subtotal * 0.14975), [subtotal]);

  const tip = useMemo(() => {
    if (tipType === "percent") {
      return round2(subtotal * (Number(tipValue) / 100));
    }
    return round2(Number(tipValue) || 0);
  }, [subtotal, tipType, tipValue]);

  const total = useMemo(() => round2(subtotal + taxes + tip), [subtotal, taxes, tip]);
  const totalCents = Math.round(total * 100);
  const disabled = items.length === 0;

  const isEmailValid = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

  const isPhoneValid = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    return digits.length >= 10;
  };

  const isPostalValid = (postal) => {
    const p = String(postal || "").trim().toUpperCase();
    return /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/.test(p);
  };

  const showUpdateInfo = async () => {
    const okName = customer.name.trim().length >= 2;
    const okEmail = isEmailValid(customer.email);
    const okPhone = customer.phone.trim() ? isPhoneValid(customer.phone) : true;

    if (!okName || !okEmail || !okPhone) {
      await Swal.fire({
        icon: "error",
        title: "Informations incomplètes",
        html: `
          <div style="text-align:left">
            ${!okName ? "• Nom requis (min 2 caractères)<br/>" : ""}
            ${!okEmail ? "• Email invalide<br/>" : ""}
            ${!okPhone ? "• Téléphone invalide (10 chiffres min)<br/>" : ""}
          </div>
        `,
        confirmButtonColor: "#ff3b6b",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Infos mises à jour ✅",
      text: "Tes informations sont prêtes pour la commande.",
      confirmButtonColor: "#ff3b6b",
    });
  };

  const validateBeforeOrder = () => {
    if (disabled) return { ok: false, msg: "Ton panier est vide." };

    if (customer.name.trim().length < 2) {
      return { ok: false, msg: "Ajoute ton nom." };
    }

    if (!isEmailValid(customer.email)) {
      return { ok: false, msg: "Ton email est invalide." };
    }

    if (customer.phone.trim() && !isPhoneValid(customer.phone)) {
      return { ok: false, msg: "Ton téléphone semble invalide." };
    }

    if (preference === "pickup" && !pickupShop) {
      return { ok: false, msg: "Choisis un point de ramassage sur la carte." };
    }

    if (preference === "delivery") {
      if (!address.line1.trim()) {
        return { ok: false, msg: "Ajoute l’adresse de livraison." };
      }
      if (!address.city.trim()) {
        return { ok: false, msg: "Ajoute la ville." };
      }
      if (!isPostalValid(address.postal)) {
        return { ok: false, msg: "Code postal invalide (ex: A1A 1A1)." };
      }
    }

    if (tipType === "percent") {
      const v = Number(tipValue);
      if (!Number.isFinite(v) || v < 0 || v > 100) {
        return { ok: false, msg: "Pourboire (%) invalide (0 à 100)." };
      }
    } else {
      const v = Number(tipValue);
      if (!Number.isFinite(v) || v < 0) {
        return { ok: false, msg: "Pourboire (montant) invalide." };
      }
    }

    return { ok: true };
  };

  const placeOrder = async () => {
    const v = validateBeforeOrder();

    if (!v.ok) {
      await Swal.fire({
        icon: "error",
        title: "Impossible de commander",
        text: v.msg,
        confirmButtonColor: "#ff3b6b",
      });
      return;
    }

    const resConfirm = await Swal.fire({
      icon: "question",
      title: "Confirmer et payer ?",
      text: "Tu vas être redirigée vers Stripe pour entrer ta carte.",
      showCancelButton: true,
      confirmButtonText: "Oui, payer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#ff3b6b",
    });

    if (!resConfirm.isConfirmed) return;

    const payload = {
      items: items
        .map((it) => {
          const quantity = Number(it.quantity);
          const totalPrice = Number(it.totalPrice);
          const unitPrice = quantity > 0 ? totalPrice / quantity : 0;
          const unit_amount_cents = Math.round(unitPrice * 100);

          return {
            name: String(it.name || "Produit"),
            unit_amount_cents,
            quantity,
          };
        })
        .filter(
          (it) =>
            Number.isInteger(it.quantity) &&
            it.quantity > 0 &&
            Number.isInteger(it.unit_amount_cents) &&
            it.unit_amount_cents > 0
        ),
    };

    console.log("PANIER BRUT =", items);
    console.log("PAYLOAD ENVOYÉ =", payload);

    if (!payload.items.length) {
      await Swal.fire({
        icon: "error",
        title: "Montant invalide",
        text: "Les produits envoyés au paiement sont invalides.",
        confirmButtonColor: "#ff3b6b",
      });
      return;
    }

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("Réponse brute serveur =", text);

      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

      console.log("Réponse JSON serveur =", data);

      if (!res.ok || !data.url) {
        await Swal.fire({
          icon: "error",
          title: "Erreur paiement",
          text: data?.error || data?.message || "Serveur de paiement introuvable.",
          confirmButtonColor: "#ff3b6b",
        });
        return;
      }

      window.location.href = data.url;
    } catch (e) {
      console.error("Erreur réseau/fetch =", e);
      await Swal.fire({
        icon: "error",
        title: "Erreur réseau",
        text: "Impossible de contacter le serveur de paiement.",
        confirmButtonColor: "#ff3b6b",
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get("success");
    const cancel = params.get("cancel");

    if (success === "1") {
      Swal.fire({
        icon: "success",
        title: "Commande confirmée ! 🍪",
        text: "Merci 💛 Ton paiement a été accepté.",
        confirmButtonColor: "#ff3b6b",
      }).then(() => {
        confetti({
          particleCount: 180,
          spread: 75,
          origin: { y: 0.65 },
        });

        clear();
        nav("/paiement", { replace: true });
      });
    }

    if (cancel === "1") {
      Swal.fire({
        icon: "info",
        title: "Paiement annulé",
        text: "Aucun montant n’a été débité. Tu peux réessayer quand tu veux.",
        confirmButtonColor: "#ff3b6b",
      }).then(() => {
        nav("/paiement", { replace: true });
      });
    }
  }, [location.search, clear, nav]);

  console.log("clientSecret =", clientSecret);
  console.log("API URL =", import.meta.env.VITE_API_URL);
  console.log("totalCents =", totalCents);

  return (
    <div className="stack gap-xl">
      <section className="card">
        <h1>Paiement</h1>
        <p className="muted">
          Vérifie tes informations, choisis livraison/emporter, pourboire et paiement.
        </p>
      </section>

      {disabled ? (
        <section className="card">
          <div className="muted">Ton panier est vide. Ajoute des produits avant de payer.</div>
          <button className="btn primary" onClick={() => nav("/menu")}>
            Aller au menu
          </button>
        </section>
      ) : (
        <>
          <section className="card">
            <div className="row between">
              <h2>1) Vérification des informations</h2>
              <button className="btn tiny" onClick={showUpdateInfo}>
                Mettre à jour
              </button>
            </div>

            <div className="grid-2">
              <label className="label">
                Nom
                <input
                  className="input"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer((s) => ({
                      ...s,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Ton nom"
                />
              </label>

              <label className="label">
                Téléphone
                <input
                  className="input"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer((s) => ({
                      ...s,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="(xxx) xxx-xxxx"
                />
              </label>

              <label className="label">
                Email
                <input
                  className="input"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer((s) => ({
                      ...s,
                      email: e.target.value,
                    }))
                  }
                  placeholder="ex: toi@gmail.com"
                />
              </label>
            </div>
          </section>

          <section className="card">
            <h2>2) Préférence</h2>

            <div className="row gap" style={{ flexWrap: "wrap" }}>
              <label className="radio">
                <input
                  type="radio"
                  name="pref"
                  checked={preference === "pickup"}
                  onChange={() => setPreference("pickup")}
                />
                <span>Je viens prendre la commande (emporter)</span>
              </label>

              <label className="radio">
                <input
                  type="radio"
                  name="pref"
                  checked={preference === "delivery"}
                  onChange={() => setPreference("delivery")}
                />
                <span>Livraison</span>
              </label>
            </div>

            <div className="card soft" style={{ marginTop: 12 }}>
              <div className="section-title">
                {preference === "pickup" ? "Point de ramassage" : "Zone / point de référence"}
              </div>

              <MapPicker mode={preference} onPickShop={setPickupShop} />

              <div className="muted small" style={{ marginTop: 10 }}>
                Boutique choisie :{" "}
                <span className="strong">
                  {pickupShop ? `${pickupShop.name} — ${pickupShop.address}` : "—"}
                </span>
              </div>
            </div>

            {preference === "delivery" && (
              <div className="card soft" style={{ marginTop: 12 }}>
                <div className="section-title">Adresse de livraison</div>
                <div className="grid-2">
                  <label className="label">
                    Adresse
                    <input
                      className="input"
                      value={address.line1}
                      onChange={(e) =>
                        setAddress((s) => ({
                          ...s,
                          line1: e.target.value,
                        }))
                      }
                      placeholder="123 Rue ..."
                    />
                  </label>

                  <label className="label">
                    Ville
                    <input
                      className="input"
                      value={address.city}
                      onChange={(e) =>
                        setAddress((s) => ({
                          ...s,
                          city: e.target.value,
                        }))
                      }
                      placeholder="Joliette"
                    />
                  </label>

                  <label className="label">
                    Code postal
                    <input
                      className="input"
                      value={address.postal}
                      onChange={(e) =>
                        setAddress((s) => ({
                          ...s,
                          postal: e.target.value,
                        }))
                      }
                      placeholder="A1A 1A1"
                    />
                  </label>

                  <label className="label">
                    Notes (interphone, étage…)
                    <input
                      className="input"
                      value={address.notes}
                      onChange={(e) =>
                        setAddress((s) => ({
                          ...s,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Ex: sonner #203"
                    />
                  </label>
                </div>
              </div>
            )}
          </section>

          <section className="card">
            <h2>3) Pourboire</h2>

            <div className="row gap" style={{ flexWrap: "wrap" }}>
              <label className="radio">
                <input
                  type="radio"
                  name="tip"
                  checked={tipType === "percent"}
                  onChange={() => setTipType("percent")}
                />
                <span>%</span>
              </label>

              <label className="radio">
                <input
                  type="radio"
                  name="tip"
                  checked={tipType === "amount"}
                  onChange={() => setTipType("amount")}
                />
                <span>Montant</span>
              </label>
            </div>

            <div className="row gap" style={{ flexWrap: "wrap" }}>
              <input
                className="input"
                type="number"
                min="0"
                value={tipValue}
                onChange={(e) => setTipValue(e.target.value)}
              />
              <div className="muted">
                Pourboire: <span className="strong">{formatCAD(tip)}</span>
              </div>
            </div>
          </section>

          <section className="card">
            <h2>4) Total</h2>
            <div className="stack gap">
              <div className="row between">
                <span className="muted">Sous-total</span>
                <span className="strong">{formatCAD(subtotal)}</span>
              </div>
              <div className="row between">
                <span className="muted">Taxes</span>
                <span className="strong">{formatCAD(taxes)}</span>
              </div>
              <div className="row between">
                <span className="muted">Pourboire</span>
                <span className="strong">{formatCAD(tip)}</span>
              </div>
              <div className="divider" />
              <div className="row between">
                <span className="strong">Total</span>
                <span className="strong big">{formatCAD(total)}</span>
              </div>
            </div>
          </section>

          <section className="card">
            <h2>5) Mode de paiement</h2>
            <div className="grid-2">
              <label className="radio card soft">
                <input
                  type="radio"
                  name="pay"
                  checked={payment === "visa"}
                  onChange={() => setPayment("visa")}
                />
                <span>Carte (Visa/Mastercard)</span>
              </label>
            </div>
          </section>

          <section className="card">
            <div className="row gap">
              <button className="btn" onClick={() => nav("/menu")}>
                Retour au menu
              </button>

              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaiementStripe totalCents={totalCents} disabled={disabled} />
                </Elements>
              ) : (
                <div className="card soft">
                  <button className="btn primary" onClick={placeOrder}>
                    Commander
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
