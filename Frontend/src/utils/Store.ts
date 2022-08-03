import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { aboutMeReducer } from "../Components/AboutMe/AboutMeReducers";

export const reducers = {
    aboutMe: aboutMeReducer,
}

export const appReducers = combineReducers(reducers);

export type AppState = ReturnType<typeof store.getState>;

const store = configureStore({
    reducer: {
        aboutMe: aboutMeReducer
    },
});

export const getStore = () => store;