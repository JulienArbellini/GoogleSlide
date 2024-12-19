import { where, query } from "firebase/firestore";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { Markup } from "interweave";


export default function SlideExample({ database }) {
  let params = useParams();
  const isMounted = useRef(false);
  const [docsData, setDocsData] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Récupérer les données des slides
  const getData = () => {
    const slideInPres = collection(database, "slide");
    const q = query(slideInPres, where("idPresentation", "==", params.id));

    onSnapshot(q, (data) => {
      setDocsData(
        data.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        })
      );
    });
  };

  useEffect(() => {
    window.focus();
  }, []);

  useEffect(() => {
    if (isMounted.current) return;

    isMounted.current = true;
    getData();

    // Ajouter l'écouteur d'événements pour les flèches du clavier
    console.log("Ajout de l'écouteur d'événements");
    window.addEventListener("keydown", handleKeyDown);

    // Nettoyer l'écouteur d'événements lors du démontage
    return () => {
      console.log("Suppression de l'écouteur d'événements");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Navigation entre les slides
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % docsData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? docsData.length - 1 : prev - 1
    );
  };

  // Gérer les touches du clavier
  const handleKeyDown = (event) => {
    event.preventDefault(); // Empêche les comportements par défaut
    event.stopPropagation(); // Stoppe la propagation
    console.log("Touche pressée :", event.key); // Vérifie la touche détectée
    if (event.key === "ArrowRight") {
      nextSlide(); // Flèche droite → slide suivante
    } else if (event.key === "ArrowLeft") {
      prevSlide(); // Flèche gauche → slide précédente
    }
  };

  return (
    <div className="presentation-slider__container">
      {docsData.length > 0 ? (
        <>
          <div className="slide">
            <Markup content={docsData[currentSlide]?.content || "<p>Aucun contenu</p>"} />
          </div>
          {/* Navigation */}
          <button className="nav-button left" onClick={prevSlide}>
            &#8592;
          </button>
          <button className="nav-button right" onClick={nextSlide}>
            &#8594;
          </button>
        </>
      ) : (
        <p>Chargement des slides...</p>
      )}
    </div>
  );
}