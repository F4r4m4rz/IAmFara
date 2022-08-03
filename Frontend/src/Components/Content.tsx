import React from "react";
import { Container } from "react-bootstrap";
import { Switch, Route, } from 'react-router-dom';
import { AboutMe } from "./AboutMe/AboutMe";
import { ContactForm } from "./Contact/Contact";
import { Gallery } from "./Gallery/Gallery";
import { Protofolio } from "./Protofolio/Protofolio";

export function Content() {
    
    return(
        <Container>
            <Switch>
                <Route exact path="/" component={AboutMe}></Route>
                <Route path="/protofolio" component={Protofolio}></Route>
                <Route path="/contact" component={ContactForm}></Route>
                <Route path="/gallery" component={Gallery}></Route>
            </Switch>
        </Container>
    )
}