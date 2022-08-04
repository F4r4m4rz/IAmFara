import { Action, AnyAction, Reducer } from "redux";
import { AppEntityName } from "../contractTypes";

export interface IDataUpdated<AppEntityName> {
    type: "DATA_UPDATED",
    payload: {
        entityName: AppEntityName,
        key: string,
        data: any
    }
}
export interface IEntityMeta<T> {
    data: T
}

export class EntityMeta<T> implements IEntityMeta<T> {
    data: T;
    constructor(data?: T){
        this.data = data!;
    }
}

export function GenericReducer<TEntity>(
    name: AppEntityName, 
    baseReducer?: Reducer<IEntityMeta<TEntity>, Action<string>>
    ) : Reducer<IEntityMeta<TEntity>, AnyAction> {
    return (state = new EntityMeta<TEntity>(), action) => {
        switch (action.type) {
            case "DATA_UPDATED": {
                if (action.payload.entityName !== name) {
                    return {...state};
                }
                state = {...new EntityMeta<TEntity>(action.payload.data)};
            }
        }

        if (baseReducer){
            return baseReducer(state, action);
        }

        return state;
    }
}