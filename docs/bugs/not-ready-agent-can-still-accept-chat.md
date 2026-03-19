# Not Ready Agent Can Still Accept Chat

## Summary

When the agent status is set to `Not Ready`, the desktop still surfaces an incoming chat invite. The agent can accept that chat and send live messages without transitioning back to `Ready`.

## Environment

- Desktop path: `/desktop/{runId}`
- Browser: Chromium via Playwright
- Verified on: 2026-03-18

## Reproduction Steps

1. Create a test run through `/api/testrun` using the standard authenticated sample payload.
2. Open the returned run on `/desktop/{runId}`.
3. Set the agent status to `Not Ready`.
4. Wait for the desktop to evaluate routing eligibility.
5. Observe whether an incoming chat invite appears.
6. If present, accept the chat and send a live message.

## Expected Result

An agent marked `Not Ready` should not receive a chat invite and should not be able to accept new work until status changes back to `Ready`.

## Actual Result

An incoming chat invite appears while the agent is `Not Ready`. The agent can accept the chat and send messages immediately.

## Evidence

Observed from automated reproduction on `/desktop`:

```json
{
  "selectedStatus": "Not Ready",
  "inviteVisible": true,
  "accepted": true,
  "messageEchoed": true
}
```

## Impact

- Work can be routed to agents who explicitly marked themselves unavailable.
- The desktop allows active participation in a conversation without returning to a ready state.
- This breaks core availability and routing semantics, not just presentation.

## Validation Notes

- This was reproduced with the exploratory Playwright spec in `tests/bug-hunt.spec.js`.
- The repro spec is opt-in so the main suite stays green.
- To rerun it in PowerShell:

```powershell
$env:BUG_HUNT='true'
npx playwright test tests/bug-hunt.spec.js -g "not-ready agent"
```