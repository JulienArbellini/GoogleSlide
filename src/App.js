import './App.css';
import Docs from './components/docs';

import ForgotPassword from './pages/forgotPassword';
import Register from './pages/Register';
import Logout from './pages/logout';
import SlidePresentation from './components/SlidePresentation';
// import Reveal from "./pages/RevealTest"
import Login from "./pages/Login";
import EditDocs from './pages/EditDocs';
import { Routes, Route, useLocation } from "react-router-dom";
import { app, db } from './firebaseConfig';
import { useState } from 'react';
import ColorSchemesExample from './components/ColorSchemesExample';
import SlideExample from './components/slideComponent';
import { UserContextProvider } from "./context/userContext";

function App() {
  const [slides, setSlides] = useState([]); 
  const location = useLocation(); // Hook pour récupérer l'URL actuelle
  const isPresentationPage = location.pathname.includes("/presentation");
  const showMenu = location.pathname === '/' || location.pathname.startsWith('/editDocs/');

  return (
    <>
      <UserContextProvider>
        {showMenu  && <ColorSchemesExample />}
        <Routes>
          <Route path="/" element={<Docs db={db} />} />
          <Route exact path="/forgot-password" element={<ForgotPassword />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/logout" element={<Logout />} />
          <Route path="/editDocs/:id" element={<EditDocs db={db}/>} />
          <Route path="/presentation/:id" element={<SlidePresentation db={db} />} />
        </Routes>
      </UserContextProvider>
    </>

  );
}

export default App;
