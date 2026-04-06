import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ProtectedRoute.jsx
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Tant que Firebase vérifie la session, on ne bouge pas
  if (loading) {
    return <div className="loading-screen">Chargement...</div>;
  }

  // Si c'est fini et que personne n'est connecté, direction connexion
  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  return children;
}
