import { title } from "process";
import React, { useEffect, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SkillDto } from "../../contractTypes";
import { IsUserAdmin } from "../../utils/Helpers";
import { AppState, getStore } from "../../utils/Store";
import { LoadingSymbol } from "../Shared/LoadingSymbol";
import Skill from "./Skill";

function addUpdateSkill(skill: SkillDto) {
    const store = getStore();
    store.dispatch({
        type: "ADDUPDATE-SKILL",
        payload: {
            data: skill
        }
    });
}

function deleteSkill(skill: SkillDto) {
    const store = getStore();
    store.dispatch({
        type: "DELETE-SKILL",
        payload: {
            data: skill.id
        }
    });
}

function SkillList(props: Props) {
    const [showNewSkillField, setShowNewSkillField] = useState(false);
    
    const data = [...props.skills ?? []];
    const sorted = data?.sort((s1, s2) => s1.rate - s2.rate);

    return (
        <Col lg="10">
            {props.isAdmin &&(
                <>
                <Button className="mb-5"  onClick={() => setShowNewSkillField(true)}>Add new</Button>
                {props.isAdmin && showNewSkillField && (
                    <Skill skill={{id: -1 ,title:"", description:"", rate:0}} isAdmin={props.isAdmin} isEditMode={true} onChanged={(skill) => {
                        addUpdateSkill(skill);
                        setShowNewSkillField(false);
                    }} onAbort={() => setShowNewSkillField(false)} />
                )}
                </>
            )}
            
            <Row  className="skill-list">
                {sorted?.sort((s1,s2) => s2.rate - s1.rate).map((skill, i) => 
                    <Skill key={i} skill={skill} isAdmin={props.isAdmin} 
                        onChanged={(skill) => addUpdateSkill(skill)} 
                        onDelete={(skill) => deleteSkill(skill)} />)}
                {!props.skills && (
                    <LoadingSymbol />
                )}
                {props.skills && props.skills.length === 0 && (
                    <p>Failed to load skills</p>
                )}
            </Row>
        </Col>
    );
}

export default connect(
    (state: AppState) => {
        return {
            skills: state.aboutMe.skills.data,
            isAdmin: IsUserAdmin()
        };
    }
)(SkillList);

type Props = {
    skills: SkillDto[],
    isAdmin: boolean,
}