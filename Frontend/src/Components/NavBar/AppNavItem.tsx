import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

type NavItemProps = {
    collapsed: boolean;
    active: () => boolean;
    href: string;
    title: string;
    onClick: () => void;
    last?: boolean;
}

export function AppNavItem(props: NavItemProps) {
    return (
        <li className={`${!props.collapsed ? `app-nav-item app-nav-item-md nav-item ${(props.last ? " last" : "")}` : ""} `}>
            <Link className={"nav-link" + (props.active() ? " active" : "")} to={props.href} onClick={props.onClick}>
                {props.title}
            </Link>
        </li>
    );
}