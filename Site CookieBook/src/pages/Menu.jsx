import React from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../data/catalog.js";

export default function Menu() {
  const nav = useNavigate();

  return (
    <div className="stack gap-xl">
      <section className="card">
        <h1>Menu Cookies</h1>
        <p className="muted">
          Choisis une catégorie, puis sélectionne ton cookie et personnalise ta boîte.
        </p>
      </section>

      <section className="grid-2">
        {CATEGORIES.map((c) => (
          <button key={c.id} className="category-card card" onClick={() => nav(`/menu/${c.id}`)}>
            <div className="category-media">
              <img src={c.image} alt={c.name} />
              <div className="pill">
                {c.heroEmoji} {c.name}
              </div>
            </div>
            <div className="category-body">
              <div className="category-title">{c.name}</div>
              <div className="muted">{c.description}</div>
              <div className="linkish">Voir les cookies →</div>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
