import React, { useLayoutEffect, useState } from "react";
import { Content } from "./Components/Content";
import { AppNavBarComponent } from "./Components/NavBar/AppNavBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Store } from "redux";
import { Provider } from "react-redux";
import { AppState } from "./utils/Store";
import ProgressAlerts from "./Components/Alerts/ProgressAlerts";

const App = ({ store }: { store: Store<AppState>}) => {
    
    return (
        <Provider store={store}>
            <AppNavBarComponent />
            <ProgressAlerts />
            <Content />
        </Provider>
    );
}

export default App;