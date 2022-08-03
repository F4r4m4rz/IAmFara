import React, { useLayoutEffect, useState } from "react";
import "./NavBar.css";
import AppNavList from "./AppNavList";
import {Button, Container, Nav, Navbar, Row} from 'react-bootstrap';

type NavBarProps = {
    collapsed: boolean;
}

export function AppNavBar(props: NavBarProps) {
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
                <AppNavList collapsed={props.collapsed} />
            </Container>
        </Navbar>
    );
}