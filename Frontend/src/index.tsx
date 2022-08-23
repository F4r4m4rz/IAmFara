import React from "react";
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import { apiServiceInstance } from "./utils/apiService";
import { getStore } from "./utils/Store";

(() => {
    const store = getStore();
    if (store) {
        apiServiceInstance.dispatch = store.dispatch;
    }
    
    store.dispatch({type: "AUTHENTICATE" });
    
    const root = createRoot(document.getElementById("root")!);
    root.render(
        <HashRouter>
            <App store={store} />
        </HashRouter>
    );
})();