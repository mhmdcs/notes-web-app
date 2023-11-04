
// we will extract our Form TSX code from AddEditNoteDialog.tsx to its own function component so that we can reuse it in other components like the login and sign up components
// reusing code instead of constantly repeating your self like an idiot is not only a good programming habit, but it's also one of the core concepts of React components, React components should be written in such a way that they're composible, extractable, and reusable

import { UseFormRegister, RegisterOptions, FieldError } from "react-hook-form";
import { Form } from "react-bootstrap";

interface TextInputFieldProps {
    name: string, // name property argument of the Form
    label: string, // label property argument of the Form
    register: UseFormRegister<any>, // the return value of the register function to register our Form with react-hook-form
    registerOptions?: RegisterOptions<any>,
    error?: FieldError,
    [x: string]: any, // this basically allows us to pass any other props that we want to our TextInputField component even if they're not defined in this interface
    // and the reason we do this is because these react-bootstrap Form components have a LOT of different properties available that we can add or omit, and instead of defining every and each of them separately and manually in this interface, we just use this to allow us to pass any array of remaining properties (with the help of the spread operator ... of coruse)
}

const TextInputField = ({name, label, register, registerOptions, error, ...props}: TextInputFieldProps) => {
    return (
        // controlId is a property that does some a11y stuff, for example it connecsts the Form.Label that gets connected to this Form.Group with the input field itself, so that we can click the Label and it activates the Form's input field, it also helps screen readers for example (a11y)
        <Form.Group className="mb-3" controlId={name + "-input"} >
        <Form.Label>{label}</Form.Label>
        <Form.Control
        {...props}
        {...register(name, registerOptions)} // the way we connect each <Form> input to react-hook-form might look a bit weird but this is the react way, we add curly braces because we want to pass in a javascript/typescript expression, and then we write three dots ... (the spread operator) which means that the object returned by the register() function will be spreading its properties onto the <Form.Control> component as props.
        // this register call gets destructured into many different properties that all get added to the <Form.Control> component, this is what this syntax means, it takes register and destructures its returned object into individual properties that are passed to the <Form.Control> component basically
        // register is a function that takes an argument, the first argument is the name of the title input field, which has to be one of the properties that are contained in our NoteInput which we assigned as the generic type to useForm() hook
        // register("title") is what connects this input field to the value that gets passed in, and react-hook-form later knows that when we submit this, that this is the "title" value that it will send to our onCreate function
        // this might be complicated at first, but this is how html forms work in react, and it gets easier the more you use it
        isInvalid={!!error} // we use double exclamation mark to turn this into a boolean via double-negating it. If the provided error is undefined, this will resolve to false and thus mean that the provided input is valid, but if the error contains a value this will resolve to true and thus it'll mean that the provided input is invalid
        />
        <Form.Control.Feedback type="invalid">
            {error?.message}
        </Form.Control.Feedback>

        </Form.Group>
    );
};

export default TextInputField;

/*
original code for how we used to define Form.Group inside AddEditNoteDialog, before we extracted its logic into this TextInputField component :)

                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Title"
                            isInvalid={!!errors.title} 
                            {...register("title", { required: "Required" })} 
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.title?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

*/