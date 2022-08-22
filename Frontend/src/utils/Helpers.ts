import { getStore } from "./Store";

export function IsUserAdmin() : boolean {
    const state = getStore().getState();
    
    if (state.currentUser?.data?.userRoles.find(r=>r.role == "Admin")) {
        return true;
    }

    return false;
}