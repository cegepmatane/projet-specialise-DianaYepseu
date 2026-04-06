import React from "react";
import { useNavigate } from "react-router-dom";

export default function Annule() {
  const nav = useNavigate();
  return (
    <div className="card">
      <h1>Paiement annulé</h1>
      <p className="muted">Tu peux revenir au panier et réessayer quand tu veux.</p>
      <button className="btn" onClick={() => nav("/panier")}>Retour au panier</button>
    </div>
  );
}
