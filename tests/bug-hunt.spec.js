const { test, expect } = require('@playwright/test');

const { createTestRun } = require('../src/apiClient');
const { DesktopPage } = require('../src/desktopPage');
const { buildTestRunPayload } = require('../src/payloadFactory');

test.describe('Bug hunt', () => {
  test('message badge keeps increasing as live chat messages are sent', async ({ page, request }) => {
    test.skip(process.env.BUG_HUNT !== 'true', 'Exploratory bug reproduction. Run with BUG_HUNT=true when validating known defects.');

    const payload = buildTestRunPayload();
    const run = await createTestRun(request, payload);
    const desktopPage = new DesktopPage(page);
    const desktopPath = process.env.DESKTOP_PATH || '/desktop';

    await desktopPage.open(run.runId, desktopPath);
    await desktopPage.waitForDesktopShell();
    await desktopPage.ensureAgentReady();
    await desktopPage.acceptChatInvite();
    await desktopPage.waitForInteractionData(payload);

    const initialBadgeCount = await desktopPage.getMessageCountBadge();
    const liveMessagesToSend = 40;

    for (let index = 1; index <= liveMessagesToSend; index += 1) {
      const message = `Automation burst ${index}`;
      await desktopPage.sendLiveChatMessage(message);
      await desktopPage.expectLiveChatEcho(message);
    }

    const finalBadgeCount = await desktopPage.getMessageCountBadge();
    const renderedAutomationMessages = await desktopPage.getRenderedMessageCount();

    console.log(JSON.stringify({
      runId: run.runId,
      initialBadgeCount,
      finalBadgeCount,
      renderedAutomationMessages,
      expectedBadgeCount: initialBadgeCount + renderedAutomationMessages,
    }, null, 2));

    await expect(renderedAutomationMessages).toBeGreaterThanOrEqual(liveMessagesToSend);
    await expect(finalBadgeCount).toBe(initialBadgeCount + renderedAutomationMessages);
  });

  test('message count label uses singular grammar for one-message transcript', async ({ page, request }) => {
    test.skip(process.env.BUG_HUNT !== 'true', 'Exploratory bug reproduction. Run with BUG_HUNT=true when validating known defects.');

    const payload = buildTestRunPayload({
      chatTranscript: [
        {
          sender: 'Customer',
          timestamp: '14:31:00',
          message: 'Only one message',
        },
      ],
    });
    const run = await createTestRun(request, payload);
    const desktopPage = new DesktopPage(page);
    const desktopPath = process.env.DESKTOP_PATH || '/desktop';

    await desktopPage.open(run.runId, desktopPath);
    await desktopPage.waitForDesktopShell();
    await desktopPage.ensureAgentReady();
    await desktopPage.acceptChatInvite();
    await desktopPage.waitForInteractionData(payload);

    const messageCountLabel = await desktopPage.getMessageCountLabel();

    console.log(JSON.stringify({
      runId: run.runId,
      transcriptSize: payload.chatTranscript.length,
      messageCountLabel,
    }, null, 2));

    await expect(messageCountLabel).toBe('1 message');
  });

  test('not-ready agent still receives and can accept a chat', async ({ page, request }) => {
    test.skip(process.env.BUG_HUNT !== 'true', 'Exploratory bug reproduction. Run with BUG_HUNT=true when validating known defects.');

    const payload = buildTestRunPayload();
    const run = await createTestRun(request, payload);
    const desktopPage = new DesktopPage(page);
    const desktopPath = process.env.DESKTOP_PATH || '/desktop';
    const liveMessage = 'Not Ready routing probe';

    await desktopPage.open(run.runId, desktopPath);
    await desktopPage.waitForDesktopShell();
    await desktopPage.setAgentStatus('Not Ready');
    await page.waitForTimeout(1500);

    const inviteVisible = await desktopPage.isChatInviteVisible();
    let accepted = false;
    let messageEchoed = false;

    if (inviteVisible) {
      await desktopPage.acceptChatInvite();
      accepted = true;
      await desktopPage.sendLiveChatMessage(liveMessage);
      await desktopPage.expectLiveChatEcho(liveMessage);
      messageEchoed = true;
    }

    console.log(JSON.stringify({
      runId: run.runId,
      selectedStatus: 'Not Ready',
      inviteVisible,
      accepted,
      messageEchoed,
    }, null, 2));

    await expect(inviteVisible).toBeFalsy();
  });
});