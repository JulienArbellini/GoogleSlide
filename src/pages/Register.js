import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import '../Register.css';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const navigate = useNavigate();

    // Regex de validation email
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleCaptcha = (value) => {
        if (value) setCaptchaVerified(true);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Sécurité : Validation des entrées
        if (!isValidEmail(email)) {
            setError('Veuillez entrer une adresse email valide.');
            return;
        }
        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (!captchaVerified) {
            setError('Veuillez vérifier le CAPTCHA pour continuer.');
            return;
        }

        setLoading(true);
        try {
            // Inscription Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Ajouter des informations sécurisées dans Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                createdAt: new Date(),
            });

            navigate('/');
        } catch (err) {
            setError('Erreur lors de la création du compte. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h1 className="register-title">Créez un compte</h1>
                <form onSubmit={handleRegister} className="register-form" autoComplete="off">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.trim())}
                            placeholder="Entrez votre email"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Entrez un mot de passe"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmez votre mot de passe"
                            required
                        />
                    </div>

                    {/* Intégration de ReCAPTCHA */}
                    <ReCAPTCHA
                        sitekey="TON_SITE_KEY_RECAPTCHA"
                        onChange={handleCaptcha}
                    />

                    {error && <p className="error-message">{error}</p>}
                    <button
                        type="submit"
                        className={`register-button ${loading ? 'disabled' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Inscription...' : 'S\'inscrire'}
                    </button>
                </form>
            </div>
        </div>
    );
}