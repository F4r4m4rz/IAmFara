import React, { useState } from "react";
import { Button, Form, FormLabel } from "react-bootstrap";
import { SignUpDto } from "../../contractTypes";
import { getStore } from "../../utils/Store";

const onSignup = (model: SignUpDto) => {
    var store = getStore();
    
    store.dispatch({
        type: "SIGNUP",
        payload: {
            data: model
        }
    });
}

function SignupComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    
    const onSubmit = () => {
        const model = {
            email,
            firstName,
            lastName,
            password
        };

        onSignup(model);
    }

    return (
        <>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email address" onChange={(e) => setEmail(e.currentTarget.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>First name</Form.Label>
                    <Form.Control type="name" placeholder="Enter first name" onChange={(e) => setFirstName(e.currentTarget.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Last name</Form.Label>
                    <Form.Control type="name" placeholder="Enter last name" onChange={(e) => setLastName(e.currentTarget.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.currentTarget.value)} />
                </Form.Group>
                <Button variant="primary" onClick={onSubmit}>
                    Sign up
                </Button>
            </Form>
        </>
    )
}

export default SignupComponent;