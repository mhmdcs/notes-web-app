import styles from '../styles/note.module.css'; // now we can use this css module here without it clashing with other components, unless we specifically import it to other components
import { Card } from 'react-bootstrap';
import { Note as NoteModel } from "../models/notes" // we use alias NoteModel

// in order to display data in each note, we have to pass the note itself to the Note function component, right? to declare what type of data this note should receive we make a NoteProps interface for this type
interface NoteProps {
  note: NoteModel,
}

// we create a component for our Note that contains the HTML layout of each note
// Note is a function component using arrow functions, while in our App.tsx (our entire web app itself) also contains a component function
// component functions basically create "a piece of the UI"

// we create an arrow function and we name the function's first letter is in uppercase
// inside the arrow function's first argument, we pass in the props, props (short for properties) are the arguments we pass to function components 
// inside the arrow function's body, we declare the UI for our Note component using Card tags from the react-bootstrap library, which look nice
const Note = ({ note }: NoteProps) => { // because we passed in the note data props inside our component, we can use our note data model inside the function component, arugments passed to our components like our note props, work the same as states; whenever the state changes react knows it needs to rerender the ui component that depends on the state, and whenever a props that we pass to a component function changes react knows that it needs to rerender that component as well  
  const {
    title,
    text,
    createdAt,
    updatedAt,
  } = note; // we destructure the note's values  like this

  return ( // we return the ui that gets drawn/rendered on the screen 
    // we pass to Card as an arugment the class name of the css style we defined
    // in normal html this className attribute would've just been named `class` but because we're inside tsx/jsx and `class` is a keyword reserved for typescript/javascript, we call it className instead
    <Card className={styles.noteCard}> 
      <Card.Body>
        <Card.Title>
          {title}
        </Card.Title>
        <Card.Text className= {styles.cardText}>
          {text}
        </Card.Text>
      </Card.Body>
    </Card>
  ); // we put the html code in paranethesis when we return it because it allows us to write multiple lines of code while informing the function that all of this is part of the returned data 

}

// we export our Note function component to reuse it elsewhere 
export default Note;