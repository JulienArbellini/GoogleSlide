import { createContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Création du contexte utilisateur
export const UserContext = createContext();

export function UserContextProvider(props) {
  const [currentUser, setCurrentUser] = useState(null); // Utilisateur actuel
  const [loadingData, setLoadingData] = useState(true); // Loader pour les données
  const [presentations, setPresentations] = useState([]); // Liste des présentations

  const navigate = useNavigate(); // Navigation avec React Router

  // Fonction d'inscription
  const signUp = async (email, pwd) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
      const user = userCredential.user;

      // Enregistre les informations utilisateur dans Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        createdAt: new Date(),
      });

      return userCredential;
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error.message);
      throw error;
    }
  };

  // Fonction de connexion
  const signIn = async (email, pwd) => {
    try {
      return await signInWithEmailAndPassword(auth, email, pwd);
    } catch (error) {
      console.error("Erreur lors de la connexion :", error.message);
      throw error;
    }
  };

  // Fonction pour réinitialiser le mot de passe
  const forgotPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Email de réinitialisation envoyé.");
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe :", error.message);
      throw error;
    }
  };

  // Fonction pour déconnecter l'utilisateur
  const logout = async () => {
    try {
      await signOut(auth);
      console.log("Déconnexion réussie.");
      navigate("/login"); // Redirige après la déconnexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error.message);
    }
  };

  // Récupération des présentations de l'utilisateur connecté
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setLoadingData(true); // Active le loader
  
      try {
        if (user) {
          setCurrentUser(user);
  
          const userPresentationsRef = collection(db, "users", user.uid, "presentations");
          const unsubscribeFirestore = onSnapshot(
            userPresentationsRef,
            (snapshot) => {
              const userPresentations = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setPresentations(userPresentations);
            },
            (error) => console.error("Erreur Firestore :", error)
          );
  
          return () => unsubscribeFirestore();
        } else {
          setCurrentUser(null);
          setPresentations([]);
        }
      } catch (error) {
        console.error("Erreur dans onAuthStateChanged :", error.message);
      } finally {
        setLoadingData(false); // Désactive le loader
      }
    });
  
    return () => unsubscribeAuth();
  }, []);

  return (
    <UserContext.Provider
      value={{
        signUp,
        signIn,
        forgotPassword,
        logout, // Ajout de la fonction logout
        currentUser,
        presentations,
      }}
    >
{loadingData ? (
  <div>Chargement...</div> // Loader pendant le chargement
) : (
  props.children
)}
    </UserContext.Provider>
  );
}