import React, { useContext, useState } from "react";
import { GlobalContext } from "../../utils/GlobalState";
import { ProgressAlert } from "./progressAlert";
import "./styles.css";

const rendered : string[] = [];

export function ProgressAlerts() {
    const gs = useContext(GlobalContext);
    return (
        <GlobalContext.Consumer>
            {value => 
                <div className="alerts">
                    {value.alerts && value.alerts.length != 0 && (
                        value.handleAlerts((a) => {
                            return <ProgressAlert key={a.id} alert={a} />
                        })  
                    )}
                </div>
            }
        </GlobalContext.Consumer>
    );
}