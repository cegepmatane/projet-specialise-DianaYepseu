import React from "react";
import { useNavigate } from "react-router-dom";
import { formatCAD, useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const nav = useNavigate();
  const { items, subtotal, removeItem } = useCart();

  return (
    <div className="stack gap-xl">
      <section className="card">
        <h1>Panier</h1>
        <p className="muted">Tu peux éditer un article (retour à la page produit) ou l’enlever.</p>
      </section>

      <section className="card">
        {items.length === 0 ? (
          <div className="stack gap">
            <div className="muted">Ton panier est vide.</div>
            <button className="btn primary" onClick={() => nav("/menu")}>
              Aller au menu
            </button>
          </div>
        ) : (
          <div className="stack gap">
            {items.map((it) => (
              <div key={it.id} className="cart-row">
                <img className="cart-thumb" src={it.image} alt={it.name} />
                <div className="cart-mid">
                  <div className="strong">{it.name}</div>
                  <div className="muted small">
                    {it.categoryName} • {it.selectionLabel}
                  </div>
                  {it.extrasLabel?.length > 0 && (
                    <div className="muted small">Extras: {it.extrasLabel.join(", ")}</div>
                  )}
                  {it.notes && <div className="muted small">Notes: {it.notes}</div>}
                </div>

                <div className="cart-right">
                  <div className="strong">{formatCAD(it.totalPrice)}</div>
                  <div className="row gap">
                    {/* ✅ EDIT = retour page produit avec state */}
                    <button
                      className="btn tiny"
                      onClick={() =>
                        nav(`/menu/${it.categoryId}/${it.productId}`, {
                          state: { editItemId: it.id },
                        })
                      }
                    >
                      Éditer
                    </button>

                    <button className="btn tiny danger" onClick={() => removeItem(it.id)}>
                      Enlever
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="divider" />

            <div className="row between">
              <div className="strong">Sous-total</div>
              <div className="strong">{formatCAD(subtotal)}</div>
            </div>

            <div className="row gap">
              <button className="btn" onClick={() => nav("/menu")}>
                Retour au menu
              </button>
              <button className="btn primary" onClick={() => nav("/paiement")}>
                Continuer
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
