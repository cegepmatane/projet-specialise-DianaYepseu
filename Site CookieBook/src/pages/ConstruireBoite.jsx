import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../data/catalog.js";
import { formatCAD, uid, useCart } from "../context/CartContext.jsx";

function round2(n) {
  return Math.round(n * 100) / 100;
}

const BOX_OPTIONS = [
  { id: "box6", label: "Boîte de 6", items: 6, multiplier: 1.0, badge: "Classique" },
  { id: "box9", label: "Boîte de 9", items: 9, multiplier: 0.98, badge: "-2%" },
  { id: "box12", label: "Boîte de 12", items: 12, multiplier: 0.95, badge: "-5%" },
];

export default function ConstruireBoite() {
  const nav = useNavigate();
  const { addItem } = useCart();

  const [boxId, setBoxId] = useState(BOX_OPTIONS[0].id);
  const [pick, setPick] = useState({});

  const box = useMemo(() => BOX_OPTIONS.find((b) => b.id === boxId), [boxId]);

  const products = useMemo(() => {
    return CATEGORIES.flatMap((cat) =>
      (cat.products || []).map((p) => ({
        ...p,
        categoryId: cat.id,
        categoryName: cat.name,
        key: `${cat.id}:${p.id}`,
      }))
    );
  }, []);

  const pickedCount = useMemo(() => {
    return Object.values(pick).reduce((s, q) => s + (q || 0), 0);
  }, [pick]);

  const maxCount = box.items;
  const canAddMore = pickedCount < maxCount;

  const increment = (key) => {
    setPick((prev) => {
      const currentCount = Object.values(prev).reduce((s, q) => s + (q || 0), 0);
      if (currentCount >= maxCount) return prev;
      return { ...prev, [key]: (prev[key] || 0) + 1 };
    });
  };

  const decrement = (key) => {
    setPick((prev) => {
      const next = { ...prev };
      const q = next[key] || 0;
      if (q <= 1) delete next[key];
      else next[key] = q - 1;
      return next;
    });
  };

  const selectionList = useMemo(() => {
    const list = [];
    for (const p of products) {
      const q = pick[p.key] || 0;
      if (q > 0) list.push({ ...p, qty: q });
    }
    return list;
  }, [products, pick]);

  const subtotal = useMemo(() => {
    const s = selectionList.reduce((sum, it) => sum + (it.price || 0) * it.qty, 0);
    return round2(s * (box.multiplier || 1));
  }, [selectionList, box]);

  const progressPct = Math.min(100, Math.round((pickedCount / maxCount) * 100));

  const reset = () => setPick({});

  const addToCart = () => {
    if (pickedCount !== maxCount) return;

    const selectedCookies = selectionList.map((x) => ({
      id: x.id,
      name: x.name,
      categoryId: x.categoryId,
      categoryName: x.categoryName,
      quantity: x.qty,
      price: x.price,
      image: x.image || "",
    }));

    const description = selectedCookies
      .map((cookie) => `${cookie.name} x${cookie.quantity}`)
      .join(", ");

    addItem({
      id: uid(),
      categoryId: "boite",
      categoryName: "Boîte personnalisée",
      productId: box.id,
      name: `${box.label} personnalisée`,
      image: selectionList[0]?.image || CATEGORIES[0]?.image || "",
      unitPrice: subtotal,
      price: subtotal,
      quantity: 1,
      selectionLabel: `${pickedCount}/${maxCount} cookies`,
      totalPrice: subtotal,
      description,

      // ✅ très important pour Checkout/Admin
      selectedCookies,
      boxDetails: {
        id: box.id,
        label: box.label,
        items: box.items,
        multiplier: box.multiplier,
        badge: box.badge,
      },
      size: box.label,

      // tu peux garder meta aussi si tu veux l’utiliser ailleurs
      meta: {
        box,
        picks: selectionList.map((x) => ({
          id: x.id,
          name: x.name,
          categoryId: x.categoryId,
          qty: x.qty,
          price: x.price,
          image: x.image || "",
        })),
      },
    });

    nav("/panier");
  };

  return (
    <div className="stack gap-xl">
      <section className="card">
        <div className="row between" style={{ flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1>Construire une boîte</h1>
            <p className="muted">
              Choisis une taille, sélectionne {maxCount} cookies, puis ajoute la boîte au panier.
            </p>
          </div>
          <div className="row gap" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => nav("/menu")}>
              Voir le menu
            </button>
            <button className="btn tiny danger" onClick={reset}>
              Réinitialiser
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>1) Taille de la boîte</h2>
        <div className="buildBoxSizes">
          {BOX_OPTIONS.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`buildSize ${b.id === boxId ? "active" : ""}`}
              onClick={() => setBoxId(b.id)}
            >
              <div className="buildSizeTop">
                <div className="strong">{b.label}</div>
                <span className="buildBadge">{b.badge}</span>
              </div>
              <div className="muted small">{b.items} cookies au total</div>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="row between" style={{ flexWrap: "wrap", gap: 10 }}>
          <h2>2) Sélectionne tes cookies</h2>
          <div className="buildCounter">
            <span className="strong">{pickedCount}</span>
            <span className="muted"> / {maxCount}</span>
          </div>
        </div>

        <div className="buildProgress">
          <div className="buildProgressBar" style={{ width: `${progressPct}%` }} />
        </div>

        {!canAddMore && (
          <div className="card soft" style={{ marginTop: 12 }}>
            <div className="success">✅ Boîte complète !</div>
            <div className="muted small">Tu peux maintenant ajouter au panier.</div>
          </div>
        )}

        <div className="buildGrid" style={{ marginTop: 14 }}>
          {products.map((p) => {
            const q = pick[p.key] || 0;
            return (
              <div key={p.key} className="buildCard">
                <img className="buildImg" src={p.image} alt={p.name} />
                <div className="buildBody">
                  <div className="row between" style={{ gap: 10 }}>
                    <div>
                      <div className="strong">{p.name}</div>
                      <div className="muted small">{p.categoryName}</div>
                    </div>
                    <div className="strong">{formatCAD(p.price)}</div>
                  </div>

                  <div className="row between" style={{ marginTop: 10 }}>
                    <div className="muted small">
                      {q > 0 ? `Ajouté: x${q}` : "—"}
                    </div>
                    <div className="row gap">
                      <button
                        className="btn tiny"
                        onClick={() => decrement(p.key)}
                        disabled={q === 0}
                      >
                        −
                      </button>
                      <button
                        className="btn tiny primary"
                        onClick={() => increment(p.key)}
                        disabled={!canAddMore}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card buildSummary">
        <div className="row between" style={{ flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="muted small">Résumé</div>
            <div className="strong">
              {box.label} • {pickedCount}/{maxCount}
            </div>
          </div>

          <div className="row gap" style={{ flexWrap: "wrap" }}>
            <div className="strong big">{formatCAD(subtotal)}</div>
            <button
              className="btn primary"
              onClick={addToCart}
              disabled={pickedCount !== maxCount}
              title={pickedCount !== maxCount ? `Il manque ${maxCount - pickedCount} cookie(s)` : ""}
            >
              Ajouter la boîte au panier
            </button>
          </div>
        </div>

        {selectionList.length > 0 && (
          <div className="buildMiniList">
            {selectionList.map((x) => (
              <span key={x.key} className="buildChip">
                {x.name} × {x.qty}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
