import React from "react";
import { SkillDto } from "../../contractTypes";


const Skill = (props: SkillDto) => {
    
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