# APA Weekly Reports — GitHub Pages (Encrypted)

A static GitHub Pages site for weekly status reports with **AES-256-GCM encryption**, login, search, sorting, bookmarks, and pagination.

## Features

| Feature | Description |
|---|---|
| **AES-256-GCM Encryption** | All reports and the manifest are encrypted at deploy time. Deployed files are unreadable without the password |
| **Login** | Username + password form. Credentials are combined as `user:pass` and used as the encryption key |
| **Persistent session** | Password saved in `localStorage` — no need to re-login until you sign out |
| **Search** | Real-time search by report title or date |
| **Sort** | Sort by date (newest/oldest) or title (A-Z / Z-A) |
| **Pin / Bookmark** | Pin important reports — pinned reports always appear at the top. Saved in `localStorage` |
| **Pagination** | 10 reports per page with smart page navigation |
| **Auto-deploy** | Push a new `.html` file to `reports/` → CI encrypts and deploys automatically |
| **In-page viewer** | Reports open in an iframe overlay — no page navigation needed |

## Structure

```
gh-page/
├── index.html                        # Main page (login + features)
├── reports/                          # Drop report HTML files here
│   ├── 2026-06-02.html
│   ├── 2026-06-03.html
│   └── ...
├── scripts/
│   └── encrypt.mjs                   # Encryption script (used by CI)
├── generate-hash.html                # Local encryption/decryption test tool
└── .github/workflows/
    └── deploy.yml                    # CI: manifest → encrypt → deploy
```

## How it works

1. Reports are stored as **plain HTML** in `reports/` in the git repo
2. On every push to `main`, the CI workflow:
   - Scans `reports/` and generates `reports.json`
   - Encrypts every `.html` and `reports.json` using AES-256-GCM (PBKDF2 key derivation, 100k iterations)
   - Removes all plaintext from the deploy artifact
   - Deploys only `.enc` files to GitHub Pages
3. The browser derives the same AES key from `username:password`, decrypts content on the fly
4. Direct URL access to any `.enc` file returns only encrypted base64 data

## Setup

### 1. Set the encryption secret

Go to **Repo → Settings → Secrets → Actions → New repository secret**:

| Name | Value |
|---|---|
| `ENCRYPT_PASSWORD` | `username:password` (e.g. `apa:apa2026`) |

Or via CLI (requires admin access):

```bash
gh secret set ENCRYPT_PASSWORD -R owner/repo -b "username:password"
```

### 2. Add a new report

```bash
cp my-report.html gh-page/reports/2026-06-10.html
cd gh-page
git add reports/2026-06-10.html
git commit -m "report: add week 5"
git push origin main
```

CI handles the rest — no manual editing of `index.html` needed.

### 3. Change credentials

1. Update the `ENCRYPT_PASSWORD` secret with the new `username:password`
2. Push any commit (or re-run the workflow) to re-encrypt with the new key
3. Users sign in with the new credentials — old sessions auto-clear on decrypt failure

## Security model

| Aspect | Detail |
|---|---|
| Algorithm | AES-256-GCM |
| Key derivation | PBKDF2 · 100,000 iterations · SHA-256 |
| Encrypted | All `.html` reports + `reports.json` manifest |
| Public | Only `index.html` (login page) and `generate-hash.html` |
| Secret storage | GitHub Actions secret (never in source code) |
| Client session | `username:password` in `localStorage` (persistent until sign-out) |
| Direct URL access | Returns encrypted base64 blob — useless without credentials |

## Default credentials

- **Username:** `apa`
- **Password:** `apa2026`
