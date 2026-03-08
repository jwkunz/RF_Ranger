# RF Ranger

RF Ranger is a browser-based radio experimentation planning application packaged as a single-file web app.

## Licensing Operations (Private Repo)

This repository includes offline licensing support using signed license files.

### Customer License Request Process
1. Customer opens RF Ranger and copies `Machine Fingerprint` from `Preferences -> License Management`.
2. Customer emails the fingerprint and customer details to `numerius.engineering@gmail.com`.
3. Numerius issues a signed license file and sends it back to the customer.
4. Customer installs the file from `Preferences -> License Management -> Install License`.

### Key Management Scripts
- Generate keypair:
  - `npm run license:keypair`
  - Output:
    - `scripts/keys/license-public.spki.base64url.txt`
    - `scripts/keys/license-private.pkcs8.pem`
- Issue license file:
  - `npm run license:issue -- --private-key scripts/keys/license-private.pkcs8.pem --machine-fingerprint <fp_value> --licensed-user \"User Name\" --licensed-org \"Org Name\" --license-id LIC-0001 --key-id main-2026 --out ./customer.license.json`

### Embedded Public Key
The app verifies licenses with the embedded public key in `src/license.ts`.

If you rotate keys:
1. Generate new keypair.
2. Update `LICENSE_PUBLIC_KEY_SPKI_BASE64` in `src/license.ts` to the new public key.
3. Build and release a new app version.
4. Issue new customer license files with the new private key.

### GitHub Release Workflow Behavior
On tag push `vX.Y.Z` (from `main`), `.github/workflows/release.yml` now:
1. Generates an Ed25519 keypair in `scripts/keys/`.
2. Builds release zip via `scripts/build-release.sh`.
3. Publishes `build/rf-ranger-vX.Y.Z.zip` as release artifact.

The release ZIP includes:
- `index.html`
- `VERSION`
- `LEGAL.md`
- `Manual.md`
- `license-keys/` (generated keypair files)

## Development
- Type-check: `npm run check`
- Build: `npm run build`
- Dev server: `npm run dev`
