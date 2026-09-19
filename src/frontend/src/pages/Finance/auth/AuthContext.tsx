import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUserId, getMyHouseholds, MyHousehold, signOut as apiSignOut } from "./authClient";

interface AuthState {
  /** undefined while the initial session check is in flight. */
  userId: string | null | undefined;
  households: MyHousehold[];
  /** The household Real Mode is currently showing — the first one found, until multi-household switching exists. */
  currentHousehold: MyHousehold | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [households, setHouseholds] = useState<MyHousehold[]>([]);

  const refresh = useCallback(async () => {
    const id = await getCurrentUserId();
    setUserId(id);
    setHouseholds(id ? await getMyHouseholds() : []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setUserId(null);
    setHouseholds([]);
  }, []);

  const value: AuthState = {
    userId,
    households,
    currentHousehold: households[0] ?? null,
    refresh,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
