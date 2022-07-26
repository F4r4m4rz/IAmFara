import React, { useState } from "react";
import { useLocation } from "react-router";
import "./NavBar.css";
import { NavItem } from "./NavItem";

const items = [
    {title: "About me", href: "/"},
    {title: "Protofolio", href: "/protofolio"},
    {title: "Contact", href: "/contact"},
    {title: "Gallery", href: "/gallery"},
]

const NavList = () => {
    const {pathname} = useLocation();
    const activeItem = items.findIndex(i=>i.href.toLowerCase()===pathname.toLowerCase());

    const [activeItemIndex, setActiveItemIndex] = useState(activeItem ?? 0);
    
    const onClick = (index: number) => {
        setActiveItemIndex(index);
    }

    return (
        <div className="nav-list">   
            <ul>
                {
                    items.map((item, index) => {
                        return <NavItem key={index} title={item.title} href={item.href} last={index === items.length - 1} active={() => activeItemIndex === index} onClick={() => onClick(index)}/>
                    })
                }
            </ul>
        </div>
    );
}

export default NavList;