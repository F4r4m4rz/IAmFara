import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from "react-router-dom";
import { App } from "./App";

const appQueryClient = new QueryClient();

(() => {
    const root = createRoot(document.getElementById("root")!);
    root.render(
        <QueryClientProvider client={appQueryClient}>
            <HashRouter>
                <App />
            </HashRouter>
        </QueryClientProvider>
    );
})();