import React, { useLayoutEffect, useState } from "react";
import { Content } from "./Components/Content";
import { AppNavBarComponent } from "./Components/NavBar/AppNavBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Store } from "redux";
import { Provider } from "react-redux";
import { AppState } from "./utils/Store";
import ProgressAlerts from "./Components/Alerts/ProgressAlerts";


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

const App = ({ store }: { store: Store<AppState>}) => {
    const [width, height] = useWindowsSize();
    const collapsed = width < 1000 ? true : false;
    
    return (
        <Provider store={store}>
            <AppNavBarComponent collapsed={collapsed} />
            <ProgressAlerts />
            <Content />
        </Provider>
    );
}

export default App;