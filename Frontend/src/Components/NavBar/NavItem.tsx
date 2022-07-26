import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

type NavItemProps = {
    active: () => boolean;
    href: string;
    title: string;
    onClick: () => void;
    last?: boolean;
}

export function NavItem(props: NavItemProps) {
    const onClick = () => {
        props.onClick();
    }

    return (
        <li className={"nav-item" + (props.active() ? " active" : "") + (props.last ? " last" : "")}>
            <Link to={props.href} onClick={onClick}>
                {props.title}
            </Link>
        </li>
    );
}