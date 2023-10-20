import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import { Note as NoteModel } from './models/notes';
import Note from './components/Notes';
import { Col, Row, Container, Button, Spinner } from 'react-bootstrap';
import styles from "./styles/notesPage.module.css";
import stylesUtils from "./styles/utils.module.css";
import * as NotesApi from './network/notes_api';
import AddEditNoteDialog from './components/AddEditNoteDialog';
import { FaPlus } from "react-icons/fa";

// this is a function component, function components are "units of a user interface" which are JavaScript/TypeScript functions that return JSX/TSX or null. They can receive props as their argument, and they can manage an internal state.
// Hooks like useState() and useEffect() are functions that let developers "hook into" React state and lifecycle features from function components
function App() {
  const [notes, setNotes] = useState<NoteModel[]>([]); // we initialize the state using the useState() react hook function, we pass in an empty array as the initial state, because when the website is first opened, there are no notes yet, we have to retrieve them from the backend first

  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false); // we need a state that tells us if the AddNoteDialog should show up or not, because we initialized this state with false, typescript will infer that its type is Boolean so we won't have to add the generic type parameter 
  const [noteToEdit, setNoteToEdit] = useState<NoteModel | null>(null);
  const [notesLoading, setNotesLoading] = useState(true);
  const [showNotesLoadingError, setShowNotesLoadingError] = useState(false);

  // now the question is, where do we load these notes from the backend? we can't just pull them directly inside this App function body
  // because react basically redraws this whole component whenever something in it changes, and it does this by executing the App function again
  // this is what side effects are: so now when we do something inside the App function body, something that doesn't relate to the rendering itself, but something that happens in our normal app flow (like loading the notes async from the backend), and then we do that here directly inside the App function body, then react will execute it on *every* render; every time the App function is called, this is called a side-effect, which is of course not what we want, because calling the api that much is way too often and frequent  
  // instead, we want to load our notes one single time, when the app starts for the first time, so we'll use the useEffect() react hook function, which is a function that takes another function as an argument, and we'll put that logic inside the passed-in arrow function callback
  // with useEffect() we can execute side effects outside of the rendering of the component itself, inside the arrow function passed to useEffect(), we have control over when it executes, and how often

  // useEffect is a react hook that allows you to perform side effects inside function components
  useEffect(() => {
    async function loadNotes() {
      // we use await on the fetch() function call because this is an asynchronous operation; we have to load data from the backend and it could take a while
      // first param is the endpoint entire url, second param is a javascript object literal (json) because this is how we configure this api call to be a GET http verb
      try {
		setShowNotesLoadingError(false);
		setNotesLoading(true);
		const notes = await NotesApi.fetchNotes(); // we use await here as well because parsing the json out of the response is also an async operation
        setNotes(notes); // we call setNotes which is our state function that we destructured from the array returned by useState(), this way we update the state, and wherever in the the UI we use notes returned by useState(), it'll be the updated notes fetched from the backend
	} catch (error) {
        console.error(error);
		setShowNotesLoadingError(true);
        alert(error); // alert functions opens a little pop-up dialog window in the browser, not every beautiful and not a great user expereience, but it'll make do for now until we write better error-handling 
      } finally {
		setNotesLoading(false);
	  }
    }

    loadNotes(); // we immediately call/invoke loadNotes()
  }, []); // we also need to pass a dependency array to useEffect() as a second argument, inside the square bracket we can pass variables that whenever they're changed, they're gonna execute useEffect() function's first argument arrow function again, but if we pass an empty array, then useEffect() will only execute one time only at the beginning, which is exactly what we want, however, if we didn't pass an empty array at all i.e. we didn't pass anything to useEffect() second arg, then useEffect() will execute on every single render! and this is never what we want, that'd be like if we didn't use useEffect() at all and we put that loading notes code inside the App function body directly!

  // const [clickCount, setClickCount] = useState(0); // clickCount maintains the current count state, while setClickCount is a function that updates the state
  // because we need to notify react that it has to redraw the UI to display the new value, we need to create a state
  // useState() returns an array with two values, and so we destructure the array by using the `const [clickCount, setClickCount]` syntax, the first variable is the state itself, and the second variable is used to update the state 

  async function deleteNote(noteId: string) {
    try {
      await NotesApi.removeNote(noteId);
      // after we make sure that the note api call succeeds and doesn't throw an error, we update our current notes ui state so that it doesn't display the deleted note
      // this filter function will go through each note in the notes array and then pass it to this callback one by one, and then we can decide what to do with it, we also have to return a boolean in in the body of this arrow function which is the predicate, true if we want to keep THAT note item that met the predicate in the array, and false if we want to remove THAT note item that met the predicate
      setNotes(notes.filter((existingNote) => existingNote._id !== noteId)); // so what we're saying here is "if the current note id we're iterating through is not the same as the id of the one we're trying to delete, then keep it, but if we do find the the note id that matches the note id of the note we deleted, then remove it from the notes array"
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  const notesGrid = <Row xs={1} md={2} xl={3} className={`g-4 ${styles.notesGrid}`}>
        {notes.map(noteItem => ( // we call map function on our array of notes, map function takes in an arrow function, and the argument that the arrow function receives is the noteItem and now we can maniuplate each note we fetched from the backend
          <Col key={noteItem._id}>
            <Note
              note={noteItem}
              className={styles.note}
              onNoteClicked={setNoteToEdit} // because onNoteClicked passes a NoteModel, and because setNoteToEdit also takes a Note, we don't have to pass it explicitly like this: onNoteClicked={ (note) => setNoteToEdit(note) } and the compiler will know to pass the Note for us implicitly
              onDeleteNoteClicked={(note) => {
                deleteNote(note._id);
              }} />
          </Col>
        ))}
      </Row>

  return (
    // instead of HTML's <div> tag we use <Container> tag from react bootstrap
    // we use the <Row> tag to basically create grids layout for the notes
    // also, in the <Row> tag, we add some configurations for how many items we want to display on each row based on the screen size, xs means small screen sizes, md means medium, xl means large
    // we also pass a "g-4" for the class in the <Row> tag which adds margin between our grid elements
    // we also pass a css class to our <Note> tag, so we go inside our Note component function and add another property to it
    <Container className={styles.notesPage} >
      <Button
        className={`mb-4 ${stylesUtils.blockCenter} ${stylesUtils.flexCenter}`}
        onClick={() => (setShowAddNoteDialog(true))}>
        <FaPlus />
        Add New Note
      </Button>
      {notesLoading && <Spinner animation='border' variant='primary'/>}
	  {showNotesLoadingError && <p>Something went wrong! Please refresh the page {'\u{1F60A}'}</p>}
	  {!notesLoading && !showNotesLoadingError &&
	  <>
	  { notes.length > 0 ? notesGrid : <p>You don't have any notes yet</p> }
	  </>
	  }
      {
        // we add our AddNoteDialog component like every piece of react ui into our return statement, specifically, we put it inside the Container tag, it doesn't have to be inside the <Container> tag specifically, it could be inside <div> too, it just needs to be inside an outer tag
        // we add curly braces and now we can do some react syntax that might look a bit weird at first, but this is how you can draw ui components conditionally on the screen 
        showAddNoteDialog && // this showAddNoteDialog ampersand-ampersand means "whatever code we put after this line, it will only be drawn on the screen if and only if showAddNoteDialog is true; if showAddNoteDialog is false then it won't be rendered on the screen"
        <AddEditNoteDialog
          onDismiss={() => setShowAddNoteDialog(false)}
          onNoteSaved={(newNote) => {
            setNotes([...notes, newNote]) // we want to add the new note to the ui, we already know how to update notes state with the setNotes(), so we update it with the new notes array, but we don't a whole array back from the backend, we just get one note, so what we do is create a new dynamic array by populating it with the previous notes array with the ... spread operator, using the syntax [...notes] and then we add our new latest note to this new dynamic array we're passing to setNotes()
            setShowAddNoteDialog(false); // set ShowAddNoteDialog state to false so that when the note is submitted, we close the dialog immediately
          }}
        />
      }
      {
      noteToEdit && // this means "execute the following code after this line if and only if noteToEdit is defined i.e. noteToEdit is NOT null or undefined"
      <AddEditNoteDialog
      noteToEdit={noteToEdit} // typescript is smart enough to smart-cast this noteToEdit from being of type "NoteModel | null" to type "NoteModel" since we alrady checked for against its nullability with thr && operator
      onDismiss={() => setNoteToEdit(null)} // set noteToEdit to null so that it'd hide this dialog thanks due to the noteToEdit && check above
      onNoteSaved={ (editedNote) => {
        // update the ui with the new updated note, we want to take the new note that we updated and put the new data there without having to refresh the page, we want to do this with the value we get returned from the api, so we'll use the map() function to take the array of notes and transform it in the way we want, we want to leave all the notes untouched except the one that matches the id of the edited note
        // remember, map() filter() array functions etc RETURN a new array with maniuplated elements
        setNotes(notes.map(existingNote => existingNote._id === editedNote._id ? editedNote : existingNote)) // if the id of the existing note matches the id of the updated note, then we know that this is the note that we want to update, else we want to put the same existing note back to the new array
        setNoteToEdit(null) // set noteToEdit to null to close the dialog after we save the changes 
      }
      }
      />
      }
    </Container>
  ); // // the <Note> tag (which is our Note component function) takes two arguments, the first argument is the NoteProps we passed to the component function which, and the second argument this `key` property is added automatically by react, react uses this key to diff and compare different notes in the array when it redraws the component, so we pass in our note's unique id
}

export default App;
