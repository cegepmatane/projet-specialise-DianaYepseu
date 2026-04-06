import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // On initialise l'utilisateur à null
  const [user, setUser] = useState(null);
  // On commence avec loading à true pour attendre la réponse de Firebase
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged est asynchrone, il faut attendre son premier retour
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // La vérification est terminée, on libère l'accès
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading, // On passe directement le boolean loading
        logout,
      }}
    >
      {/* On peut choisir de ne pas afficher les enfants tant que c'est en chargement
          pour éviter des flashs de contenu non autorisé */}
      {!loading ? children : <div className="loading-screen">Chargement...</div>}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }

  return value;
}
