import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../context/userContext";
import { db } from "../firebaseConfig";
import { doc } from "firebase/firestore";
import "../SlidePresentation.css";

export default function SlidePresentation() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true); // État pour suivre le chargement

  const { user, loading: userLoading } = useContext(UserContext);

  const { currentUser } = useContext(UserContext);


  useEffect(() => {
    if (currentUser === undefined) {
      console.log("Utilisateur non défini, en attente...");
      return;
    }
  
    if (!id) {
      console.log("ID de présentation manquant");
      return;
    }
  
    console.log("UID :", currentUser.uid);
    console.log("ID Présentation :", id);
  
    setLoading(true);
  
    const slidesPath = `users/${currentUser.uid}/presentations/${id}/slides`;
    console.log("Chemin Firestore des slides :", slidesPath);
  
    const colRef = collection(db, slidesPath);
  
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        console.log("Documents récupérés :", snapshot.docs);
        const newSlides = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSlides(newSlides);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur lors de la récupération des slides :", error);
        setLoading(false);
      }
    );
  
    return () => unsubscribe();
  }, [user, id]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") nextSlide();
      if (event.key === "ArrowLeft") prevSlide();
      if (event.key === "Escape") navigate(`/editDocs/${id}`);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides, navigate, id]);

  if (loading) {
    return <p>Chargement des slides...</p>; // Affiche un message pendant le chargement
  }

  return (
    <div className="slide-presentation-container">
      <button className="close-button" onClick={() => navigate(`/editDocs/${id}`)}>
        ✕
      </button>

      <button className="arrow arrow-left" onClick={prevSlide}>←</button>
      <button className="arrow arrow-right" onClick={nextSlide}>→</button>

      <AnimatePresence>
        {slides.length > 0 ? (
          <motion.div
            key={currentSlide}
            className="slide"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <div dangerouslySetInnerHTML={{ __html: slides[currentSlide]?.content || "" }} />
          </motion.div>
        ) : (
          <p>Aucune slide trouvée pour cette présentation.</p>
        )}
      </AnimatePresence>
    </div>
  );
}