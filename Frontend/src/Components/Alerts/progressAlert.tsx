import React, { useState } from "react";
import { Col } from "react-bootstrap";
import Alert from "react-bootstrap/esm/Alert";
import { NotificationActionLevelDto, ProgressNotificationDto } from "../../contractTypes";

type Props = {
    alert: ProgressNotificationDto
}

export function ProgressAlert(props: Props) {
    const [show, setShow] = useState(true);
    if (props.alert.autoDismiss) {
        setInterval(()=> setShow(false), (props.alert.timeout ?? 5) * 1000);
    }

    let variant : string;
    switch (props.alert.level) {
        case NotificationActionLevelDto.Info:
            variant = "info";
            break;
        case NotificationActionLevelDto.Error:
            variant = "danger";
            break;
        case NotificationActionLevelDto.Warning:
            variant = "warning";
            break;
        case NotificationActionLevelDto.Success:
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