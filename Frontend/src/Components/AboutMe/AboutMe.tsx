import React, { Dispatch, useEffect } from "react";
import { Row } from "react-bootstrap";
import { connect } from "react-redux";
import IntroText from "./IntroText";
import SkillList from "./SkillsList";
import "./style.css";

function AboutMe(props: any) {
    
    useEffect(()=> {
        props.dispatch({type: "GET_SKILLS"});
        props.dispatch({type: "GET_INTROTEXT"});
    });
    
    return(
        <Row className="about-me justify-content-center">
            <IntroText />
            <SkillList />
        </Row>
    )
}

export default connect(null, null)(AboutMe);