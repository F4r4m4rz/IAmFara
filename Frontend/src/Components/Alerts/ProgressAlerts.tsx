import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { connect, useDispatch } from "react-redux";
import { NotificationActionLevelDto, ProgressNotificationDto } from "../../contractTypes";
import { AppState, getStore } from "../../utils/Store";
import { ProgressAlert } from "./progressAlert";
import "./styles.css";

const rendered : string[] = [];

function ProgressAlerts(props: AlertProps) {
    return (
        <div className="alerts">
            {props.alerts && props.alerts.length != 0 && (
               props.alerts.map((a) => {
                    return (
                        <ProgressAlert key={a.id} alert={a} />
                    );
               }) 
            )}
        </div>
    );
}

export default connect(
    (state: AppState) => {
        return {
            alerts: state.alerts.data
        };
    }
)(ProgressAlerts);

type AlertProps = {
    alerts: ProgressNotificationDto[]
}