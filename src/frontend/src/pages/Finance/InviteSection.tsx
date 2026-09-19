import { useState } from "react";
import { useAuth } from "./auth/AuthContext";
import { createHouseholdInvitation, createStandaloneInvitation } from "./auth/authClient";

type InviteMode = "join" | "new";

/**
 * Real Mode's household/invite UI, rendered inside Settings (see
 * FinanceAppShell's settingsExtraSection) — never mounted in Demo Mode.
 * An Owner can choose to invite someone into their own household or give
 * them a fresh one; a plain Member can only do the latter (see
 * HouseholdFacade.CreateInvitationAsync's Owner-only check on the backend).
 */
export default function InviteSection() {
  const auth = useAuth();
  const isOwner = auth.currentHousehold?.role === "owner";
  const [mode, setMode] = useState<InviteMode>(isOwner ? "join" : "new");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setLink(null);
    try {
      const token =
        mode === "join" && auth.currentHousehold
          ? await createHouseholdInvitation(auth.currentHousehold.id, email.trim(), "member")
          : await createStandaloneInvitation(email.trim());
      setLink(`${window.location.origin}/expenses/app/invite/${token}`);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the invitation.");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-finance-muted">Invite someone</h2>
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-finance-border bg-finance-surface px-4 py-3">
        {isOwner ? (
          <div role="group" aria-label="Invitation type" className="flex rounded-lg bg-finance-bg p-1">
            <button
              type="button"
              onClick={() => setMode("join")}
              aria-pressed={mode === "join"}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                mode === "join" ? "bg-finance-accent text-white" : "text-finance-muted"
              }`}
            >
              Join my household
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              aria-pressed={mode === "new"}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                mode === "new" ? "bg-finance-accent text-white" : "text-finance-muted"
              }`}
            >
              Give them a new household
            </button>
          </div>
        ) : (
          <p className="text-xs text-finance-muted">
            You can invite someone to start their own, separate household. Only a household Owner can invite someone into this one.
          </p>
        )}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Their email"
          required
          className="w-full rounded-lg border border-finance-border bg-finance-bg px-3 py-2 text-sm text-finance-text outline-none focus:border-finance-accent"
        />
        <button
          type="submit"
          disabled={busy || email.trim().length === 0}
          className="w-full rounded-lg bg-finance-accent px-4 py-2 text-sm font-medium text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create invitation"}
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {link && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-finance-border bg-finance-surface px-3 py-2">
          <span className="flex-1 truncate text-xs text-finance-text" dir="ltr">
            {link}
          </span>
          <button type="button" onClick={copyLink} className="shrink-0 text-xs font-medium text-finance-accentText">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </section>
  );
}
