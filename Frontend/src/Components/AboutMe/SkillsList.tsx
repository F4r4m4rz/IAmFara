import React from "react";
import Skill from "./Skill";

var staticSkills = [
    {title: "C#", description: "somthing", rate: 5},
    {title: ".Net core", description: "somthing", rate: 3},
    {title: "react", description: "somthing", rate: 4},
    {title: "Python", description: "somthing", rate: 3},
    {title: "C++", description: "somthing", rate: 1},
]

const SkillList = () => {
    return (
        <div  className="skill-list container row">
            {staticSkills.map((skill, i) => <Skill key={i} title={skill.title} description={skill.description} rate={skill.rate} />)}
        </div>
    );
}

export default SkillList;