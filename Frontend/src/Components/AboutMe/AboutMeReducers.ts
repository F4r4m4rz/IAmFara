import { Action } from "redux";
import { combineReducers } from "redux";
import { IntroductionTextDto } from "../../contractTypes";
import { apiServiceInstance } from "../../utils/apiService";
import { EntityMeta, EntityState, GenericReducer } from "../../utils/GenericReducer";

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

const entityReducers = {
    introText: GenericReducer<IntroductionTextDto>("IntroductionText", introTextReducer),
}

export const aboutMeReducer = combineReducers(entityReducers);
