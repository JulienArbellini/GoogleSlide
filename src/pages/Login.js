import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import '../Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Validation stricte de l'email
    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!isValidEmail(email)) {
            setError('Veuillez entrer une adresse email valide.');
            return;
        }
        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err) {
            switch (err.code) {
                case 'auth/user-not-found':
                    setError('Aucun utilisateur trouvé avec cet email.');
                    break;
                case 'auth/wrong-password':
                    setError('Mot de passe incorrect.');
                    break;
                case 'auth/invalid-email':
                    setError('Adresse email invalide.');
                    break;
                case 'auth/too-many-requests':
                    setError('Trop de tentatives échouées. Réessayez plus tard.');
                    break;
                default:
                    setError('Connexion échouée. Vérifiez vos informations.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Bienvenue</h1>
                <p className="login-subtitle">Connectez-vous pour accéder à vos présentations</p>
                <form onSubmit={handleLogin} className="login-form" autoComplete="off">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.trim())}
                            placeholder="Entrez votre email"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Entrez votre mot de passe"
                            required
                            disabled={loading}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button
                        type="submit"
                        className={`login-button ${loading ? 'disabled' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
                <div className="login-footer">
                    <p>Pas encore de compte ? <a href="/register">Inscrivez-vous</a></p>
                </div>
            </div>
        </div>
    );
}