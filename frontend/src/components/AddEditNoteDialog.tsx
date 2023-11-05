import { Button, Form, Modal } from "react-bootstrap";
import { Note } from "../models/notes";
import { useForm } from "react-hook-form";
import { NoteInput } from "../network/notes_api";
import * as NotesApi from "../network/notes_api";
import TextInputField from "./form/TextInputField";

// we add an interface because we want to pass data to AddNoteDialog component, this is what's known as a props (properties) which are arguments passed to the component
// we want to add a way to close the dialog whenver we click outside of the dialog or click the close button, all of this will be detected inside AddNoteDialog, and the caller of AddNoteDialog will be notified about it
// our component caller above will pass us a callback, and inside our component here we will invoke that callback, thus telling the calling component "ok, someone did an event that invoked onDismiss", and based on this event the caller component (App.tsx) will change its state to setShowAddNoteDialog(false), all thanks to the callback named onDismiss inside this interface, this is how we notify component callers of events inside a component so they can act upon it, this is what declarative ui is.
export interface AddEditNoteDialogProps {
    noteToEdit?: Note, // we make noteToEdit optional so that if we never get this property passed to the component, we know that we're just adding/creating a new note from scartch, but if we did get it, we know for sure that we're updating an already existing note, this makes our component modular, composable, and scalable :) rather than create two separate AddNoteDialog.tsx and EditNoteDialog.tsx components with almost entirely the same exact logic.
    onDismiss: () => void,
    onNoteSaved: (note: Note) => void,
}

