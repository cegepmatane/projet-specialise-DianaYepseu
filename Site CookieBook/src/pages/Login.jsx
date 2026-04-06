import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      nav("/compte", { replace: true });
    }
  }, [user, loading, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      nav("/compte", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Email ou mot de passe invalide.");
    }
  };

  if (loading) {
    return <section className="card">Chargement...</section>;
  }

  return (
    <div className="stack gap-xl">
      <section className="card">
        <h1>Connexion</h1>
      </section>

      <section className="card">
        <form className="stack gap" onSubmit={handleSubmit}>
          <label className="label">
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="label">
            Mot de passe
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="muted">{error}</p>}

          <div className="row gap">
            <button className="btn primary" type="submit">
              Se connecter
            </button>
            <Link className="btn" to="/inscription">
              Créer un compte
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
