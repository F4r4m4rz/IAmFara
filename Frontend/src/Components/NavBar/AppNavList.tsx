import React, { useLayoutEffect, useState } from "react";
import { useLocation } from "react-router";
import "./NavBar.css";
import { AppNavItem } from "./AppNavItem";
import { Button, Nav, Navbar } from "react-bootstrap";

type NavListProps = {
    collapsed: boolean;
}

const items = [
    {title: "About me", href: "/"},
    {title: "Protofolio", href: "/protofolio"},
    {title: "Contact", href: "/contact"},
    {title: "Gallery", href: "/gallery"},
]

const AppNavList = (props: NavListProps) => {
    const {pathname} = useLocation();
    const activeItem = items.findIndex(i=>i.href.toLowerCase()===pathname.toLowerCase());
    
    const [activeItemIndex, setActiveItemIndex] = useState(activeItem ?? 0);
    
    const onClick = (index: number) => {
        setActiveItemIndex(index);
    }
    
    return (
        <Navbar.Collapse id="basic-navbar-nav bg-warning">   
            <Nav className="app-nav-list ms-auto me-5 text-end">
                {
                    items.map((item, index) => {
                        return <AppNavItem key={index} collapsed={props.collapsed} title={item.title} href={item.href} last={index === items.length - 1} active={() => activeItemIndex === index} onClick={() => onClick(index)}/>
                    })
                }
                <li>
                    <Button variant="outline-dark">Sign in</Button>
                </li>
                
            </Nav>
            
        </Navbar.Collapse>
    );
}

export default AppNavList;