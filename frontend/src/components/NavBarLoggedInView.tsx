import { Button, Navbar } from "react-bootstrap";
import { User } from "../models/user";
import * as NotesApi from "../network/notes_api";

interface NavBarLoggedInViewProps {
    user: User, // this time user prop doesn't have to be nullable because we will only show this component if there IS a user (only when we're logged in)
    onLogoutSuccess: () => void,
}
const NavBarLoggedInView = ({user, onLogoutSuccess}: NavBarLoggedInViewProps) => {

    // it doesn't make sense to hoist this logout function to the caller of NavBarLoggedInView by making it a callback
    // because the only time a user wil lbe able to log out is when they're logged in, so it should be defined here
    async function logout() {
       try {
            await NotesApi.logout();
            onLogoutSuccess(); // we call the onLogoutSuccess callback so that that the App.tsx file will know that a user logged out successfully and thus it must be removed from memory and also from ui
       } catch (error) {
        alert(error);
        console.log(error);
       }
    }

    // we can't put two TSX elements into a return statement, they need at least one parent element to wrap around them all like <div> or <Container> or <> React Fragment
    // we won't use <div> because we want to render the elements of this return() inside the main NavBar.tsx, so we'll instead use React's Fragments <> </>
    // React Fragments <> allow us to use two or more elements/tags/components in places where we would only otherwise be able to use just one
    // me-2 adds margin of 2 to the end of the text
    return (
        <>
        <Navbar.Text className="me-2">
            Logged in as: {user.username}
        </Navbar.Text>
        <Button onClick={logout}>
            Logout
        </Button>
        </>
    );
}

export default NavBarLoggedInView;