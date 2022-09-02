import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Dispatch } from "redux";
import { SkillDto, SkillRateDto } from "../../contractTypes";
import { StarRate } from "../Shared/StarRate";

type Props = {
    skill: SkillDto,
    isAdmin: boolean,
    isEditMode?: boolean,
    onChanged?: (skill: SkillDto) => void,
    onDelete?: (skill: SkillDto) => void,
    onAbort?: () => void
}

const Skill = (props: Props) => {
    const [isEditMode, setIsEditMode] = useState(props.isEditMode ?? false);

    return (
        <div className="col-lg-6">
            {isEditMode && (
                <EditableSkill skill={props.skill} onSubmit={(skill) => {
                    if (props.onChanged){
                        props.onChanged(skill);
                    }
                    setIsEditMode(false);
                }} onAbort={() => {
                    if (props.onAbort){
                        props.onAbort();
                    }
                    setIsEditMode(false)
                }} />
            )}
            {!isEditMode && (
                renderNotEditable(props.skill, props.isAdmin, () => setIsEditMode(true), props.onDelete)
            )}
        </div>
    )
}

function renderNotEditable(skill: SkillDto, isAdmin: boolean, onEditable: () => void, onDelete?: (skill: SkillDto) => void) {
    return(
        <div className="skill-card">
            {isAdmin && (
                <div>
                    <a href="#" onClick={onEditable}>
                        <i className="fa-solid fa-pencil"></i> 
                    </a>
                    {onDelete && (
                        <a href="#"  className="m-2" onClick={() => onDelete(skill)}>
                            <i className="fa-solid fa-trash-can"></i>
                        </a>
                    )}
                    
                </div>
            )}
            <div className="row">
                <div className="skill-title col">{skill.title}</div>
                <div className="col">
                    <StarRate numberOfActiveStars={skill.rate} editable={false} numberOfTotalStars={5} />
                </div>
            </div>
            {skill.description && (
                <p className="skill-description col-5">{skill.description}</p>
            )}
        </div>
    )
}

type EditableProps = {
    skill: SkillDto,
    onSubmit: (skill: SkillDto) => void,
    onAbort: () => void
}

function EditableSkill(props: EditableProps) {
    const {skill, onSubmit} = props;

    const [editedTitle, setEditedTitle] = useState(skill.title);
    const [editedDesc, setEditedDesc] = useState(skill.description);
    const [editedRate, setEditedRate] = useState(skill.rate === 0 ? 1 : skill.rate);

    const handleSubmit = () => {
        const newSkill = {
            id: props.skill.id,
            title: editedTitle,
            description: editedDesc,
            rate: editedRate
        };
        onSubmit(newSkill);
    }

    return(
        <>
            <Form onSubmit={handleSubmit}>
                <Button type="submit" variant="link">
                    <i className="fa-solid fa-check"></i>
                </Button>
                <Button variant="link" onClick={props.onAbort}>
                    <i className="fa-solid fa-xmark"></i>
                </Button>
                <Form.Group>
                    <Row>
                        <Col>
                            <Form.Control required as="textarea" rows={1} placeholder="Title" defaultValue={editedTitle} onChange={(e) => setEditedTitle(e.currentTarget.value)}></Form.Control>
                        </Col>
                        <Col>
                            <StarRate numberOfActiveStars={editedRate} editable={true} numberOfTotalStars={5} onChange={(selectedRate) => setEditedRate(selectedRate)}  />
                        </Col>
                    </Row>
                </Form.Group>
                <Form.Group>
                    <Form.Control as="textarea" rows={1} placeholder="Description" defaultValue={editedDesc} onChange={(e) => setEditedDesc(e.currentTarget.value)}></Form.Control>
                </Form.Group>
            </Form>
            
        </>
    )
}

export default Skill;