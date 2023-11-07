import { Modal, Form, Button, Alert } from "react-bootstrap";
import { User } from "../models/user";
import { SignUpCredentials } from "../network/notes_api"
import * as NotesApi from "../network/notes_api"
import { useForm } from "react-hook-form";
import TextInputField from "./form/TextInputField";
import StylesUtils from "../styles/utils.module.css";
import { useState } from "react";
import { ConflictError, UnauthorizedError } from "../errors/http_errors";

interface SignUpModalProps {
    onDismiss: () => void,
    onSuccessSignUp: (user: User) => void,
}

const SignUpModal = ({ onDismiss, onSuccessSignUp }: SignUpModalProps) => {

    const [errorText, setErrorText] = useState<string|null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpCredentials>(); // we define no default values for this form's data state

    async function onSubmit(credentials: SignUpCredentials) {
        try {
            const user = await NotesApi.signup(credentials);
            onSuccessSignUp(user);
        } catch (error) {
            if (error instanceof ConflictError) {
                setErrorText(error.message);
            } else {
                alert(error);
            }
            console.log(error);
        }
    }

    return (
        <Modal show onHide={onDismiss}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Sign Up
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {
                    errorText &&
                    <Alert variant="danger">
                        {errorText}
                    </Alert>
                }

                <Form onSubmit={handleSubmit(onSubmit)}>

                    <TextInputField
                        name="username"
                        label="Username"
                        placeholder="Username"
                        register={register}
                        registerOptions={{ required: "Required" }}
                        type="text"
                        error={errors.username}
                    />

                    <TextInputField
                        name="email"
                        label="Email"
                        placeholder="Email"
                        register={register}
                        registerOptions={{ required: "Required" }}
                        type="email"
                        error={errors.email}
                    />

                    <TextInputField
                        name="password"
                        label="Password"
                        placeholder="Password"
                        register={register}
                        registerOptions={{ required: "Required" }}
                        type="password"
                        error={errors.password}
                    />

                    <Button // here we're not gonna have to link the id of the form like we did in AddEditNoteDialog's button because we declared this Button component INSIDE Form component
                        type="submit"
                        disabled={isSubmitting}
                        className={StylesUtils.width100}
                    >
                        Sign Up
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default SignUpModal;