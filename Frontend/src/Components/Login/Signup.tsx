import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useContext, useState } from "react";
import { Button, Form, FormLabel } from "react-bootstrap";
import { Redirect } from "react-router";
import { SecurityUser, SignUpDto } from "../../contractTypes";
import { apiServiceInstance } from "../../utils/apiService";
import { GlobalContext, GlobalState } from "../../utils/GlobalState";

function SignupComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const queryClient = useQueryClient();
    const globalContext = useContext(GlobalContext);

    const mutation = useMutation(async (m: SignUpDto) => {
        return await apiServiceInstance.post<SignUpDto, SecurityUser>("user/signup", m);
    }, { onSuccess: async (result) => {
        await queryClient.invalidateQueries(["authenticate"]);
        if (result.alerts){
            globalContext.addAlerts(result.alerts);
        }
    } });
    
    const onSubmit = (globalState: GlobalState) => {
        const model = {
            email,
            firstName,
            lastName,
            password
        };

        mutation.mutate(model);
    }

    return (
        <GlobalContext.Consumer>
            {value => 
            <>
                {value.currentUser && (
                    <>
                        <p>Already logged in ...</p>
                        {mutation.isSuccess && (
                            <Redirect to="/"/>
                        )}
                    </>
                )}
                {!value.currentUser && (
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
                        <Button variant="primary" onClick={() => onSubmit(value)}>
                            Sign up
                        </Button>
                    </Form>
                </>
                )}
            </>
            }
        </GlobalContext.Consumer>
    )
}

export default SignupComponent;