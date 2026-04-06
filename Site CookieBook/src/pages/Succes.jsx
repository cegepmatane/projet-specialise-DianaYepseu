import React from "react";
import { useNavigate } from "react-router-dom";

export default function Succes() {
  const nav = useNavigate();
  return (
    <div className="card">
      <h1>Paiement confirmé ✅</h1>
      <p className="muted">Merci ! Ton paiement est passé en mode test.</p>
      <button className="btn primary" onClick={() => nav("/")}>Retour à l’accueil</button>
    </div>
  );
}
