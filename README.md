# APA Weekly Reports — GitHub Pages (Encrypted)

A static GitHub Pages site that lists all weekly status reports with **AES-256-GCM encryption**, password-protected login, search, and pagination.

## How it works

1. Reports are stored as plain `.html` files in `reports/` in the repo
2. On every push, the CI workflow:
   - Scans `reports/` and generates `reports.json`
   - Encrypts every `.html` file and `reports.json` with AES-256-GCM (key derived from password via PBKDF2)
   - Removes plaintext files from the deploy artifact
   - Deploys only encrypted `.enc` files to GitHub Pages
3. The `index.html` asks for a password, derives the same AES key in the browser, and decrypts content on the fly
4. Even if someone finds the direct URL to a report, they only see encrypted base64 data

## Structure

```
gh-page/
├── index.html                        # Main page (login + decrypt + report list)
├── reports/                          # Drop report HTML files here (plaintext in repo)
│   ├── 2026-06-02.html
│   ├── 2026-06-03.html
│   └── ...
├── scripts/
│   └── encrypt.mjs                   # Node.js encryption script (used by CI)
├── generate-hash.html                # Local tool to test encryption/decryption
└── .github/workflows/
    └── deploy.yml                    # CI: generate manifest → encrypt → deploy
```

## Setup

### 1. Set the encryption password as a GitHub secret

```bash
gh secret set ENCRYPT_PASSWORD -R <owner>/<repo> -b "your-password-here"
```

### 2. Add a new report

1. Place the report HTML file in `reports/` (e.g. `reports/2026-06-10.html`)
2. `git add`, `git commit`, `git push` to `main`
3. CI encrypts and deploys automatically

### 3. Change the password

1. Update the GitHub secret `ENCRYPT_PASSWORD` with the new password
2. Re-run the deploy workflow (or push any commit)
3. Users will need to sign in with the new password — old localStorage sessions auto-clear on failure

## Security model

| Aspect | Detail |
|---|---|
| Algorithm | AES-256-GCM |
| Key derivation | PBKDF2 with 100,000 iterations + SHA-256 |
| What's encrypted | All report HTML files + the report manifest (reports.json) |
| What's public | Only `index.html` (login page) and `generate-hash.html` |
| Password storage | GitHub Actions secret (never in source code) |
| Client session | Password saved in `localStorage` (persistent until logout) |
| Direct URL access | Returns base64 encrypted blob — useless without password |

This provides real data protection: even with full access to the deployed site, the content cannot be read without the password.
