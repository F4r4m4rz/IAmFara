import React from "react";
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { apiServiceInstance } from "./utils/apiService";
import { getStore } from "./utils/Store";

(() => {
    const store = getStore();
    if (store) {
        apiServiceInstance.dispatch = store.dispatch;
    }
    
    const root = createRoot(document.getElementById("root")!);
    root.render(
    <BrowserRouter>
        <App store={store} />
    </BrowserRouter>
    );
})();