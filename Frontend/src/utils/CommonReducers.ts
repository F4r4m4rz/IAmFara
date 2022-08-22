import { ProgressNotificationDto } from "../contractTypes";
import { EntityMeta } from "./GenericReducer";
import { ApiAction } from "./Store";

export function commonReducers(state: any, action: ApiAction) {
    switch (action.type) {
        case "UNHANDLED_EXCEPTION":
            window.location.href = `/#/error?correlationId=${action.payload.data["CorrelationId"]}&message=${action.payload.data["Message"]}`;
            break;
        default:
            break;
    }

    return {...state};
}