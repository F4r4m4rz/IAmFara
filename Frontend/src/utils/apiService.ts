import { AnyAction, Dispatch } from "redux";

export class ApiService  {
    dispatch: Dispatch<AnyAction> | null = null;

    async get(url: string){
        const config: RequestInit = {method: "GET"};
        
        const response = await (await fetch(url, config)).json();
        
        if (this.dispatch){
            this.dispatch(response);
        }
    }
}

export const apiServiceInstance = new ApiService();