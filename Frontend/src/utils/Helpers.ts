import { NotificationActionLevelDto } from "../contractTypes";
import { ApiAction, getStore } from "./Store";

export function IsUserAdmin() : boolean {
    const state = getStore().getState();
    
    if (state.currentUser?.data?.userRoles.find(r=>r.role == "Admin")) {
        return true;
    }

    return false;
}

export function Notify(level: NotificationActionLevelDto, message: string, dismissable: boolean = true, autoDissmiss: boolean = false, timeout: number = 0) : ApiAction {
    return {
        type: "NOTIFICATION-ACTION",
        payload: {
            data: {
                id: "",
                level,
                message,
                dismissable,
                autoDissmiss,
                timeout
            },
            entityName: "",
            key: ""
        }
    };
}