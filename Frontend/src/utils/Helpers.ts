import { useContext } from "react";
import { AlertLevelDto, AlertDto, SecurityUser } from "../contractTypes";
import { GlobalContext } from "./GlobalState";

export function isAdmin(user: SecurityUser | null) : boolean {
    if (user) {
        return user.userRoles?.find(r => r.role === "Admin") !== undefined;
    }

    return false;
}

export function notify(level: AlertLevelDto, message: string, dismissable: boolean = true, autoDismiss: boolean = false, timeout: number = 0) : AlertDto {
    return {
        id: "",
        level,
        message,
        dismissable,
        autoDismiss,
        timeout
    };
}

export function useNotify(level: AlertLevelDto, message: string, dismissable: boolean = true, autoDismiss: boolean = false, timeout: number = 0) {
    const alert: AlertDto = {
        id: "",
        level,
        message,
        dismissable,
        autoDismiss,
        timeout
    };
    const gs = useContext(GlobalContext);
    gs.addAlerts([...[], alert]);
}