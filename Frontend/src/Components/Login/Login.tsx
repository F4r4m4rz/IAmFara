import React, { useState } from "react";
import { Button, Form, FormLabel } from "react-bootstrap";
import { Link } from "react-router-dom";
import { SignInDto } from "../../contractTypes";
import { getStore } from "../../utils/Store";

const onLogin = (model: SignInDto) => {
    var store = getStore();
    
    store.dispatch({
        type: "LOGIN",
        payload: {
            data: model
        }
    });
}

function LoginComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const onSubmit = () => {
        const model = {
            email,
            password
        };

        onLogin(model);
    }

    return (
        <>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email address" onChange={(e) => setEmail(e.currentTarget.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.currentTarget.value)} />
                </Form.Group>
                <Button variant="primary" onClick={onSubmit}>
                    Log in
                </Button>
            </Form>
            <Link to="/signup">Or sign up here</Link>
        </>
    )
}

export default LoginComponent;