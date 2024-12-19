import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth); // Déconnexion de l'utilisateur
            navigate('/'); // Redirection vers la page d'accueil ou login
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error.message);
        }
    };

    return (
        <button onClick={handleLogout} className="logout-button">
            Se déconnecter
        </button>
    );
}