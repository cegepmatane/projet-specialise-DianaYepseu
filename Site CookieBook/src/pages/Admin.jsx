import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

function formatMoney(value) {
  return `${Number(value || 0).toFixed(2)} $`;
}

export default function Admin() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";

  useEffect(() => {
    if (!isAuth) return;

    const loadOrders = async () => {
      try {
        setLoading(true);

        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        setOrders(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((order) => Number(order.total) > 0)
        );
      } catch (error) {
        console.error("Erreur chargement commandes :", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuth]);

  if (!isAuth) {
    return (
      <div className="card" style={{ maxWidth: "400px", margin: "100px auto" }}>
        <h2>Accès Admin</h2>

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          style={{ marginTop: "10px" }}
        />

        <button
          className="btn primary"
          style={{ marginTop: "10px" }}
          onClick={() => {
            if (password.trim() === ADMIN_PASSWORD.trim()) {
              setIsAuth(true);
            } else {
              alert("Mot de passe incorrect");
            }
          }}
        >
          Entrer
        </button>
      </div>
    );
  }

  if (loading) {
    return <section className="card">Chargement...</section>;
  }

  return (
    <div className="stack gap-xl">
      <section className="card">
        <h1>Administration</h1>
      </section>

      <section className="card">
        <h2>Commandes</h2>

        {orders.length === 0 ? (
          <p className="muted">Aucune commande</p>
        ) : (
          <div className="stack gap">
            {orders.map((order) => (
              <div key={order.id} className="card soft">
                <div className="row between">
                  <h3>Commande #{order.id.slice(0, 8)}</h3>
                  <strong>{formatMoney(order.total)}</strong>
                </div>

                <p><strong>Client :</strong> {order.customerName || "Non précisé"}</p>
                <p><strong>Email :</strong> {order.email || "Non précisé"}</p>
                <p><strong>Téléphone :</strong> {order.phone || "Non précisé"}</p>

                <p>
                  <strong>Type :</strong>{" "}
                  {order.preference === "delivery" ? "Livraison" : "Emporter"}
                </p>

                {order.preference === "pickup" && (
                  <p>
                    <strong>Adresse de récupération :</strong>{" "}
                    {order.pickupShop?.address || order.address || "Non précisée"}
                  </p>
                )}

                {order.preference === "delivery" && (
                  <p>
                    <strong>Adresse de livraison :</strong>{" "}
                    {order.address || "Non précisée"}
                  </p>
                )}

                <div>
                  <strong>Produits :</strong>

                  {order.items?.map((item, i) => (
                    <div key={i} style={{ marginTop: "10px" }}>
                      <p><strong>{item.name}</strong></p>

                      {item.size && (
                        <p><strong>Taille :</strong> {item.size}</p>
                      )}

                      <p><strong>Quantité :</strong> {item.quantity}</p>
                      <p><strong>Prix :</strong> {formatMoney(item.totalPrice)}</p>

                      {item.selectedCookies && item.selectedCookies.length > 0 && (
                        <div>
                          <p><strong>Composition exacte de la boîte :</strong></p>
                          <ul>
                            {item.selectedCookies.map((c, j) => (
                              <li key={j}>
                                {c.name} — x{c.quantity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
