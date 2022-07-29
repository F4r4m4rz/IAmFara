import React from "react";
import { Switch, Route, } from 'react-router-dom';
import { AboutMe } from "./AboutMe/AboutMe";
import { ContactForm } from "./Contact/Contact";
import { Gallery } from "./Gallery/Gallery";
import { Protofolio } from "./Protofolio/Protofolio";

export function Content() {
    
    return(
        <div className="container bg-primary">
            <Switch>
                <Route exact path="/" component={AboutMe}></Route>
                <Route path="/protofolio" component={Protofolio}></Route>
                <Route path="/contact" component={ContactForm}></Route>
                <Route path="/gallery" component={Gallery}></Route>
            </Switch>
        </div>
    )
}