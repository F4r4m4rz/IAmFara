import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useContext, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link, Redirect } from "react-router-dom";
import { SecurityUser, SignInDto } from "../../contractTypes";
import { apiServiceInstance } from "../../utils/apiService";
import { GlobalContext } from "../../utils/GlobalState";

function LoginComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const gs = useContext(GlobalContext);
    const queryClient = useQueryClient();

    const mutation = useMutation(async (m: SignInDto) => {
        return await apiServiceInstance.post<SignInDto, SecurityUser>("user/signin", m);
    }, { onSuccess: async (result) => {
        await queryClient.invalidateQueries(["authenticate"]);
        if (result.alerts){
            gs.addAlerts(result.alerts);
        }
    } });
    
    const onSubmit = () => {
        const model = {
            email,
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
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.currentTarget.value)} />
                                </Form.Group>
                                <Button variant="primary" onClick={() => onSubmit()}>
                                    Log in
                                </Button>
                            </Form>
                            <Link to="/signup">Or sign up here</Link>
                        </>
                    )}
                </>
            }
        </GlobalContext.Consumer>
    )
}

export default LoginComponent;