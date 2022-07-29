import React from "react";
import {IntroText} from "./IntroText";
import SkillList from "./SkillsList";

export function AboutMe() {

    return(
        <div className="about-me bg-danger">
            <IntroText />
            <SkillList />
        </div>
    )
}