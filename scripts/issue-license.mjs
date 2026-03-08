#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { createPrivateKey, sign } from 'node:crypto';
import { canonicalizePayload, base64UrlEncode } from './license-common.mjs';

const args = parseArgs(process.argv.slice(2));

const required = ['private-key', 'machine-fingerprint', 'licensed-user', 'licensed-org', 'license-id', 'key-id', 'out'];
for (const key of required) {
  if (!args[key]) {
    throw new Error(`Missing required argument --${key}`);
  }
}

const payload = {
  license_id: String(args['license-id']),
  licensed_user: String(args['licensed-user']),
  licensed_org: String(args['licensed-org']),
  machine_fingerprint: String(args['machine-fingerprint']),
  features: String(args.features ?? 'full_app')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean),
  issued_at: String(args['issued-at'] ?? new Date().toISOString()),
  issuer: String(args.issuer ?? 'Numerius Engineering LLC')
};

const canonical = canonicalizePayload(payload);
const privatePem = readFileSync(String(args['private-key']), 'utf8');
const privateKey = createPrivateKey(privatePem);
const signature = sign(null, Buffer.from(canonical, 'utf8'), privateKey);

const envelope = {
  alg: 'Ed25519',
  key_id: String(args['key-id']),
  payload,
  signature: base64UrlEncode(signature)
};

writeFileSync(String(args.out), JSON.stringify(envelope, null, 2), 'utf8');
console.log(`Issued license file: ${args.out}`);

function parseArgs(input) {
  const parsed = {};
  for (let i = 0; i < input.length; i += 1) {
    const token = input[i];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const next = input[i + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    i += 1;
  }
  return parsed;
}
