import React, { useEffect, useState } from 'react';
import styles from "./styles/notesPage.module.css";
import * as NotesApi from './network/notes_api';
import SignUpModal from './components/SignUpModal';
import LoginModal from './components/LoginModal';
import NavBar from './components/NavBar';
import { User } from './models/user';
import { Container } from 'react-bootstrap';
import NotesPageLoggedInView from './components/NotesPageLoggedInView';
import NotesPageLoggedOutView from './components/NotesPageLoggedOutView';

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

  return (
    <div>
      <NavBar
      loggedInUser={loggedInUser}
      onLoginClicked={() => setShowLoginModal(true) }
      onSignUpClicked={() => setShowSignUpModal(true) }
      onLogoutSuccess={() => setLoggedInUser(null) }
      />
      <Container className={styles.notesPage}>
      <>
      {
        loggedInUser
        ? <NotesPageLoggedInView/>
        : <NotesPageLoggedOutView/>
      }
      </>
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
  ); 
}

export default App;
