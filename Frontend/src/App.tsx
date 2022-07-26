import React from "react";
import { BrowserRouter as Router, Switch, Route, useRouteMatch } from 'react-router-dom';
import { Content } from "./Components/Content";
import { NavBar } from "./Components/NavBar/NavBar";

const App = () => {
    
    return (
        <>
            <NavBar />
            <Content />
        </>
    );
}

export default App;