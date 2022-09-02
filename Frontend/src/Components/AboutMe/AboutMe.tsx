import { useQuery } from "@tanstack/react-query";
import React, { Dispatch, useEffect } from "react";
import { Row } from "react-bootstrap";
import { connect } from "react-redux";
import IntroText from "./IntroText";
import SkillList from "./SkillsList";
import "./style.css";

export function AboutMe(props: any) {
    

    return(
        <Row className="about-me justify-content-center">
            <IntroText />
            <SkillList />
        </Row>
    )
}