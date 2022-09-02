import { useState } from "react";
import { createContext } from "react";
import { AlertDto, SecurityUser } from "../contractTypes";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiServiceInstance } from "./apiService";

export type IGlobalState = {
    currentUser: SecurityUser | null,
    alerts: AlertDto[],
}

export class GlobalState implements IGlobalState {
    currentUser: SecurityUser | null;
    alerts: AlertDto[];
    setGlobalState: React.Dispatch<React.SetStateAction<GlobalState>>;

    /**
     *
     */
    constructor() {
        this.currentUser = null;
        this.alerts = [];
        this.setGlobalState = (currentState) => {};
    }

    setCurrentUser = (user: SecurityUser | null) => {
        if (this.setGlobalState) {
            this.setGlobalState((currentState) => {
                if (user){
                    return {...currentState, currentUser: {...user}};
                }
                else return {...currentState, currentUser: null};
            })
        }
    }

    addAlerts = (alerts: AlertDto[]) => {
        if (this.setGlobalState) {
            this.setGlobalState((currentState) => {
                this.alerts = [...this.alerts, ...alerts];
                return {...currentState, alerts: [...this.alerts]};
            })
        }
    }

    handleAlerts = (action: (a: AlertDto) => any) : any[] => {
        const actionResults: any[] = [];
        const alertsToHandle = [...this.alerts];
        alertsToHandle.forEach(alert => {
            actionResults.push(action(alert));
        });

        const notHandledAlerts = this.alerts.filter(a => alertsToHandle.find(ha => ha.id !== a.id));
        this.alerts = [...notHandledAlerts];

        return actionResults;
    }
}

const defaultState: IGlobalState = new GlobalState();

export const GlobalContext = createContext<GlobalState>(new GlobalState());

export const GlobalStateProvider = ({children} : any) => {
    
    const [globalState, setGlobalState] = useState(new GlobalState());
    globalState.setGlobalState = setGlobalState;

    // Attach current user
    const query = useQuery(["authenticate"], async () => {
        return await apiServiceInstance.get<SecurityUser>("user");
    }, {onSuccess: (r) => {
        globalState.setCurrentUser(r.data);
    }})

    return <GlobalContext.Provider value={globalState}>{children}</GlobalContext.Provider>
}