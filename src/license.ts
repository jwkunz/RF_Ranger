import type { LicenseEnvelope, LicensePayload, LicenseValidationStatus } from './types';

export interface LicenseValidationResult {
  status: LicenseValidationStatus;
  reason: string;
  metadata: {
    licensedTo: string;
    licenseId: string;
    issuedAt: string;
    issuer: string;
    keyId: string;
    features: string[];
  };
}

const DEFAULT_METADATA: LicenseValidationResult['metadata'] = {
  licensedTo: 'Unlicensed',
  licenseId: 'N/A',
  issuedAt: 'N/A',
  issuer: 'N/A',
  keyId: 'N/A',
  features: []
};

export const LICENSE_PUBLIC_KEY_SPKI_BASE64 = 'MCowBQYDK2VwAyEAhgsdLrjRlbgE+QxEiPnL4303W4yX4svVvaHmjUkLjLU=';

export function canonicalizePayload(payload: LicensePayload): string {
  return canonicalizeValue(payload);
}

export async function computeMachineFingerprint(): Promise<string> {
  const parts = [
    navigator.userAgent || '',
    navigator.platform || '',
    navigator.language || '',
    String((navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 0),
    String((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0),
    String(screen.width || 0),
    String(screen.height || 0),
    String(screen.colorDepth || 0),
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    navigator.vendor || ''
  ];
  const input = parts.join('|');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return `fp_${base64UrlEncode(new Uint8Array(digest))}`;
}

export async function validateLicense(
  license: LicenseEnvelope | undefined,
  machineFingerprint: string,
  publicKeySpkiBase64: string = LICENSE_PUBLIC_KEY_SPKI_BASE64
): Promise<LicenseValidationResult> {
  if (!license) {
    return { status: 'missing', reason: 'No license installed.', metadata: DEFAULT_METADATA };
  }

  if (license.alg !== 'Ed25519' || typeof license.key_id !== 'string' || typeof license.signature !== 'string' || !license.payload) {
    return { status: 'payload_invalid', reason: 'License envelope is malformed.', metadata: DEFAULT_METADATA };
  }

  const payload = license.payload as Partial<LicensePayload>;
  if (
    typeof payload.license_id !== 'string' ||
    typeof payload.licensed_user !== 'string' ||
    typeof payload.licensed_org !== 'string' ||
    typeof payload.machine_fingerprint !== 'string' ||
    !Array.isArray(payload.features) ||
    typeof payload.issued_at !== 'string' ||
    typeof payload.issuer !== 'string'
  ) {
    return { status: 'payload_invalid', reason: 'License payload fields are invalid.', metadata: DEFAULT_METADATA };
  }

  const metadata = {
    licensedTo: `${payload.licensed_user} (${payload.licensed_org})`,
    licenseId: payload.license_id,
    issuedAt: payload.issued_at,
    issuer: payload.issuer,
    keyId: license.key_id,
    features: payload.features
  };

  try {
    const canonical = canonicalizePayload(payload as LicensePayload);
    const key = await crypto.subtle.importKey(
      'spki',
      base64Decode(publicKeySpkiBase64),
      { name: 'Ed25519' },
      false,
      ['verify']
    );
    const verified = await crypto.subtle.verify(
      { name: 'Ed25519' },
      key,
      new Uint8Array(base64Decode(license.signature)),
      new TextEncoder().encode(canonical)
    );
    if (!verified) {
      return { status: 'invalid_signature', reason: 'License signature verification failed.', metadata };
    }
  } catch (_error) {
    return { status: 'tampered', reason: 'License verification could not be completed.', metadata };
  }

  if (payload.machine_fingerprint !== machineFingerprint) {
    return {
      status: 'machine_mismatch',
      reason: 'License is valid but bound to a different machine fingerprint.',
      metadata
    };
  }

  return { status: 'valid', reason: 'License is valid.', metadata };
}

function canonicalizeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalizeValue(entry)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonicalizeValue(entry)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function base64Decode(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64UrlEncode(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
