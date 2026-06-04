# APA Weekly Reports — GitHub Pages

A static GitHub Pages site that lists all weekly status reports with login protection, search, and pagination.

## Structure

```
gh-page/
├── index.html              # Main page (login + report list)
├── reports.json             # Auto-generated manifest of all reports
├── reports/                 # Drop report HTML files here
│   ├── 2026-06-02.html
│   ├── 2026-06-03.html
│   └── 2026-06-04.html
├── generate-hash.html       # Helper to generate new credential hashes
└── .github/workflows/
    └── build-manifest.yml   # CI: auto-rebuilds reports.json on push
```

## How to add a new report

1. Place the report HTML file in the `reports/` folder (e.g. `reports/2026-06-10.html`).
2. Commit and push to `main`.
3. The GitHub Actions workflow will automatically regenerate `reports.json`.
4. The main page will display the new report — no manual editing needed.

## Login credentials

Default: `apa` / `apa2026`

### Changing the password

1. Open `generate-hash.html` in a browser.
2. Enter the new username and password.
3. Copy the SHA-256 hash.
4. In `index.html`, replace the value of `CREDENTIALS_HASH` with the new hash.
5. Commit and push.

### Security model

This is a **client-side gate** — it prevents casual access but is not true server-side authentication (impossible on static GitHub Pages). The password is stored as a SHA-256 hash in the source code. The session is stored in `sessionStorage` (cleared when the browser tab closes). This is appropriate for internal/team reports that don't contain highly sensitive data.

For stronger security, consider hosting behind a VPN or using a private repo with GitHub Pages access controls (GitHub Enterprise).
