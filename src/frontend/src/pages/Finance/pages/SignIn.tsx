import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { signInWithPasskey } from "../auth/authClient";
import { WebAuthnUnsupportedError } from "../auth/webauthn";

export default function SignIn() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithPasskey();
      await auth.refresh();
      navigate("/expenses/app", { replace: true });
    } catch (err) {
      setError(err instanceof WebAuthnUnsupportedError ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-finance-bg px-6 text-finance-text">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-finance-border bg-finance-surface p-8 text-center">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-finance-muted">Use the passkey on this device to sign in to your household.</p>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={busy}
          className="w-full rounded-xl bg-finance-accent px-4 py-3 font-medium text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in with a passkey"}
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <p className="text-xs text-finance-muted">
          Don't have an account yet? You need an invitation link from a household member.
        </p>
      </div>
    </div>
  );
}
