#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateKeyPairSync } from 'node:crypto';
import { base64UrlEncode } from './license-common.mjs';

const outputDirArg = process.argv[2] ?? 'scripts/keys';
const outputDir = resolve(outputDirArg);
mkdirSync(outputDir, { recursive: true });

const { publicKey, privateKey } = generateKeyPairSync('ed25519');
const publicSpkiDer = publicKey.export({ type: 'spki', format: 'der' });
const privatePkcs8Pem = privateKey.export({ type: 'pkcs8', format: 'pem' });

const publicPath = resolve(outputDir, 'license-public.spki.base64url.txt');
const privatePath = resolve(outputDir, 'license-private.pkcs8.pem');

writeFileSync(publicPath, base64UrlEncode(publicSpkiDer), 'utf8');
writeFileSync(privatePath, privatePkcs8Pem, 'utf8');

console.log(`Generated Ed25519 keypair:
- Public key (SPKI base64url): ${publicPath}
- Private key (PKCS#8 PEM): ${privatePath}
`);
