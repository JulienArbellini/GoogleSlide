import React, { useState, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

const UserDataForm = () => {
    const { currentUser } = useContext(UserContext); // Récupère l'utilisateur actuel
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const userRef = collection(db, "users");

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        console.log("Instance de db :", db);
        console.log("Utilisateur courant :", currentUser);
    
        if (!currentUser || !currentUser.uid) {
            setError("Aucun utilisateur n'est connecté.");
            return;
        }
    
        try {
            const userRef = doc(db, "users", currentUser.uid); // Référence explicite Firestore
            console.log("Référence Firestore :", userRef);
    
            await setDoc(userRef, {
                firstName: firstName,
                lastName: lastName,
                email: currentUser.email
            });
    
            setError("");
            alert("Informations enregistrées avec succès !");
        } catch (err) {
            console.error("Erreur Firestore :", err);
            setError("Une erreur est survenue, veuillez réessayer.");
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Informations utilisateurs</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nom</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Nom"
                        required
                    />
                </div>
                <div>
                    <label>Prénom</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Prénom"
                        required
                    />
                </div>
                <button type="submit" style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#4A56E2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}>
                    Enregistrer
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
};

export default UserDataForm;