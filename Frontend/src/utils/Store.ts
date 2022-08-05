import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { aboutMeReducer } from "../Components/AboutMe/AboutMeReducers";
import { userReducer } from "../Components/Login/LoginReducer";

export const reducers = {
    aboutMe: aboutMeReducer,
}

export const appReducers = combineReducers(reducers);

export type AppState = ReturnType<typeof store.getState>;

const store = configureStore({
    reducer: {
        aboutMe: aboutMeReducer,
        currentUser: userReducer
    }
});

export const getStore = () => store;