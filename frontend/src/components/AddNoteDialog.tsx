import { Button, Form, Modal, ModalHeader } from "react-bootstrap";
import { Note } from "../models/notes";
import { useForm } from "react-hook-form";
import { NoteInput } from "../network/notes_api";
import * as NotesApi from "../network/notes_api";
import { title } from "process";

// we add an interface because we want to pass data to AddNoteDialog component; we want to add a way to close the dialog
// whenver we click outside of the dialog, or click the close button, all of thise will be detected inside AddNoteDialog
// we just have pass it to the calling component to tell it "ok, change the state to setShowAddNoteDialog(false)", and we do this via a callback named onDismiss inside this interface, this is how this is done in declarative uis
export interface AddNoteDialogProps {
    onDismiss: () => void,
    onNoteSaved: (note: Note) => void,
}

const AddNoteDialog = ({onDismiss, onNoteSaved}: AddNoteDialogProps ) => { // we destructure AddNoteDialogProps to get onDismiss via the curly braces syntax
    // we have to synchronize the submit button with the state, we have to handle different states and so on, and we don't want to redraw the UI too often when we insert some new text
    // handling all that stuff can be difficult, this is why we'll use a package for handling all the form stuff, and the package will be react-hook-form
   // there's a special hook from react-hook-form we can use, this hook returns different kinds of data and functions that we can use in our form, so we have to destructure it into different variables
   const { register, handleSubmit, formState: {errors, isSubmitting} } = useForm<NoteInput>();  
   
   async function onCreate(input: NoteInput) {
    try {
        const noteResponse = await NotesApi.createNote(input);
        onNoteSaved(noteResponse); // if this api call succeeds, we want to call our onNoteSaved callback and pass the note response to the caller of this component, which is right now the App.tsx module, this line is where we send successfully created notes there and from there we can add it to the ui
    } catch (error) {
        console.error(error);
        alert(error);
    }
   }

   return (
        // passing `show` to Modal like that <Modal show> has the same effect as passing show={true} <Modal show={true}>, it's just implicitly true
        // pass closeButton to Modal.Header to add a little X so that we can close the note
        // in <Modal> tag we have onHide callback which will be called whenever we do an action that closes this dialog, this includes clicking outside of this dialog and also clicking the close button inside the dialog, and we pass to onHide's callback our onDismiss callback reference so that it executes it when the time is right 
        // we forward our onDismiss callback to Modal's onHide, we could've also written this as `<Modal show onHide={ () => onDismiss() }>`, it's the same effect as `<Modal show onHide={onDismiss}>`, but because onDismiss doesn't take any arguments, we can just pass the callback function as a reference directly like that
        <Modal show onHide={onDismiss}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Add Note
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form id="addNoteForm" onSubmit={handleSubmit(onCreate)} // on the onSubmit property of Form, we invoke/call the handleSubmit() function from the useForm() react hook, and inside handleSubmit() we pass in our onCreate function, this syntax might look weird, but it basically connects the react-bootstrap <Form> to the react-hook-form package internal logic
                // so, onSubmit is the callback for when this <Form> is submitted, and we invoke/call handleSubmit() which hands the inputs to react-hook-form lib which does some stuff behind the scenes that then executes our onCreate function and our onCreate function will later invoke our onNoteSaved callback
                // do note that the syntax for what we assign to the onSubmit property is onSubmit={handleSubmit(onCreate)} and not onSubmit={ () => { handleSubmit(onCreate) } }, this is because the we the handleSubmit() function to be executed immediately at initialization (i.e. while the component is being rendered), 
                // so we do not want to to be executed at some point later when the submit icon is clicked after the component has been already rendered
                >
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                        type="text"
                        placeholder="Title"
                        isInvalid={!!errors.title} // if the error title is undefined, this will resolve to false, if the error title contains a value this will resolve to true and thus it'll mean that the title input is invalid
                        {...register("title", { required: "Required" })} // the way we connect each <Form> input to react-hook-form might look a bit weird but this is the react way, we add curly braces because we want to pass in a javascript/typescript expression, and then we write three dots ... which means that whatever comes after these dots, gets destructured into a single component
                        // this register call gets separated into many different properties that all get added to the <Form.Control> component, this is what this syntax means, it takes register and separates them into single pices basically
                        // register is a function that takes an argument, the first argument is the name of the title input field, which has to be one of the properties that are contained in our NoteInput which we assigned as the generic type to useForm() hook
                        // register("title") is what connects this input field to the value that gets passed in, and react-hook-form later knows that when we submit this that this is the "title" value that it will send to our onCreate function
                        // this might be complicating at first, but this is how html forms work in react    
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.title?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>Text</Form.Label>
                    <Form.Control
                    as="textarea" // this creates a large input field
                    rows={5} // we set the size of this input field to five lines
                    placeholder="Text"
                    {...register("text")}
                    />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button 
                type="submit" // the property of the Button component `type` can take a "submit" type, this is not an arbitrary string, this actually has a special submit effect, this is the property that tells html that this is the button for sending the form, but since this button is disconnected from the <Form> tag, then the browser wouldn't know that these tags are connected, but we can fix this by setting an id to this Button tag with the `form` property
                form="addNoteForm"
                disabled={isSubmitting} // we debounce - we don't want user to spam submit clicks and thus accidently submitting multiple duplicate notes to the backend and database, so we use the isSubmitting boolean from useForm() and pass it to the `disabled` <Button> property 
                >
                    Save
                </Button>
            </Modal.Footer>

        </Modal>
    );
}

// we will display this modal component in our App.tsx file
export default AddNoteDialog;