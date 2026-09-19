import { createPasskey, getPasskey } from "./webauthn";

/**
 * Talks to /api/auth/* and /api/households/* (everything except the
 * household-scoped finance data itself, which is ApiFinanceRepository's job).
 * Same-origin in both dev (Vite proxy, see vite.config.ts) and production
 * (the built SPA is served directly by the backend) — credentials: "include"
 * is set explicitly anyway, since that's what actually makes the auth/CSRF
 * cookies flow.
 */

let cachedCsrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;
  const response = await fetch("/api/auth/csrf-token", { credentials: "include" });
  if (!response.ok) throw new Error("Could not obtain a CSRF token.");
  const body = (await response.json()) as { token: string };
  cachedCsrfToken = body.token;
  return cachedCsrfToken;
}

/** Fetch wrapper for state-changing requests: attaches the CSRF header/credentials, JSON content-type. GET requests skip the CSRF token (the backend doesn't require one for them). */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (method !== "GET") {
    headers.set("X-CSRF-TOKEN", await getCsrfToken());
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(path, { ...init, headers, credentials: "include" });
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error((body as { error?: string } | null)?.error ?? `Request to ${path} failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

/** Null when there's no active session. */
export async function getCurrentUserId(): Promise<string | null> {
  const response = await apiFetch("/api/auth/me");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Could not check the current session.");
  const body = (await response.json()) as { userId: string | null };
  return body.userId;
}

export async function signOut(): Promise<void> {
  await apiFetch("/api/auth/sign-out", { method: "POST" });
  cachedCsrfToken = null; // the session cookie is now invalid; force a fresh token next time
}

export interface MyHousehold {
  id: string;
  name: string;
  role: "member" | "owner";
}

export function getMyHouseholds(): Promise<MyHousehold[]> {
  return apiJson("/api/households/mine");
}

export interface HouseholdMember {
  userId: string;
  displayName: string;
  email: string;
  role: "member" | "owner";
}

export function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  return apiJson(`/api/households/${householdId}/members`);
}

export async function createHouseholdInvitation(householdId: string, email: string, role: "member" | "owner"): Promise<string> {
  const body = await apiJson<{ token: string }>(`/api/households/${householdId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
  return body.token;
}

export function consumeHouseholdInvitation(token: string): Promise<{ householdId: string; role: "member" | "owner" }> {
  return apiJson("/api/households/invitations/consume", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

/** Registers a passkey for the currently signed-in user (adding another credential to their own account). */
export async function registerPasskeyForCurrentUser(): Promise<void> {
  const beginResponse = await apiFetch("/api/auth/passkeys/register/begin", { method: "POST" });
  if (!beginResponse.ok) throw new Error("Could not start passkey registration.");
  const ceremonyId = beginResponse.headers.get("X-Ceremony-Id");
  if (!ceremonyId) throw new Error("Server didn't return a ceremony id.");
  const options = await beginResponse.json();

  const attestationResponse = await createPasskey(options);

  await apiJson("/api/auth/passkeys/register/complete", {
    method: "POST",
    body: JSON.stringify({ ceremonyId, attestationResponse }),
  });
}

/** Full passkey sign-in for an existing user — usernameless (the authenticator itself presents whichever resident credential the user picks). */
export async function signInWithPasskey(): Promise<string> {
  const beginResponse = await apiFetch("/api/auth/passkeys/login/begin", { method: "POST" });
  if (!beginResponse.ok) throw new Error("Could not start passkey sign-in.");
  const ceremonyId = beginResponse.headers.get("X-Ceremony-Id");
  if (!ceremonyId) throw new Error("Server didn't return a ceremony id.");
  const options = await beginResponse.json();

  const assertionResponse = await getPasskey(options);

  const body = await apiJson<{ userId: string }>("/api/auth/passkeys/login/complete", {
    method: "POST",
    body: JSON.stringify({ ceremonyId, assertionResponse }),
  });
  return body.userId;
}

/** New-user registration via an invitation token — auto-joins the linked household, or creates a new one, on the server. Returns the new user's id. */
export async function registerNewUserWithPasskey(token: string, displayName: string): Promise<string> {
  const beginResponse = await apiFetch("/api/auth/passkeys/register-new-user/begin", {
    method: "POST",
    body: JSON.stringify({ token, displayName }),
  });
  if (!beginResponse.ok) {
    const body = await beginResponse.json().catch(() => null);
    throw new Error((body as { error?: string } | null)?.error ?? "This invitation link is invalid or has expired.");
  }
  const ceremonyId = beginResponse.headers.get("X-Ceremony-Id");
  if (!ceremonyId) throw new Error("Server didn't return a ceremony id.");
  const options = await beginResponse.json();

  const attestationResponse = await createPasskey(options);

  const body = await apiJson<{ userId: string }>("/api/auth/passkeys/register-new-user/complete", {
    method: "POST",
    body: JSON.stringify({ ceremonyId, attestationResponse }),
  });
  return body.userId;
}
