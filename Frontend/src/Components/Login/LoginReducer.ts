import { Reducer } from "react";
import { Action, AnyAction } from "redux";
import { SecurityUser, SignInDto, SignUpDto } from "../../contractTypes";
import { apiServiceInstance } from "../../utils/apiService";
import { EntityMeta } from "../../utils/GenericReducer";
import { ApiAction, IEntityMeta } from "../../utils/Store";

export function userReducer(state: IEntityMeta<SecurityUser> = new EntityMeta(), action: ApiAction) {
    switch (action.type) {
        case "AUTHENTICATE":
            apiServiceInstance.get("https://localhost:7260/api/user");
            break;
        case "AUTHENTICATED":
            state = {...new EntityMeta<SecurityUser>(action.payload.data)};
            break;
        case "UN-AUTHENTICATED":
            state = {...new EntityMeta<SecurityUser>()};
            break;
        case "SIGNUP": 
            apiServiceInstance.post<SignUpDto>("https://localhost:7260/api/user/signup", action.payload.data);
            break;
        case "LOGIN":
            apiServiceInstance.post<SignInDto>("https://localhost:7260/api/user/signin", action.payload.data);
            break;
        case "SUCCESSFUL-LOGIN":
            window.location.href = "/#";
            state = {...new EntityMeta<SecurityUser>(action.payload.data)};
            break;
        case "LOGOUT":
            apiServiceInstance.get("https://localhost:7260/api/user/logout");
            break;
        default:
            break;
    }

    return {...state};
}

