import React from "react";

export default function About() {
  return (
    <div className="stack gap-xl">
      <section className="card">
        <h1>Mission de la boutique</h1>
        <p className="muted">
          Ici tu mets la description/mission (comme tu l’as noté).
        </p>
      </section>

      <section className="card">
        <h2>Notre promesse</h2>
        <p className="muted">
          Des recettes généreuses, faites maison, préparées sur commande, avec une vraie attention
          aux goûts et à la qualité.
        </p>
      </section>
    </div>
  );
}

