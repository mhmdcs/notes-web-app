import React, { useEffect, useState } from 'react';
import * as NotesApi from './network/notes_api';
import SignUpModal from './components/SignUpModal';
import LoginModal from './components/LoginModal';
import NavBar from './components/NavBar';
import { User } from './models/user';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NotesPage from './pages/NotesPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import styles from './styles/app.module.css';

// this is a function component, function components are "units of a user interface" which are JavaScript/TypeScript functions that return JSX/TSX or null. They can receive props as their argument, and they can manage an internal state.
// Hooks like useState() and useEffect() are functions that let developers "hook into" React state and lifecycle features from function components
function App() {

  const [loggedInUser, setLoggedInUser] = useState<User|null>(null);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {

    async function fetchCurrentUser() {
      try {
        const user = await NotesApi.getLoggedInUser();
        setLoggedInUser(user);
      } catch (error) {
        console.log(error);
      }
    }

    fetchCurrentUser();
  }, []);

  // in order to implement react-router-dom, we have to wrap this whole <div> into the <BrowserRoute> component to enable the routing functionality 
  return (
    <BrowserRouter>
    <div>
      <NavBar
      loggedInUser={loggedInUser}
      onLoginClicked={() => setShowLoginModal(true) }
      onSignUpClicked={() => setShowSignUpModal(true) }
      onLogoutSuccess={() => setLoggedInUser(null) }
      />

    <Container className={styles.pageContainer}>
      <Routes>
        <Route
          path='/'
          element={<NotesPage loggedInUser={loggedInUser}/>}
          />

        <Route
        path='/privacy'
        element={<PrivacyPage/>}
        />
        <Route
        path='/*' // this checks for all urls that a user might enter, it first checks the first paths we defined, if none match them, it falls back to this page
        element={<NotFoundPage/>}
        />
      </Routes>
    </Container>

    { showSignUpModal &&
        <SignUpModal
        onDismiss={()=> setShowSignUpModal(false) }
        onSuccessSignUp={ user => {
          setLoggedInUser(user);
          setShowSignUpModal(false);
        }}
        />
      }

      {
        showLoginModal &&
        <LoginModal
        onDismiss={()=> setShowLoginModal(false) }
        onLoginSuccess={(user)=>{
           setLoggedInUser(user); 
           setShowLoginModal(false)
          }}
        />
      }
    </div>
    </BrowserRouter>
  ); 
}

export default App;
