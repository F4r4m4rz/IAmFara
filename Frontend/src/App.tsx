import React, { useLayoutEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, useRouteMatch } from 'react-router-dom';
import { Content } from "./Components/Content";
import { AppNavBar } from "./Components/NavBar/AppNavBar";
import 'bootstrap/dist/css/bootstrap.min.css';

function useWindowsSize() {
    const [windowSize, setWindowSize] = useState([0,0]);
    useLayoutEffect(() => {
        function updateSize() {
            setWindowSize([window.innerWidth, window.innerHeight]);
        }

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return windowSize;
}

const App = () => {
    const [width, height] = useWindowsSize();
    const collapsed = width < 1000 ? true : false;
    
    return (
        <>
            <AppNavBar collapsed={collapsed}/>
            <Content />
        </>
    );
}

export default App;