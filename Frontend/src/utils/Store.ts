import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { aboutMeReducer } from "../Components/AboutMe/AboutMeReducers";
import { userReducer } from "../Components/Login/LoginReducer";
import { commonReducers } from "./CommonReducers";

export const reducers = {
    aboutMe: aboutMeReducer,
}

export const appReducers = combineReducers(reducers);

export type AppState = Omit<ReturnType<typeof store.getState>, "common">;

const store = configureStore({
    reducer: {
        aboutMe: aboutMeReducer,
        currentUser: userReducer,
        common: commonReducers
    }
});

export const getStore = () => store;