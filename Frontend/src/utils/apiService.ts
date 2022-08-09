import { AnyAction, Dispatch } from "redux";

export class ApiService  {
    dispatch: Dispatch<AnyAction> | null = null;

    async get(url: string){
        const config: RequestInit = {method: "GET"};
        
        await fetch(url, config).then(async (r) => {
            const response = await r.json();

            if (this.dispatch){
                this.dispatch(response);
            }
        });
    }

    async post<T>(url: string, json: T) {
        const config: RequestInit = {method: "POST", body: JSON.stringify(json), headers:[["Accept", "application/json"],
        ["Content-Type", "application/json"]] };
        
        await fetch(url, config).then(async (r) => {
            const response = await r.json();
            
            if (this.dispatch){
                this.dispatch(response);
            }
        });
    }
}

export const apiServiceInstance = new ApiService();