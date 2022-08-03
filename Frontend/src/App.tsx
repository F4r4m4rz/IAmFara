import React, { useLayoutEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, useRouteMatch } from 'react-router-dom';
import { Content } from "./Components/Content";
import { AppNavBar } from "./Components/NavBar/AppNavBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { IAppState } from "./utils/AppState";
import { AnyAction, Store } from "redux";
import { Provider } from "react-redux";

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

const App = ({ store }: { store: Store<IAppState>}) => {
    const [width, height] = useWindowsSize();
    const collapsed = width < 1000 ? true : false;
    
    return (
        <Provider store={store}>
            <AppNavBar collapsed={collapsed}/>
            <Content />
        </Provider>
    );
}

export default App;