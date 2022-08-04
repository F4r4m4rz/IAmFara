import { Action } from "redux";
import { combineReducers } from "redux";
import { IntroductionTextDto, SkillDto } from "../../contractTypes";
import { apiServiceInstance } from "../../utils/apiService";
import { EntityMeta, GenericReducer } from "../../utils/GenericReducer";

function introTextReducer(state: EntityMeta<IntroductionTextDto>  = new EntityMeta<IntroductionTextDto>(), action: Action<string>) {
    switch (action.type) {
        case "GET_INTROTEXT":
            apiServiceInstance.get("https://localhost:7260/api/aboutme/introtext");
            break;
        default:
            break;
    }

    return {...state};
}

function skillsReducer(state: EntityMeta<SkillDto[]>  = new EntityMeta<SkillDto[]>(), action: Action<string>) {
    switch (action.type) {
        case "GET_SKILLS":
            apiServiceInstance.get("https://localhost:7260/api/aboutme/skills");
            break;
        default:
            break;
    }

    return {...state};
}

const entityReducers = {
    introText: GenericReducer<IntroductionTextDto>("IntroductionText", introTextReducer),
    skills: GenericReducer<SkillDto[]>("Skill", skillsReducer)
}

export const aboutMeReducer = combineReducers(entityReducers);
