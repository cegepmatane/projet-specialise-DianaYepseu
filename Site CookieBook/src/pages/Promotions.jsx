import React from "react";

export default function Promotions() {
  return (
    <div className="stack gap-xl">
      <section className="card">
        <h1>Promotions</h1>
        <p className="muted">
          Ici tu peux afficher tes promos (ex: “2 boîtes achetées = livraison -50%”).
        </p>
      </section>

      <section className="card">
        <h2>Exemples</h2>
        <ul className="muted">
          <li>🎁 Boîte de 12 cookies: topping offert</li>
          <li>🚚 Livraison réduite à partir de 40$</li>
          <li>✨ Offre du weekend: -10% sur tiramisu Oreo</li>
        </ul>
      </section>
    </div>
  );
}

