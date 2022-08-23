import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SkillDto } from "../../contractTypes";
import { AppState } from "../../utils/Store";
import Skill from "./Skill";

function SkillList(props: Props) {
    
    return (
        <Col lg="10">
            <Row  className="skill-list">
                {props.skills?.map((skill, i) => <Skill key={i} id={skill.id} title={skill.title} description={skill.description} rate={skill.rate} />)}
            </Row>
        </Col>
        
    );
}

const mapDispatchToProps  = (dispatch: Dispatch) => {
    return {
        retriveData: () => dispatch({type: "GET_SKILLS"}),
    };
};

export default connect(
    (state: AppState) => {
        return {
            skills: state.aboutMe.skills.data
        };
    }
)(SkillList);

type Props = {
    skills: SkillDto[]
}