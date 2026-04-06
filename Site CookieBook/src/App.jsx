import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Choices from "./pages/Choices.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Promotions from "./pages/Promotions.jsx";
import Feedback from "./pages/Feedback.jsx";
import About from "./pages/About.jsx";
import ConstruireBoite from "./pages/ConstruireBoite.jsx";
import NotFound from "./pages/NotFound.jsx";
import Succes from "./pages/Succes.jsx";
import Annule from "./pages/Annule.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Account from "./pages/Account.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <div className="wrap">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/commentaires" element={<Feedback />} />
            <Route path="/mission" element={<About />} />

            <Route path="/menu/:categoryId" element={<Choices />} />
            <Route path="/menu/:categoryId/:productId" element={<ProductDetails />} />

            <Route path="/panier" element={<Cart />} />
            <Route path="/paiement" element={<Checkout />} />
            <Route path="/construire-une-boite" element={<ConstruireBoite />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            <Route
              path="/compte"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route path="/succes" element={<Succes />} />
            <Route path="/annule" element={<Annule />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />

            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}
