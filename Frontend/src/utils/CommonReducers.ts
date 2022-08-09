import { AnyAction } from "redux";

export function commonReducers(state: any, action: AnyAction) {
    switch (action.type) {
        case "UNHANDLED_EXCEPTION":
            window.location.href = `/#/error?correlationId=${action.payload.data["CorrelationId"]}&message=${action.payload.data["Message"]}`;
            break;
    
        default:
            break;
    }

    return {...state};
}