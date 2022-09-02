import React, { useLayoutEffect, useState } from "react";
import "./NavBar.css";
import AppNavList from "./AppNavList";
import {Container, Navbar, Row} from 'react-bootstrap';

function isCollapsed() : boolean {
    const [windowSize, setWindowSize] = useState([0,0]);
    useLayoutEffect(() => {
        function updateSize() {
            setWindowSize([window.innerWidth, window.innerHeight]);
        }

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    const [width, height] = windowSize;
    return width < 1000 ? true : false;
}

export function AppNavBar() {

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
                {isCollapsed() && (
                    <Navbar.Toggle className="ms-auto me-3" aria-controls="basic-navbar-nav" />
                )}
                <AppNavList collapsed={isCollapsed()} />
            </Container>
        </Navbar>
    );
}