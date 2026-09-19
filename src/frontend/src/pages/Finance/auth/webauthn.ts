/**
 * Thin wrapper around the browser's native WebAuthn JSON helpers
 * (PublicKeyCredential.parseCreationOptionsFromJSON/parseRequestOptionsFromJSON
 * and credential.toJSON()) — Baseline 2025, available in all current
 * browsers. The backend's options responses and expected completion bodies
 * already use the same base64url JSON shape these methods produce/consume
 * (verified directly against Fido2NetLib's own serialization), so no manual
 * ArrayBuffer/base64url conversion is needed anywhere in this app.
 */

export class WebAuthnUnsupportedError extends Error {
  constructor() {
    super("This browser doesn't support passkeys.");
    this.name = "WebAuthnUnsupportedError";
  }
}

function assertSupported() {
  if (!window.PublicKeyCredential?.parseCreationOptionsFromJSON) {
    throw new WebAuthnUnsupportedError();
  }
}

/** Runs a registration ceremony from the server's PublicKeyCredentialCreationOptionsJSON, returning the resulting credential's JSON to send back to the server. */
export async function createPasskey(optionsJson: unknown): Promise<unknown> {
  assertSupported();
  const options = PublicKeyCredential.parseCreationOptionsFromJSON(
    optionsJson as PublicKeyCredentialCreationOptionsJSON,
  );
  const credential = await navigator.credentials.create({ publicKey: options });
  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("Passkey registration was cancelled or failed.");
  }
  return credential.toJSON();
}

/** Runs an authentication (assertion) ceremony from the server's PublicKeyCredentialRequestOptionsJSON, returning the resulting credential's JSON to send back to the server. */
export async function getPasskey(optionsJson: unknown): Promise<unknown> {
  assertSupported();
  const options = PublicKeyCredential.parseRequestOptionsFromJSON(
    optionsJson as PublicKeyCredentialRequestOptionsJSON,
  );
  const credential = await navigator.credentials.get({ publicKey: options });
  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("Passkey sign-in was cancelled or failed.");
  }
  return credential.toJSON();
}
