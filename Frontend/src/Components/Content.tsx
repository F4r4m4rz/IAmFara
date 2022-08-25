import React from "react";
import { Container } from "react-bootstrap";
import { Switch, Route, } from 'react-router-dom';
import AboutMe from "./AboutMe/AboutMe";
import ProgressAlerts from "./Alerts/ProgressAlerts";
import { ContactForm } from "./Contact/Contact";
import { Error } from "./Error/Error";
import { Gallery } from "./Gallery/Gallery";
import LoginComponent from "./Login/Login";
import SignupComponent from "./Login/Signup";
import { Protofolio } from "./Protofolio/Protofolio";
import "./style.css";

export function Content() {
    
    return(
        <Container>
            <Switch>
                <Route exact path="/" component={AboutMe}></Route>
                <Route path="/protofolio" component={Protofolio}></Route>
                <Route path="/contact" component={ContactForm}></Route>
                <Route path="/gallery" component={Gallery}></Route>
                <Route path="/login" component={LoginComponent}></Route>
                <Route path="/signup" component={SignupComponent}></Route>
                <Route path="/error" component={Error}></Route>
            </Switch>
        </Container>
    )
}