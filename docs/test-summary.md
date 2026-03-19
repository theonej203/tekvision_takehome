# Test Summary

## Scope

This submission covers the core desktop workflow for the TekVision take-home using Playwright and documents confirmed product defects found during exploratory testing.

## Features Covered

- Create a deterministic test run via `/api/testrun`
- Open the desktop with the returned run ID
- Handle the initial desktop state and set the agent to `Ready` when needed
- Accept the incoming chat invite
- Validate interaction metadata rendered in the desktop
- Validate authenticated profile content
- Validate transcript content from the seeded payload
- Send a live chat message from the agent
- Validate that the live message renders in the conversation

## Main Test Status

- Baseline automated flow: passing
- Command used: `npm test`
- Default behavior: exploratory bug repro tests are skipped unless `BUG_HUNT=true`

## Bugs Found

1. Not Ready Agent Can Still Accept Chat
   - Severity: high
   - Summary: an agent marked `Not Ready` still receives an incoming chat invite, can accept it, and can send live messages.
   - Report: `docs/bugs/not-ready-agent-can-still-accept-chat.md`

2. Message Count Badge Stops At 35
   - Severity: medium
   - Summary: the conversation continues updating after 35 messages, but the badge stops increasing.
   - Report: `docs/bugs/message-count-badge-stops-at-35.md`

3. Single Message Count Uses Plural Label
   - Severity: low
   - Summary: a one-message transcript is labeled `1 messages` instead of `1 message`.
   - Report: `docs/bugs/single-message-count-uses-plural-label.md`

## Execution Notes

- The primary happy-path test is kept separate from bug repro coverage so the default suite represents baseline product health.
- Confirmed defects are captured in `tests/bug-hunt.spec.js` as opt-in exploratory tests.
- To run bug repro coverage in PowerShell:

```powershell
$env:BUG_HUNT='true'
npx playwright test tests/bug-hunt.spec.js
```

- To return to the default suite behavior in PowerShell:

```powershell
Remove-Item Env:BUG_HUNT -ErrorAction SilentlyContinue
```

## Notes

- The current automation is intentionally focused on the core workflow plus confirmed defects rather than broad UI coverage.
- During repeated exploratory runs, the `/api/testrun` endpoint can occasionally respond with `429`, so bug-hunt runs are best executed selectively rather than in rapid loops.