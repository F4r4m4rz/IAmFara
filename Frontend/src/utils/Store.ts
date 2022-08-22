import { AnyAction, combineReducers, configureStore } from "@reduxjs/toolkit";
import { aboutMeReducer } from "../Components/AboutMe/AboutMeReducers";
import { ProgressAlertReducer } from "../Components/Alerts/ProgressAlertReducer";
import { userReducer } from "../Components/Login/LoginReducer";
import { IntroductionTextDto, ProgressNotificationDto, SecurityUser, SkillDto } from "../contractTypes";
import { commonReducers } from "./CommonReducers";

export const reducers = {
    aboutMe: aboutMeReducer,
}

export interface IEntityMeta<T> {
    data: T
}

export type ApiActionPayload = {
    entityName: string,
    key: string,
    data: any,
}

export type ApiAction = {
    type: string,
    payload: ApiActionPayload
}

export type ApiResponse = {
    actions: ApiAction[]
}

export const appReducers = combineReducers(reducers);

export type AppState = {
    aboutMe: {
        introText: IEntityMeta<IntroductionTextDto>,
        skills: IEntityMeta<SkillDto[]>
    },
    currentUser: IEntityMeta<SecurityUser>,
    alerts: IEntityMeta<ProgressNotificationDto[]>,
    common: any
}

const store = configureStore<AppState, ApiAction>({
    reducer: {
        aboutMe: aboutMeReducer,
        currentUser: userReducer,
        alerts: ProgressAlertReducer,
        common: commonReducers,
    }
});

export const getStore = () => store;