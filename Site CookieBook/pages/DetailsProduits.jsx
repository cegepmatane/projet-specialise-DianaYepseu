import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { EXTRAS, getCategory, getProduct } from "../data/catalog.js";
import QuantityPicker from "../components/QuantityPicker.jsx";
import { formatCAD, uid, useCart } from "../context/CartContext.jsx";
import Swal from "sweetalert2";

function round2(n) {
  return Math.round(n * 100) / 100;
}

export default function ProductDetails() {
  const { categoryId, productId } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  const { items, addItem, updateItem } = useCart();

  const cat = getCategory(categoryId);
  const product = getProduct(categoryId, productId);

  // ✅ si on vient du panier
  const editItemId = location.state?.editItemId ?? null;
  const editingItem = editItemId ? items.find((x) => x.id === editItemId) : null;

  const [extras, setExtras] = useState([]);
  const [notes, setNotes] = useState("");

  const [boxSizeIdx, setBoxSizeIdx] = useState(0);
  const [boxCount, setBoxCount] = useState(1);

  const basePrice = product?.price ?? 0;

  // ✅ Pré-remplir quand on édite
  useEffect(() => {
    if (!editingItem || !cat) return;

    setExtras(editingItem.extras ?? []);
    setNotes(editingItem.notes ?? "");

    const itemsPerBox = editingItem.meta?.itemsPerBox;
    if (itemsPerBox) {
      const idx = cat.boxSizes.findIndex((b) => b.items === itemsPerBox);
      setBoxSizeIdx(idx >= 0 ? idx : 0);
    } else {
      setBoxSizeIdx(0);
    }

    setBoxCount(editingItem.meta?.boxes ?? editingItem.quantity ?? 1);
  }, [editingItem, cat]);

  const extrasPerItem = useMemo(() => {
    return round2(
      extras.reduce((sum, id) => sum + (EXTRAS.find((e) => e.id === id)?.price ?? 0), 0)
    );
  }, [extras]);

  const computed = useMemo(() => {
    if (!cat || !product) return { total: 0, label: "", quantity: 1, meta: null };

    const chosen = cat.boxSizes?.[boxSizeIdx] ?? cat.boxSizes?.[0];
    const perBox = round2(basePrice * chosen.items + extrasPerItem * chosen.items);
    const perBoxWithMultiplier = round2(perBox * (chosen.priceMultiplier ?? 1));
    const total = round2(perBoxWithMultiplier * boxCount);

    return {
      total,
      label: `${chosen.label} × ${boxCount}`,
      quantity: boxCount,
      meta: { box: chosen, boxes: boxCount, itemsPerBox: chosen.items },
    };
  }, [cat, product, basePrice, extrasPerItem, boxSizeIdx, boxCount]);

  if (!cat || !product) {
    return (
      <section className="card">
        <h1>Cookie introuvable</h1>
        <button className="btn" onClick={() => nav("/menu")}>
          Retour au menu
        </button>
      </section>
    );
  }

  const toggleExtra = (id) => {
    setExtras((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const validateBoxCount = async () => {
    const min = 1;
    const max = 30;

    if (!Number.isFinite(Number(boxCount)) || Number(boxCount) < min || Number(boxCount) > max) {
      await Swal.fire({
        icon: "error",
        title: "Quantité invalide",
        text: `Le nombre de boîtes doit être entre ${min} et ${max}.`,
        confirmButtonColor: "#ff3b6b",
      });
      return false;
    }
    return true;
  };

  const onSave = async () => {
    const ok = await validateBoxCount();
    if (!ok) return;

    const payload = {
      categoryId: cat.id,
      categoryName: cat.name,
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: basePrice,
      extras,
      extrasLabel: extras.map((id) => EXTRAS.find((e) => e.id === id)?.label).filter(Boolean),
      notes,
      quantity: computed.quantity,
      selectionLabel: computed.label,
      totalPrice: computed.total,
      meta: computed.meta,
    };

    // ✅ si édition : confirmer avant update
    if (editItemId && editingItem) {
      const res = await Swal.fire({
        icon: "question",
        title: "Enregistrer les changements ?",
        text: "Ton article dans le panier sera mis à jour.",
        showCancelButton: true,
        confirmButtonText: "Oui, enregistrer",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#ff3b6b",
      });

      if (!res.isConfirmed) return;

      updateItem(editItemId, payload);

      await Swal.fire({
        icon: "success",
        title: "Article mis à jour ✅",
        text: "Ton panier a été mis à jour.",
        confirmButtonColor: "#ff3b6b",
      });

      nav("/panier");
      return;
    }

    // ✅ sinon : ajout normal
    addItem({ id: uid(), ...payload });

    await Swal.fire({
      icon: "success",
      title: "Ajouté au panier ✅",
      text: "Ton cookie a été ajouté au panier.",
      confirmButtonColor: "#ff3b6b",
    });

    nav("/panier");
  };

  return (
    <div className="stack gap-xl">
      <section className="card details">
        <div className="details-media">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="details-body">
          <h1>
            {cat.heroEmoji} {product.name}
          </h1>
          <p className="muted">{cat.name}</p>

          {editItemId && (
            <div className="card soft">
              <div className="strong">Mode édition</div>
              <div className="muted small">Tu modifies l’article déjà présent dans le panier.</div>
            </div>
          )}

          <div className="card soft">
            <div className="section-title">Options (ajout d’ingrédients)</div>
            <div className="checks">
              {EXTRAS.map((e) => (
                <label key={e.id} className="check">
                  <input
                    type="checkbox"
                    checked={extras.includes(e.id)}
                    onChange={() => toggleExtra(e.id)}
                  />
                  <span>{e.label}</span>
                  <span className="muted small">{formatCAD(e.price)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card soft">
            <div className="section-title">Instructions spécifiques</div>
            <textarea
              className="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: pas de noix / extra coulis / message..."
              rows={4}
            />
          </div>

          <div className="card soft">
            <div className="section-title">Quantités (boîtes)</div>

            <label className="label">
              Quantité dans une boîte
              <select
                className="select"
                value={boxSizeIdx}
                onChange={(e) => setBoxSizeIdx(Number(e.target.value))}
              >
                {cat.boxSizes.map((b, idx) => (
                  <option key={b.label} value={idx}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="row between">
              <div className="muted">Nombre de boîtes</div>
              <QuantityPicker value={boxCount} onChange={setBoxCount} min={1} max={30} />
            </div>
          </div>

          <div className="card soft">
            <div className="row between">
              <div>
                <div className="muted small">Sélection</div>
                <div className="strong">{computed.label}</div>
              </div>
              <div className="strong big">{formatCAD(computed.total)}</div>
            </div>

            <div className="row gap">
              <button
                className="btn"
                onClick={() => (editItemId ? nav("/panier") : nav(`/menu/${cat.id}`))}
              >
                {editItemId ? "Retour au panier" : "Retour"}
              </button>

              <button className="btn primary" onClick={onSave}>
                {editItemId ? "Enregistrer" : "Ajouter au panier"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
