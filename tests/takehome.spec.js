const { test, expect } = require('@playwright/test');

const { createTestRun } = require('../src/apiClient');
const { DesktopPage } = require('../src/desktopPage');
const { buildTestRunPayload } = require('../src/payloadFactory');

test.describe('TekVision desktop take-home', () => {
  test('creates a run and validates the desktop flow', async ({ page, request }) => {
    const payload = buildTestRunPayload();
    const run = await createTestRun(request, payload);
    const desktopPage = new DesktopPage(page);

    test.info().annotations.push({
      type: 'runId',
      description: run.runId,
    });

    await desktopPage.open(run.runId);
    await desktopPage.waitForDesktopShell();
    await desktopPage.ensureAgentReady();
    await desktopPage.acceptChatInvite();
    await desktopPage.waitForInteractionData(payload);

    await desktopPage.expectInteractionInfo(payload);
    await desktopPage.expectAuthenticatedProfile(payload);
    await desktopPage.expectTranscript(payload);

    const liveMessage = `Automation ping ${Date.now()}`;
    await desktopPage.sendLiveChatMessage(liveMessage);
    await desktopPage.expectLiveChatEcho(liveMessage);

    await expect(page.locator('body')).toContainText(/customer|bot|system/i);
  });
});