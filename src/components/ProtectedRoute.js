import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/userContext";

// Route protégée
const ProtectedRoute = ({ children }) => {
  const { currentUser, loadingData } = useContext(UserContext);

  if (loadingData) {
    return <div>Chargement...</div>; // Affiche un loader pendant la vérification
  }

  // Redirige vers /login si l'utilisateur n'est pas connecté
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children; // Affiche le contenu de la route protégée
};

export default ProtectedRoute;