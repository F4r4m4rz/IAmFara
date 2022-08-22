import { Action, AnyAction, Reducer } from "redux";
import { AppEntityName } from "../contractTypes";
import { ApiAction, IEntityMeta } from "./Store";

export class EntityMeta<T> implements IEntityMeta<T> {
    data: T;
    constructor(data?: T){
        this.data = data!;
    }
}

export function GenericReducer<TEntity>(
    name: AppEntityName, 
    baseReducer?: Reducer<IEntityMeta<TEntity>, ApiAction>
    ) : Reducer<IEntityMeta<TEntity>, ApiAction> {
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