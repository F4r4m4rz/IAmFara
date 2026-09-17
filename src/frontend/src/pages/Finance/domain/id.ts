/**
 * Generates a locally-unique id for a new entity. Prefers crypto.randomUUID()
 * when available, but that API requires a secure context (HTTPS) and is
 * simply absent on a plain-HTTP host — this app's devtest environment
 * currently has no SSL binding, and calling addTransaction there threw
 * synchronously inside the repository, silently rejecting the save (no
 * try/catch around the mutateAsync call in QuickAddSheet), which is why
 * Save appeared to do nothing at all. Falls back to a manually constructed
 * random id so entity creation never depends on the page being served over
 * HTTPS. Not cryptographically secure, which is fine — this is a local
 * identifier, not a secret.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to the manual generator below.
    }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}
