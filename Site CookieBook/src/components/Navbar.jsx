import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { CATEGORIES } from "../data/catalog.js";
import { useAuth } from "../context/AuthContext";
export default function Navbar() {
  const nav = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const { count, items } = useCart();
  const { user } = useAuth();
  const topLinks = useMemo(
    () => [
      { to: "/", label: "Accueil" },
      { to: "/menu", label: "Menu" },
      { to: "/promotions", label: "Promotions" },
      { to: "/construire-une-boite", label: "Construire une boîte" },
      { to: "/commentaires", label: "Commentaires" },
      { to: "/mission", label: "Mission" },
    ],
    []
  );

  const allProducts = useMemo(() => {
    return CATEGORIES.flatMap((cat) =>
      (cat.products || []).map((p) => ({
        ...p,
        categoryId: cat.id,
        categoryName: cat.name,
        to: `/menu/${cat.id}/${p.id}`,
      }))
    );
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return allProducts
      .filter((p) => (p.name || "").toLowerCase().includes(s))
      .slice(0, 8);
  }, [q, allProducts]);

  useEffect(() => {
    const on = menuOpen || cartOpen || searchOpen;
    document.body.classList.toggle("no-scroll", on);
    return () => document.body.classList.remove("no-scroll");
  }, [menuOpen, cartOpen, searchOpen]);

  const closeAll = () => {
    setMenuOpen(false);
    setCartOpen(false);
    setSearchOpen(false);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setMenuOpen(false);
    setCartOpen(false);
    setTimeout(() => {
      const el = document.getElementById("nav-search-input");
      if (el) el.focus();
    }, 50);
  };

  const openCart = () => {
    setCartOpen(true);
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const openMenu = () => {
    setMenuOpen(true);
    setCartOpen(false);
    setSearchOpen(false);
  };

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <div className="nav-left">
            <button
              className="icon-btn hamburger"
              aria-label="Ouvrir le menu"
              onClick={openMenu}
              type="button"
            >
              ☰
            </button>

            <button
              className="icon-btn search-btn"
              aria-label="Rechercher"
              onClick={openSearch}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
                width="24"
                height="24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </div>

          <div className="nav-center">
            <Link to="/" className="brand" onClick={closeAll}>
              CookieBook
            </Link>
          </div>

          <nav className="nav-links" aria-label="Navigation principale">
           <button
              className="icon-btn search-btn"
              aria-label="Rechercher"
              onClick={openSearch}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
                width="24"
                height="24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
            {topLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className="navlink">
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-right">
           <button
            className="icon-btn account-btn"
            aria-label="Compte"
            type="button"
            onClick={() => {
              closeAll();
              nav("/compte");
            }}
          >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
                width="24"
                height="24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </button>

           <button
            className="cart-chip"
            onClick={openCart}
            aria-label="Panier"
            type="button"
          >
            <div className="cart-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
              >
                <g fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" d="M8 12V8a4 4 0 0 1 4-4 4 4 0 0 1 4 4v4"/>
                  <path d="M3.694 12.668c.145-1.741.218-2.611.792-3.14C5.06 9 5.934 9 7.681 9h8.639c1.746 0 2.62 0 3.194.528c.574.528.647 1.399.792 3.14l.514 6.166c.084 1.013.126 1.52-.17 1.843c-.298.323-.806.323-1.824.323H5.174c-1.017 0-1.526 0-1.823-.323c-.297-.323-.255-.83-.17-1.843z"/>
                </g>
              </svg>

              {count > 0 && (
                <span className="cart-count">{count}</span>
              )}
            </div>
          </button>
          </div>
        </div>
      </header>

      <div
        className={`overlay ${menuOpen || cartOpen ? "show" : ""}`}
        onClick={closeAll}
        role="presentation"
      />

      <aside
        className={`drawer left ${menuOpen ? "open" : ""}`}
        aria-label="Menu latéral"
      >
        <div className="drawer-head">
          <div className="drawer-title">Menu</div>
          <button
            className="icon-btn"
            onClick={closeAll}
            aria-label="Fermer"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="drawer-body">
          <button className="drawer-search" onClick={openSearch} type="button">
            🔍 Rechercher un produit…
          </button>

          <div className="drawer-section">
            <div className="drawer-label">Pages</div>
            <div className="drawer-links">
              {topLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className="drawer-link"
                  onClick={closeAll}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="drawer-section">
            <div className="drawer-label">Catégories</div>
            <div className="drawer-links">
              {CATEGORIES.map((c) => (
                <NavLink
                  key={c.id}
                  to={`/menu/${c.id}`}
                  className="drawer-link"
                  onClick={closeAll}
                >
                  {c.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <aside
        className={`drawer right ${cartOpen ? "open" : ""}`}
        aria-label="Panier latéral"
      >
        <div className="drawer-head">
          <div className="drawer-title">Panier</div>
          <button
            className="icon-btn"
            onClick={closeAll}
            aria-label="Fermer"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {count === 0 ? (
            <p className="muted">Votre panier est vide.</p>
          ) : (
            <>
              {Array.isArray(items) && items.length > 0 ? (
                <div className="cart-mini">
                  {items.slice(0, 6).map((it) => (
                    <div key={it.id} className="cart-mini-row">
                      <div className="cart-mini-name">{it.name}</div>
                      <div className="cart-mini-qty">× {it.quantity}</div>
                    </div>
                  ))}
                  {items.length > 6 && <div className="muted small">…</div>}
                </div>
              ) : (
                <p className="muted small">
                  (Aperçu indisponible — ouvre la page panier)
                </p>
              )}
            </>
          )}

          <div className="drawer-actions">
            <button
              className="btn primary"
              onClick={() => {
                closeAll();
                nav("/panier");
              }}
              type="button"
            >
              Voir le panier
            </button>

            <button className="btn" onClick={closeAll} type="button">
              Continuer
            </button>
          </div>
        </div>
      </aside>

      {searchOpen && (
        <div
          className="searchModal"
          role="dialog"
          aria-modal="true"
          aria-label="Recherche"
        >
          <div className="searchCard">
            <div className="searchTop">
              <div className="searchInputWrap">
                <span className="muted">🔎</span>
                <input
                  id="nav-search-input"
                  className="searchInput"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher"
                />
              </div>

              <button
                className="icon-btn"
                onClick={closeAll}
                aria-label="Fermer"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="searchBody">
              {!q.trim() ? (
                <div className="muted small">
                  Tape le nom d’un cookie (ex: “Nutella”).
                </div>
              ) : results.length === 0 ? (
                <div className="muted small">Aucun résultat.</div>
              ) : (
                <>
                  <div className="drawer-label" style={{ marginBottom: 10 }}>
                    Produits
                  </div>

                  <div className="searchGrid">
                    {results.map((p) => (
                      <button
                        key={`${p.categoryId}:${p.id}`}
                        className="searchItem"
                        onClick={() => {
                          closeAll();
                          setQ("");
                          nav(p.to);
                        }}
                        type="button"
                      >
                        <img className="searchImg" src={p.image} alt={p.name} />
                        <div className="searchMeta">
                          <div className="searchName">{p.name}</div>
                          <div className="muted small">{p.categoryName}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="searchFooter">
              <button className="btn" onClick={closeAll} type="button">
                Fermer
              </button>

              <button
                className="btn primary"
                onClick={() => {
                  closeAll();
                  nav("/menu");
                }}
                type="button"
              >
                Tout afficher
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
