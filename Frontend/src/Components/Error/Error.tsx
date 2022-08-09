import React from "react";
import { useLocation } from "react-router";

export function Error() {
    const location = useLocation();
    const search = new URLSearchParams(location.search);
    const correlationId = search.get("correlationId");
    const message = search.get("message");
    return(
        <div>
            An unhandled error occured.
            <h5>CorrelationId:</h5>
            <p>{correlationId}</p>
            <h5>Message:</h5>
            <p>{message}</p>
        </div>
    );
}