import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const { user, loading } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      nav("/compte", { replace: true });
    }
  }, [user, loading, nav]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await setPersistence(auth, browserLocalPersistence);

      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        role: "user",
        createdAt: serverTimestamp(),
      });

      nav("/compte", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Impossible de créer le compte.");
    }
  };

  if (loading) {
    return <section className="card">Chargement...</section>;
  }

  return (
    <div className="stack gap-xl">
      <section className="card">
        <h1>Inscription</h1>
      </section>

      <section className="card">
        <form className="stack gap" onSubmit={handleSubmit}>
          <label className="label">
            Prénom
            <input
              className="input"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
          </label>

          <label className="label">
            Nom
            <input
              className="input"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </label>

          <label className="label">
            Email
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </label>

          <label className="label">
            Téléphone
            <input
              className="input"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </label>

          <label className="label">
            Adresse
            <input
              className="input"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </label>

          <label className="label">
            Mot de passe
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
          </label>

          <label className="label">
            Confirmer le mot de passe
            <input
              className="input"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              required
            />
          </label>

          {error && <p className="muted">{error}</p>}

          <div className="row gap">
            <button className="btn primary" type="submit">
              Créer mon compte
            </button>
            <Link className="btn" to="/connexion">
              Déjà un compte ?
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
