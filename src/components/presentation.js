import React, { useState, useEffect, useRef, useContext } from 'react';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserContext } from '../context/userContext';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function Presentation({ handleSelectSlide }) {
    const { currentUser } = useContext(UserContext);
    const params = useParams();
    const isMounted = useRef(false);
    const [slides, setSlides] = useState([]);
    const [selectedSlideId, setSelectedSlideId] = useState(null);

    // Fonction pour récupérer les slides de la présentation actuelle
    const getData = () => {
        if (!currentUser || !params.id) {
            console.warn("Utilisateur ou ID de présentation manquant !");
            return;
        }

        const slideInPresRef = collection(
            db,
            'users',
            currentUser.uid,
            'presentations',
            params.id,
            'slides'
        );

        const q = query(slideInPresRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sortedSlides = snapshot.docs
                .map((doc) => ({ ...doc.data(), id: doc.id }))
                .sort((a, b) => a.order - b.order || 0); // Trie selon l'ordre

            setSlides(sortedSlides);
        });

        return unsubscribe;
    };

    useEffect(() => {
        if (isMounted.current) return;

        isMounted.current = true;
        const unsubscribe = getData();

        return () => unsubscribe && unsubscribe();
    }, [currentUser, params.id]);

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const reorderedSlides = Array.from(slides);
        const [movedSlide] = reorderedSlides.splice(result.source.index, 1);
        reorderedSlides.splice(result.destination.index, 0, movedSlide);

        setSlides(reorderedSlides);

        // Mise à jour de Firestore pour chaque slide avec le nouvel ordre
        reorderedSlides.forEach(async (slide, index) => {
            const slideRef = doc(
                db,
                'users',
                currentUser.uid,
                'presentations',
                params.id,
                'slides',
                slide.id
            );
            await updateDoc(slideRef, { order: index });
        });
    };

    return (
        <>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="slides">
                    {(provided) => (
                        <div
                            className="presentation-container-side"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{ overflowY: 'auto', maxHeight: '80vh' }}
                        >
                            {slides.length > 0 ? (
                                slides.map((slide, index) => (
                                    <Draggable
                                        key={slide.id}
                                        draggableId={slide.id}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                onClick={() => {
                                                    handleSelectSlide(slide);
                                                    setSelectedSlideId(slide.id);
                                                }}
                                                className={`mini-slide ${slide.id === selectedSlideId ? 'active-slide' : ''}`}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: '12px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'normal',
                                                    }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: slide.content || '',
                                                    }}
                                                ></div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))
                            ) : (
                                <p>Aucun slide trouvé pour cette présentation.</p>
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </>
    );
}