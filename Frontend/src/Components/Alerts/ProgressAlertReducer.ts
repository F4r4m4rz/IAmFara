import { combineReducers } from "redux";
import { ProgressNotificationDto } from "../../contractTypes";
import { EntityMeta } from "../../utils/GenericReducer";
import { ApiAction, IEntityMeta } from "../../utils/Store";

export function ProgressAlertReducer(state: IEntityMeta<ProgressNotificationDto[]> = new EntityMeta<ProgressNotificationDto[]>(), action: ApiAction) {
    switch (action.type) {
        case "NOTIFICATION-ACTION":
            const notifications : ProgressNotificationDto[] = [];
            if (state.data) {
                notifications.push(...state.data);
            }
            notifications.push(action.payload.data)
            state = {...new EntityMeta<ProgressNotificationDto[]>(notifications)};
            break;
        case "NOTIFIED":
            const liveNotifications = [...state.data].filter(a => a.id !== action.payload.data.id);
            state = {...new EntityMeta<ProgressNotificationDto[]>(liveNotifications)};
            break;
        default:
            break;
    }

    return {...state};
}
