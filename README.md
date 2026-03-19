# TekVision Desktop Automation Take-Home

This repository is a Playwright skeleton for the desktop automation take-home.

## What is included

- API helper for creating deterministic test runs.
- Payload factory for building a known conversation state.
- Desktop page object with centralized selectors and flow helpers.
- A single end-to-end spec covering the core scenario.
- Placeholder report templates for bugs and coverage notes.

## Submission Notes

- Test summary: `docs/test-summary.md`
- Bug reports: `docs/bugs/`

## Prerequisites

- Node.js 16+.

This skeleton pins Playwright to a Node 16 compatible release so it can run in this environment. If you upgrade to Node 18+, you can also upgrade Playwright later.

## Install

```bash
npm install
npx playwright install
```

## Configure

Copy `.env.example` to `.env` if you want to override defaults.

Exploratory bug reproduction tests are opt-in and should not be enabled in the default config. To run them explicitly in PowerShell:

```powershell
$env:BUG_HUNT='true'
npx playwright test tests/bug-hunt.spec.js
```

## Run

```bash
npm test
```

For a visible browser:

```bash
npm run test:headed
```

## Notes on selectors

The mock desktop appears to be dynamic, so the page object keeps selectors in one place. If the first run shows locator mismatches, adjust them in `src/desktopPage.js` rather than inside the test.

## Suggested next steps

1. Run the test once and inspect the UI.
2. Tighten selectors based on the actual DOM.
3. Add assertions for profile and transcript fields you confirm in the desktop.
4. Add a second test targeting a known bug scenario.