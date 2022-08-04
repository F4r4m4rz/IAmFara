import React from "react";
import { Row } from "react-bootstrap";
import IntroText from "./IntroText";
import SkillList from "./SkillsList";
import "./style.css";

export function AboutMe() {

    return(
        <Row className="about-me justify-content-center">
            <IntroText />
            <SkillList />
        </Row>
    )
}