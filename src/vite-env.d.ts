/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDFLARE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/* WebOTP (Credential Management Level 1 extension) — not yet in the TS DOM lib */
interface OtpCredential extends Credential {
  readonly code: string;
}

interface OtpCredentialRequestOptions {
  otp: { transport: string[] };
}

interface CredentialRequestOptions {
  otp?: OtpCredentialRequestOptions['otp'];
}
