import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ApiFinanceRepository } from "./data/ApiFinanceRepository";
import FinanceAppShell from "./FinanceAppShell";
import InviteSection from "./InviteSection";
import AcceptInvitation from "./pages/AcceptInvitation";
import SignIn from "./pages/SignIn";

const BASE_PATH = "/expenses/app";

/**
 * Top-level route for the real (authenticated) finance app (`/expenses/app`)
 * — the counterpart to FinanceApp.tsx's Demo Mode. Owns sign-in/invitation
 * routing itself, same pattern as FinanceApp.tsx owning its own sub-routes;
 * once a session and household are established it reuses the exact same
 * FinanceAppShell Demo Mode does, just backed by ApiFinanceRepository
 * instead of IndexedDbFinanceRepository.
 */
export default function RealFinanceApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="sign-in" element={<SignIn />} />
        <Route path="invite/:token" element={<AcceptInvitation />} />
        <Route path="*" element={<AuthenticatedApp />} />
      </Routes>
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const auth = useAuth();

  if (auth.userId === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-finance-bg text-finance-text">Loading…</div>;
  }
  if (auth.userId === null) {
    return <Navigate to={`${BASE_PATH}/sign-in`} replace />;
  }
  if (!auth.currentHousehold) {
    // Every account is created with a household already (see the plan's §2
    // new-user flow) — this is only reachable for the brief moment
    // households are still loading right after sign-in.
    return <div className="flex min-h-screen items-center justify-center bg-finance-bg text-finance-text">Loading…</div>;
  }

  return <HouseholdShell householdId={auth.currentHousehold.id} />;
}

function HouseholdShell({ householdId }: { householdId: string }) {
  const [repository] = useState(() => new ApiFinanceRepository(householdId));
  return (
    <FinanceAppShell
      repository={repository}
      basePath={BASE_PATH}
      showDemoTools={false}
      settingsExtraSection={<InviteSection />}
    />
  );
}
