import { Action } from "redux";
import { combineReducers } from "redux";
import { IntroductionTextDto, SkillDto } from "../../contractTypes";
import { apiServiceInstance } from "../../utils/apiService";
import { EntityMeta, GenericReducer } from "../../utils/GenericReducer";
import { ApiAction, IEntityMeta } from "../../utils/Store";

function introTextReducer(state: IEntityMeta<IntroductionTextDto>  = new EntityMeta<IntroductionTextDto>(), action: ApiAction) {
    switch (action.type) {
        case "GET_INTROTEXT":
            apiServiceInstance.get("https://localhost:7260/api/aboutme/introtext");
            break;
        case "INTROTEXT-UPDATED":
            apiServiceInstance.post("https://localhost:7260/api/aboutme/introtext", action.payload.data);
            break;
        
        default:
            break;
    }

    return {...state};
}

function skillsReducer(state: IEntityMeta<SkillDto[]>  = new EntityMeta<SkillDto[]>(), action: ApiAction) {
    switch (action.type) {
        case "GET_SKILLS":
            apiServiceInstance.get("https://localhost:7260/api/aboutme/skills");
            break;
        case "ADDUPDATE-SKILL":
            apiServiceInstance.post("https://localhost:7260/api/aboutme/skills", action.payload.data);
            break;
        case "NEW-SKILL":
            const newSkillList = [...state.data];
            newSkillList.push(action.payload.data);
            state = {...new EntityMeta(newSkillList)};
            break;
        case "DELETE-SKILL":
            const id = action.payload.data;
            apiServiceInstance.delete(`https://localhost:7260/api/aboutme/skills?id=${id}`);
            break;
        case "SKILL-DELETED":
            const allSkills = [...state.data]
            const newList = allSkills.filter(s => s.id != action.payload.data);
            state = {...new EntityMeta(newList)};
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
