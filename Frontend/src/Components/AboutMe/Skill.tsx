import React from "react";

export enum SkillRate {
    beginner = 1,
    someExperience = 2,
    businessExperience = 3,
    expert = 4,
    master = 5
}

type SkillProps = {
    title: string;
    description?: string;
    rate: SkillRate;
}

const Skill = (props: SkillProps) => {
    
    return (
        <div className="col-lg-6">
            <div className="row">
                <div className="skill-title col">{props.title}</div>
                <div className="col">
                    {[...Array(props.rate)].map((rate, j) => {
                        return <i key={j} className="fa-solid fa-star"></i>
                    })}
                </div>
            </div>
            {props.description && (
                <p className="skill-description col-5">{props.description}</p>
            )}
        </div>
    )
}

export default Skill;