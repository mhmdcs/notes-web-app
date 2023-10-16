import styles from '../styles/note.module.css'; // now we can use this css module here without it clashing with other components, unless we specifically import it to other components
import { Card } from 'react-bootstrap';
import { Note as NoteModel } from "../models/notes" // we use alias NoteModel
import { formatDate } from '../utils/formatDate';

// in order to display data in each note, we have to pass the note itself to the Note function component, right? to declare what type of data this note should receive we make a NoteProps interface for this type
interface NoteProps {
  note: NoteModel,
  className?: string, // we create a new attribute to the <Note> named className just like the name of the attribute in other tags that accepts css classes, we make this optional with ? so that we can pass a className to this component or we can omit it
}

// we create a component for our Note that contains the HTML layout of each note
// Note is a function component using arrow functions, while in our App.tsx (our entire web app itself) also contains a component function
// component functions basically create "a piece of the UI"

// we create an arrow function and we name the function's first letter is in uppercase
// inside the arrow function's first argument, we pass in the props, props (short for properties) are the arguments we pass to function components 
// inside the arrow function's body, we declare the UI for our Note component using Card tags from the react-bootstrap library, which look nice
const Note = ({ note, className }: NoteProps) => { // because we passed in the note data props inside our component, we can use our note data model inside the function component, we also pass the className so we can pass a className from the outside (i.e. to allow the caller of this Note component to style it with a css class)
  // arugments passed to our component functions like our note props, work the same as states; whenever the state changes react knows it needs to rerender the ui component that depends on the state, and whenever a props that we pass to a component function changes react knows that it needs to rerender that component as well  
  const {
    title,
    text,
    createdAt,
    updatedAt,

  } = note; // we destructure the note's values  like this

  // now remember that whatever we use inside this function componenet body, it'll be re-executed on every render, this is ok because formatDate() is a cheap operation, so we can afford executing it on every render, but if it was expensive you should use something like useEffect() or useMemo(), which is a holder for these expensive operations
  // but cheap, inexpensive operations can be executed inside the body of the component, just be aware that this will block and the rendering of the component will not finish until this code is executed 
  let noteTimestamp: string = "Created: " + formatDate(createdAt);
  if (updatedAt > createdAt) { // if updatedAt's unix milliseconds is larger than createdAt's unix milliseconds, then it means that the note has been updated
    noteTimestamp = "Updated: " + formatDate(updatedAt);
  }

  return ( // we return the ui that gets drawn/rendered on the screen 
    // we pass to Card as an arugment the class name of the css style we defined
    // in normal html this className attribute would've just been named `class` but because we're inside tsx/jsx and `class` is a keyword reserved for typescript/javascript, we call it className instead
    // we want to add our NoteProps's className to the <Card>, to the outer most component, so we can style it from the outside
    // so how do we add multiple className? we wrap classNames with `` backtick and curly braces {} and $, because `` backticks allow us to put variables inside the string, then we use the $ to call the variable, and the {} when the variable has nested elements
    <Card className={`${styles.noteCard} ${className}`}>
      <Card.Body className={styles.cardBody}>
        <Card.Title>
          {title}
        </Card.Title>
        <Card.Text className= {styles.cardText}>
          {text}
        </Card.Text>
      </Card.Body>
      <Card.Footer className='text-muted'>
        {noteTimestamp}
      </Card.Footer>
    </Card>
  ); // we put the html code in paranethesis when we return it because it allows us to write multiple lines of code while informing the function that all of this is part of the returned data 

}

// we export our Note function component to reuse it elsewhere 
export default Note;