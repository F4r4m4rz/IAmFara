import { AnyAction, Dispatch } from "redux";
import { ApiAction, ApiResponse } from "./Store";

export class ApiService  {
    dispatch: Dispatch<ApiAction> | null = null;

    async get(url: string){
        const config: RequestInit = {method: "GET"};
        
        await fetch(url, config).then(async (r) => {
            const response = await r.json()  as ApiResponse;

            this.dispatchActions(response);
        });
    }

    async post<T>(url: string, json: T) {
        const config: RequestInit = {method: "POST", body: JSON.stringify(json), headers:[["Accept", "application/json"],
        ["Content-Type", "application/json"]] };
        
        await fetch(url, config).then(async (r) => {
            const response = await r.json() as ApiResponse;
            
            this.dispatchActions(response);
        });
    }

    async delete(url: string){
        const config: RequestInit = {method: "DELETE"};
        
        await fetch(url, config).then(async (r) => {
            const response = await r.json()  as ApiResponse;

            this.dispatchActions(response);
        });
    }

    dispatchActions(response: ApiResponse) {
        if (response && response.actions){
            response.actions.forEach(action => {
                if (this.dispatch){
                    this.dispatch(action);
                }
            });
        }
    }
}





export const apiServiceInstance = new ApiService();