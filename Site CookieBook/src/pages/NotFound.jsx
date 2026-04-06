import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const nav = useNavigate();
  return (
    <section className="card">
      <h1>Page introuvable</h1>
      <button className="btn" onClick={() => nav("/")}>Retour accueil</button>
    </section>
  );
}

