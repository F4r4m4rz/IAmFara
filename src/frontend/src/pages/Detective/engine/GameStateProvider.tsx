import { createContext, Dispatch, ReactNode, useContext, useReducer } from "react";
import { createInitialGameState, gameReducer } from "./gameReducer";
import { GameAction, GameState } from "./types";

const GameStateContext = createContext<GameState | null>(null);
const GameDispatchContext = createContext<Dispatch<GameAction> | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);

  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>{children}</GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

export function useGameState(): GameState {
  const state = useContext(GameStateContext);
  if (!state) throw new Error("useGameState must be used within a GameStateProvider");
  return state;
}

export function useGameDispatch(): Dispatch<GameAction> {
  const dispatch = useContext(GameDispatchContext);
  if (!dispatch) throw new Error("useGameDispatch must be used within a GameStateProvider");
  return dispatch;
}
