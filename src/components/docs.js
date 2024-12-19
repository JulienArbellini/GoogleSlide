import React, { useState, useEffect, useRef, useContext } from "react";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { UserContext } from "../context/userContext";
import "../Docs.css";

export default function Docs() {
  const navigate = useNavigate();
  const isMounted = useRef();
  const { currentUser } = useContext(UserContext);
  const [docsData, setDocsData] = useState([]);
  const [title, setTitle] = useState("");

  const collectionRef = currentUser
    ? collection(db, "users", currentUser.uid, "presentations")
    : null;

  // Récupération des présentations
  useEffect(() => {
    if (collectionRef) {
      const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
        setDocsData(
          snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  // Navigation vers EditDocs
  const handleNavigate = (id) => {
    navigate(`/editDocs/${id}`);
  };

  // Ajout d'une nouvelle présentation
  const addData = async () => {
    if (collectionRef) {
      const title = prompt("Entrez le nom de la nouvelle présentation :", "Nouvelle présentation");
      if (title !== null && title.trim() !== "") {
        await addDoc(collectionRef, { title, docsDesc: "", createdAt: new Date() });
      }
    }
  };

  return (
    <div className="docs-container">
      <header className="docs-header">
        <h1>Vos présentations</h1>
        <button className="add-docs-btn" onClick={addData}>
          + Nouvelle présentation
        </button>
      </header>
      <div className="docs-grid">
        {docsData.length > 0 ? (
          docsData.map((doc) => (
            <div
              key={doc.id}
              className="docs-card"
              onClick={() => handleNavigate(doc.id)}
            >
              <h2 className="docs-title">{doc.title || "Sans titre"}</h2>
            </div>
          ))
        ) : (
          <p className="no-docs">Aucune présentation trouvée.</p>
        )}
      </div>
    </div>
  );
}