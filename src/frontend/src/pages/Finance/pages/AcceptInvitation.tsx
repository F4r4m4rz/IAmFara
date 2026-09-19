import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { consumeHouseholdInvitation, registerNewUserWithPasskey } from "../auth/authClient";
import { WebAuthnUnsupportedError } from "../auth/webauthn";

/**
 * A single link handles both invitation flows (see the plan's §2): an
 * already-signed-in user just redeems the household token directly; an
 * anonymous visitor is offered account creation instead (the identity
 * invitation flow), which auto-joins the linked household — or creates a new
 * one — on the server once the passkey ceremony succeeds. Which case applies
 * is entirely a server-side decision (see HouseholdFacade
 * .TryJoinFromLinkedIdentityInvitationAsync); the frontend just picks the UI
 * based on whether a session already exists.
 */
export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const auth = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) return <ErrorScreen message="This invitation link is missing its token." />;
  if (auth.userId === undefined) return <LoadingScreen />;

  const goToApp = async () => {
    await auth.refresh();
    navigate("/expenses/app", { replace: true });
  };

  const handleJoin = async () => {
    setBusy(true);
    setError(null);
    try {
      await consumeHouseholdInvitation(token);
      await goToApp();
    } catch (err) {
      setError(err instanceof Error ? err.message : "This invitation link is invalid or has expired.");
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await registerNewUserWithPasskey(token, displayName.trim());
      await goToApp();
    } catch (err) {
      setError(err instanceof WebAuthnUnsupportedError || err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-finance-bg px-6 text-finance-text">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-finance-border bg-finance-surface p-8 text-center">
        {auth.userId ? (
          <>
            <h1 className="text-xl font-semibold">Join household</h1>
            <p className="text-sm text-finance-muted">You've been invited to join a household.</p>
            <button
              type="button"
              onClick={handleJoin}
              disabled={busy}
              className="w-full rounded-xl bg-finance-accent px-4 py-3 font-medium text-white transition-transform active:scale-95 disabled:opacity-60"
            >
              {busy ? "Joining…" : "Join household"}
            </button>
          </>
        ) : (
          <form onSubmit={handleRegister} className="flex w-full flex-col gap-4">
            <h1 className="text-xl font-semibold">Create your account</h1>
            <p className="text-sm text-finance-muted">What's your name?</p>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              required
              className="rounded-xl border border-finance-border bg-finance-bg px-4 py-3 text-finance-text"
            />
            <button
              type="submit"
              disabled={busy || displayName.trim().length === 0}
              className="w-full rounded-xl bg-finance-accent px-4 py-3 font-medium text-white transition-transform active:scale-95 disabled:opacity-60"
            >
              {busy ? "Setting up…" : "Continue with a passkey"}
            </button>
          </form>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return <div className="flex min-h-screen items-center justify-center bg-finance-bg text-finance-text">Loading…</div>;
}

function ErrorScreen({ message }: { message: string }) {
  return <div className="flex min-h-screen items-center justify-center bg-finance-bg px-6 text-center text-finance-text">{message}</div>;
}
