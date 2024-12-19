import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Assure-toi que ce chemin est correct
import { useNavigate } from 'react-router-dom';

function ColorSchemesExample() {
  const navigate = useNavigate();

  // Fonction de déconnexion
  const handleLogout = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      try {
        await signOut(auth);
        navigate('/login');
      } catch (error) {
        console.error('Erreur lors de la déconnexion :', error.message);
      }
    }
  };

  return (
    <>
      <Navbar bg="primary" variant="dark">
        <Container>
          <Navbar.Brand href="/">ESGI Slides</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/login">Log in</Nav.Link>
            <Nav.Link href="/register">Sign in</Nav.Link>
            {/* Logout appelle la fonction handleLogout */}
            <Nav.Link as="button" onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              Logout
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}

export default ColorSchemesExample;