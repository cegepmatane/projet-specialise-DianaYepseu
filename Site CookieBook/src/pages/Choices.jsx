import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategory } from "../data/catalog.js";

export default function Choices() {
  const { categoryId } = useParams(); // ✅ ton App.jsx utilise /menu/:categoryId
  const nav = useNavigate();

  const cat = getCategory(categoryId);

  if (!cat) {
    return (
      <section className="card">
        <h1>Catégorie introuvable</h1>
        <button className="btn" onClick={() => nav("/menu")}>Retour au menu</button>
      </section>
    );
  }

  return (
    <div className="stack gap-xl">
      <section className="card hero-slim">
        <div>
          <h1>
            {cat.heroEmoji} {cat.name}
          </h1>
          <p className="muted">{cat.choicesIntro}</p>
          <button className="btn" onClick={() => nav("/menu")}>← Retour</button>
        </div>
        <img className="hero-slim-img" src={cat.image} alt={cat.name} />
      </section>

      <section className="grid-2">
        {cat.products.map((p) => (
          <button
            key={p.id}
            className="product-card card"
            onClick={() => nav(`/menu/${cat.id}/${p.id}`)}
          >
            <div className="product-media">
              <img src={p.image} alt={p.name} />
            </div>
            <div className="product-body">
              <div className="product-title">{p.name}</div>
              <div className="muted small">Clique pour personnaliser →</div>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
