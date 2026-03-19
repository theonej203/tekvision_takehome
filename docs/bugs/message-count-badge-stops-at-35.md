# Message Count Badge Stops At 35

## Summary

When live chat messages continue beyond 35 total displayed messages, the count badge on the default desktop stops increasing even though additional messages continue to render in the conversation.

## Environment

- Desktop path: `/desktop/{runId}`
- Browser: Chromium via Playwright
- Verified on: 2026-03-17

## Reproduction Steps

1. Create a test run through `/api/testrun` using the standard authenticated sample payload.
2. Open the returned run on `/desktop/{runId}`.
3. Set the agent status to `Ready` if the incoming chat is not already visible.
4. Accept the incoming chat.
5. Send 40 live messages from the agent.
6. Observe the chat badge count and the rendered conversation.

## Expected Result

The message count badge should continue increasing as new chat messages appear in the conversation.

## Actual Result

The chat continues to render new messages, but the badge stops at `35`.

## Evidence

Observed from automated reproduction on `/desktop`:

```json
{
  "initialBadgeCount": 3,
  "finalBadgeCount": 35,
  "renderedAutomationMessages": 70,
  "expectedBadgeCount": 73
}
```

Interpretation:

- The desktop started with 3 transcript messages.
- 40 live agent messages were sent.
- The runtime conversation rendered many more messages than the badge reported.
- The badge remained capped at 35 instead of continuing to increase.

## Validation Notes

- This was reproduced with the exploratory Playwright spec in `tests/bug-hunt.spec.js`.
- The repro spec is opt-in so the main suite stays green.
- To rerun it in PowerShell:

```powershell
$env:BUG_HUNT='true'
npx playwright test tests/bug-hunt.spec.js
```