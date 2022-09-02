import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { title } from "process";
import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApiResponse, SecurityUser, SkillDto, SkillRateDto } from "../../contractTypes";
import { apiServiceInstance } from "../../utils/apiService";
import { GlobalContext } from "../../utils/GlobalState";
import { isAdmin } from "../../utils/Helpers";
import { LoadingSymbol } from "../Shared/LoadingSymbol";
import Skill from "./Skill";


export default function SkillList() {
    const gs = useContext(GlobalContext);
    const qc = useQueryClient();
    
    const {isLoading, data, error} = useQuery<ApiResponse<SkillDto[]>, any>(["skills"], async () => {
        return await apiServiceInstance.get<SkillDto[]>("aboutme/skills");
        }, {onSuccess: (r) => {
            if (r?.alerts) {
               gs.addAlerts(r.alerts);
            }
        }
    });

    const mutation = useMutation(async (skill: SkillDto) => {
            return await apiServiceInstance.post<SkillDto, SkillDto>("aboutme/skills", skill);
        }, 
        {
            onSettled: (r) => {
                if (r) {
                    gs.addAlerts(r.alerts);
                }
            },
            onSuccess: async (_) => {
                await qc.invalidateQueries(["skills"]);
            }
    });
    
    if (isLoading) return <LoadingSymbol />;
    if (error) return <p>{error.message}</p>;
    if (!data?.data || !data.data) return <p>No data to show</p>;

    function addOrUpdateSkill(skill: SkillDto) {
        mutation.mutate(skill);
    }
    
    return (
        <GlobalContext.Consumer>
            {value => 
            <Col lg="10">
                {isAdmin(value.currentUser) &&(
                    <AdminMode skills={data.data} addOrUpdateSkill={addOrUpdateSkill} />
                )}
                {!isAdmin(value.currentUser) && (
                    <ReadonlyModel skills={data.data} />
                )}
            </Col>
            }
        </GlobalContext.Consumer>
    );
}

type AdminModeProps = {
    skills: SkillDto[] | null,
    addOrUpdateSkill: (skill: SkillDto) => void
} & Props

function AdminMode(props: AdminModeProps) {
    const [showNewSkillField, setShowNewSkillField] = useState(false);

    return (
        <>
            <div>
                <Button className="mb-5"  onClick={() => setShowNewSkillField(true)}>Add new</Button>
                {showNewSkillField && (
                    <Skill skill={{id: -1 ,title:"", description:"", rate:0}} isAdmin={true} isEditMode={true} onChanged={(skill) => {
                        props.addOrUpdateSkill(skill);
                        setShowNewSkillField(false);
                    }} onAbort={() => setShowNewSkillField(false)} />
                )}
            </div>
            <Row>
                <RenderSkills skills={props.skills} isAdmin={true} onUpdate={props.addOrUpdateSkill} />
            </Row>
        </>
    )
}

type Props = {
    skills: SkillDto[] | null
}

function ReadonlyModel(props: Props) {
    
    return (
        <Row  className="skill-list">
            <RenderSkills skills={props.skills} isAdmin={false} />
        </Row>
    )
}

function RenderSkills(props: {skills: SkillDto[] | null, isAdmin: boolean, onUpdate?: (skill: SkillDto) => void}) {
    if (!props.skills) return <p>No data!</p>

    const sorted = props.skills.sort((s1, s2) => s2.rate - s1.rate);
    
    return (
        <>
            {sorted.map((skill, i) => <Skill key={i} skill={skill} isAdmin={props.isAdmin} onChanged={props.onUpdate} />)}
        </>
    )
}