import { AnyAction, Dispatch } from "redux";
import { ApiResponse } from "../contractTypes";

export class ApiService  {
    mainUrl : string = "https://localhost:7260/api/v2/";

    async get<T>(url: string) : Promise<ApiResponse<T>> {
        const config: RequestInit = {method: "GET"};
        const response = await fetch(this.mainUrl + url, config);
        return await response.json() as ApiResponse<T>;
    }

    async post<T, U>(url: string, json: T) : Promise<ApiResponse<U>> {
        const config: RequestInit = {method: "POST", body: JSON.stringify(json), headers:[["Accept", "application/json"],
        ["Content-Type", "application/json"]] };

        const response = await fetch(this.mainUrl + url, config);
        return await response.json() as ApiResponse<U>;
    }

    async delete<T>(url: string) :Promise<ApiResponse<T>> {
        const config: RequestInit = {method: "DELETE"};
        
        const response = await fetch(this.mainUrl + url, config);
        return await response.json() as ApiResponse<T>;
    }
}

export const apiServiceInstance = new ApiService();