import React, { useState } from "react";
import Alert from "react-bootstrap/esm/Alert";
import { AlertLevelDto, AlertDto } from "../../contractTypes";

type Props = {
    alert: AlertDto
}

export function ProgressAlert(props: Props) {
    const [show, setShow] = useState(true);
    if (props.alert.autoDismiss) {
        setInterval(()=> setShow(false), (props.alert.timeout ?? 5) * 1000);
    }

    let variant : string;
    switch (props.alert.level) {
        case AlertLevelDto.Info:
            variant = "info";
            break;
        case AlertLevelDto.Error:
            variant = "danger";
            break;
        case AlertLevelDto.Warning:
            variant = "warning";
            break;
        case AlertLevelDto.Success:
            variant = "success";
            break;
        default:
            variant = "info";
            break;
    }

    return (
        <>
        {show && (
            <Alert className="alert" key={props.alert.id} variant={variant} dismissible={props.alert.dismissable} onClose={()=>setShow(false)}>
                <p>
                    {props.alert.message}
                </p>
            </Alert>
        )}
        </>
    );
}