import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, updateDoc, addDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { UserContext } from '../context/userContext';
import Presentation from '../components/presentation';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditDocs() {
    const { currentUser } = useContext(UserContext);
    const [selectedSlide, setSelectedSlide] = useState(null);
    const [slides, setSlides] = useState([]);
    const [documentTitle, setDocumentTitle] = useState('Nouvelle présentation');
    const [content, setContent] = useState('');
    const isMounted = useRef(false);
    const params = useParams();

    const collectionRefSlides = currentUser
        ? collection(db, 'users', currentUser.uid, 'presentations', params.id, 'slides')
        : null;

    // Récupérer les slides
// Récupérer les slides et créer un slide par défaut si aucun n'existe
const getSlides = () => {
    if (!currentUser || !params.id) return;

    onSnapshot(collectionRefSlides, async (snapshot) => {
        const slidesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        setSlides(slidesData);

        if (slidesData.length === 0) {
            // Créer un slide par défaut si aucun n'existe
            const newSlide = { content: '' };
            try {
                const docRef = await addDoc(collectionRefSlides, newSlide);
                setSelectedSlide({ id: docRef.id, ...newSlide }); // Met le focus sur le nouveau slide
                setContent(''); // Vide le contenu par défaut
            } catch (error) {
                console.error('Erreur lors de la création du slide par défaut :', error);
                toast.error('Impossible de créer un slide par défaut.');
            }
        } else if (!selectedSlide) {
            // Met automatiquement le focus sur le premier slide existant
            setSelectedSlide(slidesData[0]);
            setContent(slidesData[0].content || '');
        }
    }, (error) => {
        console.error("Erreur lors de la récupération des slides :", error);
    });
};

const deleteSlide = async (slideId) => {
    if (!currentUser || !slideId) return; // Vérification de base

    const slideRef = doc(
        db,
        'users',
        currentUser.uid,
        'presentations',
        params.id,
        'slides',
        slideId
    );

    try {
        await deleteDoc(slideRef);

        // Met à jour l'état local en supprimant la slide de la liste
        setSlides((prevSlides) => prevSlides.filter((slide) => slide.id !== slideId));

        // Réinitialise l'éditeur si le slide supprimé était sélectionné
        if (selectedSlide?.id === slideId) {
            setSelectedSlide(null);
            setContent('');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du slide :', error);
        toast.error('Impossible de supprimer le slide.');
    }
};

    // Récupérer le titre de la présentation
    useEffect(() => {
        const fetchTitle = async () => {
            if (currentUser && params.id) {
                const docRef = doc(db, 'users', currentUser.uid, 'presentations', params.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDocumentTitle(docSnap.data().title || 'Nouvelle présentation');
                }
            }
        };

        fetchTitle();
    }, [currentUser, params.id]);

    // Sauvegarder automatiquement le titre modifié
    const handleTitleChange = async (e) => {
        const newTitle = e.target.value;
        setDocumentTitle(newTitle);

        if (currentUser && params.id) {
            const docRef = doc(db, 'users', currentUser.uid, 'presentations', params.id);
            try {
                await updateDoc(docRef, { title: newTitle });
                console.log('Titre sauvegardé avec succès.');
            } catch (error) {
                console.error('Erreur lors de la sauvegarde du titre :', error);
            }
        }
    };

    // Sauvegarde automatique avec debounce
    const saveSlide = useRef(null);
    useEffect(() => {
        if (selectedSlide) {
            clearTimeout(saveSlide.current);
            saveSlide.current = setTimeout(async () => {
                try {
                    const slideRef = doc(db, 'users', currentUser.uid, 'presentations', params.id, 'slides', selectedSlide.id);
                    await updateDoc(slideRef, { content });
                    console.log('Slide sauvegardé automatiquement.');
                } catch (error) {
                    console.error('Erreur lors de la sauvegarde automatique :', error);
                }
            }, 1000); // Délai de 1 seconde
        }
    }, [content, selectedSlide]);

    const addSlide = async () => {
        if (!currentUser || !params.id) return;

        try {
            const newSlide = { content: '' };
            await addDoc(collectionRefSlides, newSlide);
        } catch (error) {
            console.error('Erreur lors de l’ajout du slide :', error);
            toast.error('Impossible d’ajouter le slide.');
        }
    };

    const handleSelectSlide = (slide) => {
        if (!slide) return;

        setSelectedSlide(slide);
        setContent(slide.content || '');
    };

    useEffect(() => {
        if (currentUser && !isMounted.current) {
            isMounted.current = true;
            getSlides();
        }
    }, [currentUser, params.id]);

    return (
        <div className="container-content">
            <Presentation slides={slides} handleSelectSlide={handleSelectSlide}  />

            <div className="editDocs-main">
                <ToastContainer />
                <div className="presentation-top">
                    {/* Champ de modification du titre */}
                    <input
                        type="text"
                        value={documentTitle}
                        onChange={handleTitleChange}
                        placeholder="Renommer la présentation"
                        style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            border: '1px solid #ccc',
                            padding: '8px',
                            borderRadius: '4px',
                            width: '80%',
                        }}
                    />
                    <div className="button-slide">
                        <button className="add-slide" onClick={addSlide}>
                            Ajouter slide
                        </button>
                    </div>
                    {/* Bouton pour supprimer le slide sélectionné */}
        <div className="button-delete">
            <button
                className="delete-slide"
                onClick={() => deleteSlide(selectedSlide?.id)}
                style={{
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Supprimer le slide
            </button>
            </div>
                    <div className="button-presentation">
                        <Link to={`/presentation/${params.id}`} className="diaporama">
                            Présenter
                        </Link>
                    </div>
                </div>

                <div className="editDocs-inner">
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        placeholder="Ajoutez du texte ou insérez des images ici..."
                        modules={{
                            toolbar: [
                                [{ header: [1, 2, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                ['link', 'image', 'video'],
                                [{ list: 'ordered' }, { list: 'bullet' }],
                                [{ color: [] }, { background: [] }],
                                ['clean'],
                            ],
                        }}
                    />
                </div>
            </div>
        </div>
    );
}