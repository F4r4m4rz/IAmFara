import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { Content } from "./Components/Content";
import 'bootstrap/dist/css/bootstrap.min.css';
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { GlobalState, GlobalStateProvider } from "./utils/GlobalState";
import { AlertDto, AlertLevelDto, ApiResponse, SecurityUser } from "./contractTypes";
import { apiServiceInstance } from "./utils/apiService";
import { AppNavBar } from "./Components/NavBar/AppNavBar";
import { ProgressAlerts } from "./Components/Alerts/ProgressAlerts";


export const App = () => {
  
    return (
        <GlobalStateProvider>
            <AppNavBar />
            <ProgressAlerts />
            <Content />
        </GlobalStateProvider>
    );
}
