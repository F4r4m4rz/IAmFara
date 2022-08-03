import React, { useReducer } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { SkillDto, SkillRateDto } from "../../contractTypes";
import { getStore } from "../../utils/Store";
import Skill from "./Skill";

/*var staticSkills : SkillDto[] = [
    {title: "C#", description: "somthing", rate: SkillRateDto.expert},
    {title: ".Net core", description: "somthing", rate: SkillRateDto.businessExperience},
    {title: "react", description: "somthing", rate: SkillRateDto.master},
    {title: "Python", description: "somthing", rate: SkillRateDto.beginner},
    {title: "C++", description: "somthing", rate: SkillRateDto.someExperience},
]*/

var staticSkills = () => {
    const store = getStore();
    store?.dispatch({type: "skills/get"});

    const state = store?.getState();
    return state?.skills ?? [];
}

const SkillList = () => {
    return (
        <Col lg="10">
            <Row  className="skill-list">
                {staticSkills().map((skill, i) => <Skill key={i} title={skill.title} description={skill.description} rate={skill.rate} />)}
            </Row>
        </Col>
        
    );
}

export default SkillList;