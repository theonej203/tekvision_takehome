# Single Message Count Uses Plural Label

## Summary

When the transcript contains exactly one message, the conversation header shows `1 messages` instead of the singular `1 message`.

## Environment

- Desktop path: `/desktop/{runId}`
- Browser: Chromium via Playwright
- Verified on: 2026-03-18

## Reproduction Steps

1. Create a test run through `/api/testrun` with a transcript containing exactly one chat message.
2. Open the returned run on `/desktop/{runId}`.
3. Set the agent status to `Ready` if required.
4. Accept the incoming chat.
5. Observe the message count label above the conversation transcript.

## Expected Result

The label should read `1 message`.

## Actual Result

The label reads `1 messages`.

## Evidence

Observed from automated reproduction on `/desktop`:

```json
{
  "transcriptSize": 1,
  "messageCountLabel": "1 messages"
}
```

## Validation Notes

- This was reproduced with the exploratory Playwright spec in `tests/bug-hunt.spec.js`.
- The repro spec is opt-in so the main suite stays green.
- To rerun it in PowerShell:

```powershell
$env:BUG_HUNT='true'
npx playwright test tests/bug-hunt.spec.js -g "singular grammar"
```