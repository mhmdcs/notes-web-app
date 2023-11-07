import { Container, Nav, Navbar } from "react-bootstrap";
import { User } from "../models/user";
import NavBarLoggedInView from "./NavBarLoggedInView";
import NavBarLoggedOutView from "./NavBarLoggedOutView";
import { Link } from "react-router-dom";

interface NavBarProps {
    loggedInUser: User | null,  // why do we set loggedInUser to be of type `User | null` like `loggedInUser: User | null` instead of just declaring it as an optional like `loggedInUser?: User`? because we want to force the caller of this component to pass an explicit value for this property, either they pass a User or null
    onSignUpClicked: () => void,
    onLoginClicked: () => void,
    onLogoutSuccess: () => void,  // onLogoutSuccessful we'll do the logout logic directly inside of NavBar.tsx and then just notify App.tsx file about it so that it can remove the User data that's currently displayed in the UI and stored in memory
}
// you might ask why didn't we call the authentication modals components (LoginModal and SignUpModal) directly inside NavBar.tsx and instead chose to use callbacks to App.tsx like onSignUpClicked and onLoginClicked?
 // while this is definitely an option, then you'd have to keep in mind that you can only open the modals from within NavBar.tsx if they were used here! You might have in App.tsx other triggers in your app later that also open the SignUpModal and LoginModal, for example if the user tries to a completely different action that requires a user account :) This is why we wanna hoist login and sign up as events to the caller of NavBar.tsx (that is, App.tsx)

 
 const NavBar = ({ loggedInUser, onSignUpClicked, onLoginClicked, onLogoutSuccess }: NavBarProps) => {

    return (
         // expand defines at what screen size the navbar will turn into mobile mode where it'll have a drop-down menu instead, we can either set it to lg for large (it'll take a large screen size for it to appear) or sm for small which means it'll take a very small amount of screen until it collapses 
        // sticky means that the navbar will always be visible even if we scroll down
        <Navbar bg="primary" variant="dark" expand="sm" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to='/'>
                    Notes Web App
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar"/>
                <Navbar.Collapse id="main-navbar">
                <Nav /* we never use href for internal app navigation because it will always refresh the page and thus it'll cause the this entire NavBar component to re-render */
                /* we'll use react's "render props" which is a design pattern in react that you can build yourself if you needed, and some packages like react-bootstrap use it, so we'll use it for Nav.Link
                so now we can keep using the <Nav.Link> component from react-bootstrap, but we can render it as the <Link> component from react-router-dom package
                using the `as` prop like so: `as={}` and with this we can tell react-bootstrap that it must use the styling and everything from the <Nav.Link> but actually render a different component when this is displayed on the screen */>
                    <Nav.Link as={Link} to="/privacy">
                        Privacy
                    </Nav.Link>
                </Nav>
                <Nav className="ms-auto">
                    {   // we do ? : ternary op for an if-else statement
                        loggedInUser 
                        ? <NavBarLoggedInView user={loggedInUser} onLogoutSuccess={onLogoutSuccess}/>
                        : <NavBarLoggedOutView onSignUpClicked={onSignUpClicked} onLoginClicked={onLoginClicked}/>
                    }
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
 }
 // Navbar.Toggle is the button that will later appear when the screen is small where we can expand and collapse the menu in mobile mode
 // aria-controls defines what menu is this Navbar.Toggle responsible for, aria-controls="main-navbar" and id="main-navbar" just have to be identical names, you can set them whatever you want, they're just to let the program know that they're linked and related and connected to each other


 export default NavBar;
 

