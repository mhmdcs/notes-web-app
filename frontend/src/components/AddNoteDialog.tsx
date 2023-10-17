import { Modal, ModalHeader } from "react-bootstrap";

// we add an interface because we want to pass data to AddNoteDialog component; we want to add a way to close the dialog
// whenver we click outside of the dialog, or click the close button, all of thise will be detected inside AddNoteDialog
// we just have pass it to the calling component to tell it "ok, change the state to setShowAddNoteDialog(false)", and we do this via a callback named onDismiss inside this interface, this is how this is done in declarative uis
export interface AddNoteDialogProps {
    onDismiss: () => void,
}

const AddNoteDialog = ({onDismiss}: AddNoteDialogProps ) => { // we destructure AddNoteDialogProps to get onDismiss via the curly braces syntax
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
        </Modal>
    );
}

// we will display this modal component in our App.tsx file
export default AddNoteDialog;