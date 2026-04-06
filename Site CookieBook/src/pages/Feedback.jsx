import React, { useState } from "react";

export default function Feedback() {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const send = (e) => {
    e.preventDefault();
    setSent(true);
    setMsg("");
  };

  return (
    <div className="stack gap-xl">
      <section className="card">
        <h1>Commentaires / Suggestions</h1>
        <p className="muted">Une page simple pour récupérer l’avis des clients.</p>
      </section>

      <section className="card">
        <form className="stack gap" onSubmit={send}>
          <label className="label">
            Ton message
            <textarea
              className="textarea"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={5}
              placeholder="Écris ta suggestion..."
              required
            />
          </label>
          <button className="btn primary" type="submit">Envoyer</button>
          {sent && <div className="success">Merci ! Message envoyé ✅ (simulation)</div>}
        </form>
      </section>
    </div>
  );
}

