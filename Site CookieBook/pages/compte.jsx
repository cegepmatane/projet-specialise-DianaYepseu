import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { uid, useCart } from "../context/CartContext.jsx";

export default function Account() {
  const nav = useNavigate();
  const { user, loading, logout } = useAuth();
  const { addItem } = useCart();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setPageLoading(false);
        return;
      }

      try {
        setError("");

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile(data);
          setForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
            address: data.address || "",
          });
        } else {
          setProfile(null);
        }

        try {
          const q = query(
            collection(db, "orders"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );

          const snap = await getDocs(q);
          setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (ordersError) {
          console.error("Erreur historique commandes :", ordersError);
          setOrders([]);
        }
      } catch (err) {
        console.error("Erreur chargement compte :", err);
        setError("Impossible de charger les informations du compte.");
      } finally {
        setPageLoading(false);
      }
    };

    if (!loading) {
      loadData();
    }
  }, [user, loading]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
      });

      setProfile((prev) => ({
        ...prev,
        ...form,
      }));
      setEditMode(false);
    } catch (err) {
      console.error("Erreur mise à jour profil :", err);
      setError("Impossible d’enregistrer les modifications.");
    }
  };

  const rebuy = (order) => {
    if (!order.items?.length) return;

    order.items.forEach((item) => {
      addItem({
        id: uid(),
        ...item,
      });
    });

    nav("/panier");
  };

  const handleLogout = async () => {
    try {
      await logout();
      nav("/connexion", { replace: true });
    } catch (err) {
      console.error("Erreur déconnexion :", err);
    }
  };

  if (loading || pageLoading) {
    return <section className="card">Chargement...</section>;
  }

  if (!user) {
    return <section className="card">Session non trouvée.</section>;
  }

  return (
    <div className="stack gap-xl">
      <section className="card">
        <div className="row between">
          <div>
            <h1>Mon compte</h1>
            <p className="muted">
              Gère tes informations et retrouve tes anciennes commandes.
            </p>
          </div>
          <button className="btn" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </section>

      {error && (
        <section className="card">
          <p className="muted">{error}</p>
        </section>
      )}

      <section className="card">
        <div className="row between">
          <h2>Mes informations</h2>
          {!editMode ? (
            <button className="btn" onClick={() => setEditMode(true)}>
              Modifier
            </button>
          ) : (
            <button className="btn primary" onClick={saveProfile}>
              Enregistrer
            </button>
          )}
        </div>

        {editMode ? (
          <div className="stack gap">
            <label className="label">
              Prénom
              <input
                className="input"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
              />
            </label>

            <label className="label">
              Nom
              <input
                className="input"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
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
          </div>
        ) : profile ? (
          <div className="stack gap">
            <p><strong>Prénom :</strong> {profile.firstName}</p>
            <p><strong>Nom :</strong> {profile.lastName}</p>
            <p><strong>Email :</strong> {profile.email}</p>
            <p><strong>Téléphone :</strong> {profile.phone}</p>
            <p><strong>Adresse :</strong> {profile.address}</p>
          </div>
        ) : (
          <p className="muted">Aucune donnée utilisateur.</p>
        )}
      </section>

      <section className="card">
        <h2>Historique des achats</h2>

        {orders.length === 0 ? (
          <p className="muted">Tu n’as encore aucune commande.</p>
        ) : (
          <div className="stack gap">
            {orders.map((order) => (
              <div key={order.id} className="card soft">
                <div className="row between">
                  <div>
                    <p><strong>Total :</strong> {order.total} $</p>
                    <p className="small muted">Commande : {order.id}</p>
                  </div>
                  <button
                    className="btn primary"
                    onClick={() => rebuy(order)}
                  >
                    Racheter
                  </button>
                </div>

                <div className="stack gap">
                  {order.items?.map((item, index) => (
                    <div key={index} className="row between">
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
