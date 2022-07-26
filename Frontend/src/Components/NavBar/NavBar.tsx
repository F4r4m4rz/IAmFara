import React from "react";
import "./NavBar.css";
import NavList from "./NavList";

export function NavBar() {
    return (
        <div className="navbar">
            <div className="icon">
                <img className="face-icon" src="../../Resources/images/picture.jpg" alt="picture" />
                <div className="icon-txt">I am Fara</div>
            </div>
            <NavList />
        </div>
    );
}