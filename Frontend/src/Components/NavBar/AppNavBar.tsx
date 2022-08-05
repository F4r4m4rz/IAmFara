import React, { useLayoutEffect, useState } from "react";
import "./NavBar.css";
import AppNavList from "./AppNavList";
import {Button, Container, Nav, Navbar, Row} from 'react-bootstrap';
import { connect, ConnectedProps } from "react-redux";
import { AppState } from "../../utils/Store";

function AppNavBar(props: Props) {
    return (
        <Navbar bg="white" expand="lg" className="app-nav-bar">
            <Container fluid>
                <Navbar.Brand>
                    <Container>
                        <Row>
                            <img className="face-icon col-9" src="../../Resources/images/picture.jpg" alt="picture" />
                            <div className="icon-txt col-3 align-self-end">
                                I am Fara
                            </div>
                        </Row>
                    </Container>
                </Navbar.Brand>
                {props.collapsed && (
                    <Navbar.Toggle className="ms-auto me-3" aria-controls="basic-navbar-nav" />
                )}
                <AppNavList collapsed={props.collapsed} currentUser={props.currentUser.data} />
            </Container>
        </Navbar>
    );
}

type ExternalProps = {
    collapsed: boolean
}

const connector = connect(
    (state: AppState, p: ExternalProps) => {
        return {
            currentUser: state.currentUser
        }
    }
)

type Props = ConnectedProps<typeof connector> & ExternalProps;

export const AppNavBarComponent = connector(AppNavBar);