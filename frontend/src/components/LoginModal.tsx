import { useForm } from "react-hook-form";
import { Modal, Form, Button } from "react-bootstrap";
import { User } from "../models/user";
import { LoginCredentials } from "../network/notes_api";
import * as NotesApi from "../network/notes_api";
import TextInputField from "./form/TextInputField";
import StylesUtil from "../styles/utils.module.css";

interface LoginModalProps {
    onDismiss: () => void,
    onLoginSuccess: (user: User) => void,
}

const LoginModal = ({onDismiss, onLoginSuccess}: LoginModalProps) => {

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>();

    async function onSubmit(credentials: LoginCredentials) {
        try {
            const user = await NotesApi.login(credentials);
            onLoginSuccess(user);
        } catch (error) {
            alert(error);
            console.log(error);
        }
    }

    return (
        <Modal show onHide={onDismiss} >
            <Modal.Header closeButton>
                <Modal.Title>
                    Login
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <TextInputField
                    name="username"
                    label="Username"
                    placeholder="Login"
                    type="text"
                    register={register}
                    registerOptions={{required: "Required"}}
                    error={errors.username}
                    />

                    <TextInputField
                    name="password"
                    label="Password"
                    placeholder="Password"
                    type="password"
                    register={register}
                    registerOptions={{required: "Required"}}
                    error={errors.password}
                    />

                    <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={StylesUtil.width100}
                    >
                        Login
                    </Button>
                </Form>
            </Modal.Body>

        </Modal>
    );
}

export default LoginModal;