const AddEditNoteDialog = ({ noteToEdit, onDismiss, onNoteSaved }: AddEditNoteDialogProps) => { // we could've declared the props paramters as (addEditNoteDialogProps: addEditNoteDialogProps), but we instead want to destructure AddEditNoteDialogProps to get noteToEdit, onDismiss, onNoteSaved so that we don't have to call addEditNoteDialogProps.noteToEdit, addEditNoteDialogProps.onDismiss, etc. each time.
    // we have to synchronize the submit button with the state, we have to handle different states and so on, and we don't want to redraw the UI too often when we insert some new text
    // handling all that stuff is not hard but it'll result in a lot of code, this is why we'll use a package for handling all the form stuff for us, and the package will be react-hook-form
    // there's a special hook from react-hook-form we can use, this hook returns different kinds of data and functions that we can use in our form, so we have to destructure it into different variables
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NoteInput>({
        defaultValues: { // we can define default values in this configuration to the useForm hook, so in case we did receive a noteToEdit, we fill the component's title and text with its data, and if we didn't get a noteToEdit that means we're creating a brand new note, so we set title and text to empty strings
            title: noteToEdit?.title || "", // in javascript/typescript, the ? operator is called the Optional Chaining operator, or the safe-call operator by some. It is used to safely access deeply nested properties of an object without having to explicitly check for the existence of each level in the nested structures via a bunch of if-statements
            text: noteToEdit?.text || "", // Optional Chaining with the ? operator does not execute the code following the ? if the part before the ? evaluates to null or undefined. It's a very handy feature that leads to cleaner code, avoiding the need for verbose and repetitive checks to prevent runtime errors due to null or undefined values.
        }
    });
    // noteToEdit?.title uses Optional Chaining to attempt to access title on noteToEdit. If noteToEdit is null or undefined, this expression will evaluate to undefined and not attempt to access title, thus avoiding a potential TypeError at runtime.
    // || "": This is the Logical OR operator. It will return the value on its left side if that value is truthy; otherwise, it will return the value on the right side. In JavaScript/TypeScript, an empty string "", null, undefined, 0, NaN, and false are all considered falsy.
    // So the entire expression noteToEdit?.title || "" means:
    // If noteToEdit is not null or undefined, try to access its title property.
    // If noteToEdit is null or undefined, or if noteToEdit.title is a falsy value (including an empty string, null, or undefined), then default to the explicitly defined empty string "".
    // As a result, the title property in defaultValues object will always end up being a string, never undefined. If noteToEdit or noteToEdit.title is null or undefined, title will be set to "", ensuring that title has a string value in all cases. Without the || "", we would see undefined in the title and text bodies when we attempt to create new notes :)

    async function onCreate(input: NoteInput) {
        try {
            let noteResponse: Note;
            if (noteToEdit) { // if noteToEdit is defined, i.e. if the caller of this component did pass a note to edit and thus they want to update an already existing note, then run this block
                noteResponse = await NotesApi.updateNote(noteToEdit._id, input);
            } else { // if noteToEdit is undefined, i.e. if the caller of this component didn't pass a note to edit and thus they want to create/add whole new note, then run this block
                noteResponse = await NotesApi.createNote(input);
            }
            onNoteSaved(noteResponse); // if this api call succeeds, we want to call our onNoteSaved callback and pass the note response to the caller of this component, which is right now the App.tsx module, this line is where we send successfully created notes to there (App.tsx), and from there (App.tsx) we can visually add it to the list of notes ui
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }

    return (
        // passing `show` to Modal like that <Modal show> has the same effect as passing show={true}, i.e. <Modal show={true}>, it's just implicitly true
        // pass closeButton to Modal.Header to add a little X so that we can close the note
        // in <Modal> tag we have onHide callback, which is a callback prop provided by react bootstrap's Modal component itself, it's not to be confused with our own onDismiss provided by our AddEditNoteDialog, but we will pass our onDismiss to Modal's onHide, onHide callback will be called whenever we do an action that closes this dialog, this includes clicking outside of this dialog and also clicking the close button inside the dialog, and we pass to onHide's callback our onDismiss callback reference so that it executes it when the time is right 
        // we forward our onDismiss callback to Modal's onHide, we could've also written this as <Modal show onHide={ () => onDismiss() }>, it's the same effect as <Modal show onHide={onDismiss}>, but because onDismiss doesn't take any arguments, we can just pass the callback function as a reference directly like that
        <Modal show onHide={onDismiss}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {noteToEdit ? "Edit Note": "Add Note"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form id="addEditNoteForm" onSubmit={handleSubmit(onCreate)} // in the onSubmit property of Form, we invoke/call the handleSubmit() function from the useForm() react hook, and inside handleSubmit() we pass in our onCreate function reference, this syntax might "look weird", but it basically connects our own logic and react-bootstrap <Form>'s logic to the react-hook-form package internal logic
                // so, onSubmit is the callback for when this <Form> is submitted (this is provided by  react-bootstrap), and we invoke/call handleSubmit() which hands the inputs to react-hook-form lib, which does some stuff behind the scenes that then later executes our own onCreate function, and then when that happens, our onCreate function will later internally invoke our onNoteSaved callback that was passed as a property to AddEditNoteDialog.tsx from App.tsx
                // notice how the syntax for what we assign to the onSubmit property is onSubmit={handleSubmit(onCreate)} and not onSubmit={ () => { handleSubmit(onCreate) } }, this is because we want the handleSubmit() function to be invoked/called/executed immediately at initialization (i.e. while the component is being rendered), because handleSubmit() returns a function reference that handles the event for us.
                // we do NOT want handleSubmit() to be executed at some point later when the submit icon is clicked after the component has been already rendered, we want it to execute RIGHT now during rendering.
                >
                    <TextInputField
                    name="title"
                    label="Title"
                    register={register}
                    registerOptions={{ required: "Required" }}
                    error={errors.title} // we call the errors state from the useForm() hook.
                    type="text"
                    placeholder="Note Title"
                    />

                    <TextInputField 
                    name="text"
                    label="Text"
                    register={register}  // we use the ... spread operator to tell the compiler "hey, this register() function returns an object and that object contains A LOT of properties, rather than me destructing them and adding these properties to <Form.Control> manually, i want you to spread all of the properties of the object returned by register()"
                    as="textarea" // this creates a large input field
                    rows={5} // we set the size of this input field to five lines
                    placeholder="Note Text"
                    />
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    type="submit" // the property of the Button component `type` can take a "submit" type, this is not an arbitrary string, this actually has a special submit effect, this is the property that tells html that this is the button for sending the form, but since this button is disconnected from the <Form> tag, then the browser wouldn't know that these tags are connected, but we can fix this by linking the id of the Form tag to this Button tag with the `form` property
                    form="addEditNoteForm" // we pass the id of the form component that we want this submit button to be linked with (so that Form's onSubmit get executed), we pass the id because this Button exists within another component that's outside Form component, and so by default it has no idea of what componet it's supposed to be the submit button for.
                    disabled={isSubmitting} // we debounce - we don't want the user to spam submit clicks and thus accidently submit multiple duplicate notes to the backend and database, so we use the isSubmitting boolean state from useForm() hook and pass it to the `disabled` <Button> property 
                >
                    Save
                </Button>
            </Modal.Footer>

        </Modal>
    );
}

// we will display this modal component in our App.tsx file
export default AddEditNoteDialog;

/**
Let's break down how `react-hook-form` and `react-bootstrap` work together in the context of form handling in a React frontend application.

The `useForm` hook from `react-hook-form` is a custom hook that manages the form state and provides several utility functions to work with forms in a React application. When you destructure the return value of `useForm`, you get access to:

- `register`: A function that you use to register an input/ref in the form to make it manageable by `react-hook-form`.
- `handleSubmit`: A function that takes a callback function (`onCreate` in our case) that will be executed when the form is valid upon submission.
- `formState`: An object containing various information about the state of the form, such as `errors` and `isSubmitting`.

Here's what happens with the `handleSubmit` function and the `onCreate` callback:

1. `handleSubmit` is a higher-order function that takes a user-defined function (our `onCreate` function) and returns a new function that is bound to the form's submit event.

2. The returned function from `handleSubmit` is designed to be used as the `onSubmit` prop for our form element. This function will automatically intercept the form's submit event, perform validation based on the rules defined in our `register` calls, and then, if the form is valid, call our `onCreate` function with the form data.

3. The `onCreate` function is our custom function that will be called with the form data after the form has passed validation. It receives an `NoteInput` object that contains the values from our form.

4. The `react-bootstrap` `<Form>` component accepts an `onSubmit` prop that expects a function. This is where you pass the function returned by `handleSubmit(onCreate)`.

So, when you write `<Form onSubmit={handleSubmit(onCreate)}>`, we are immediately invoking `handleSubmit`, and thus passing the function that `handleSubmit` returns to the `onSubmit` prop. The `onSubmit` event of the form triggers this returned function reference when the user submits the form.

In summary, `handleSubmit` does the following:

- It takes care of all the form validation that `react-hook-form` is set up to perform.
- It prevents the default form submission if validation fails, ensuring that `onCreate` is only called when the form is valid.
- It calls `onCreate` with the form's data if the validation is successful.

This process allows `react-hook-form` to efficiently handle form validation and submission without you having to manually wire up event handlers and validation logic.
 
In the JSX expression `<Form onSubmit={handleSubmit(onCreate)}>`, we are invoking `handleSubmit` during rendering, and passing the result of `handleSubmit(onCreate)` (which is a function) to the `onSubmit` prop.

Here's a step-by-step explanation of what happens:

1. During Rendering: When the component renders, `handleSubmit(onCreate)` is called, and it returns a new function. This returned new function is what gets passed to the `onSubmit` prop of the `<Form>` component.

2. Event Handling: The `onSubmit` event handler is set up so that when the form is submitted (typically when the submit button is clicked), the function returned by `handleSubmit(onCreate)` is then executed.

3. Validation and Callback Invocation: The function returned by `handleSubmit` handles the submit event: it prevents the default form submission action, performs form validation, and if the form is valid, it calls our `onCreate` function with the form data.

The reason `handleSubmit` is designed to work this way is because we want to defer the execution of our `onCreate` function until the form is actually submitted and only if it passes validation. This is a common pattern in React where you pass a function to an event handler prop, and that function is only executed in response to the corresponding event.

If we look at the documentation for the handleSubmit(), it looks pretty hard to read, how do we understand what it takes and what it returns?
handleSubmit(onValid: SubmitHandler<NoteInput>, onInvalid?: SubmitErrorHandler<NoteInput> | undefined): (e?: React.BaseSyntheticEvent<object, any, any> | undefined) => Promise<void>

The type signature of the `handleSubmit` function as provided in the documentation can indeed be a bit complex to parse if you're not familiar with TypeScript or type annotations. Let's break it down:

handleSubmit(
  onValid: SubmitHandler<NoteInput>, 
  onInvalid?: SubmitErrorHandler<NoteInput> | undefined
): (e?: React.BaseSyntheticEvent<object, any, any> | undefined) => Promise<void>

Here's what each part means:

- onValid: SubmitHandler<NoteInput>
This parameter is a function that you must provide. It will be called if the form is valid. The `SubmitHandler` type is a generic type that expects the shape of your form's data (in this case, `NoteInput`).

- onInvalid?: SubmitErrorHandler<NoteInput> | undefined
This is an optional parameter. It's a function that you can provide that will be called if the form is not valid. The `SubmitErrorHandler` is also a generic type that expects the shape of your form's data.

- (e?: React.BaseSyntheticEvent<object, any, any> | undefined) => Promise<void>
This is the return type of the `handleSubmit` function. It means that `handleSubmit` returns another function. This returned function has the following characteristics:
- It takes an optional parameter `e`, which can be a React event (`React.BaseSyntheticEvent<object, any, any>`) or `undefined`.
- It returns a `Promise<void>`, which means it's an asynchronous function that doesn't resolve with any particular value (the `void` type).

So when you call `handleSubmit(onValid, onInvalid)`, it returns a function that is meant to be used as an event handler for form submission. This event handler function is what you pass to the `onSubmit` prop of your form.

In simpler terms, `handleSubmit` is a function that when called with your callbacks, returns a new function that you can then use to handle form submission events. This new function is what knows how to deal with the React event, perform validation, and then call either your `onValid` or `onInvalid` callbacks accordingly.
*/