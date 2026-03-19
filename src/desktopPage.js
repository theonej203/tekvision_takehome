const { expect } = require('@playwright/test');

class DesktopPage {
  constructor(page) {
    this.page = page;
    this.agentStatus = page.getByText(/connected|available|ready|engaged|not ready|offline/i).first();
    this.agentStatusSelect = page.locator('select').first();
    this.readyButton = page.getByRole('button', { name: /^ready$/i }).first();
    this.chatInviteButton = page.getByRole('button', { name: /accept chat|accept|join|answer/i }).first();
    this.readyTextControl = page.getByText(/^Ready$/).first();
    this.chatInviteTextControl = page.getByText(/Accept Chat/i).first();
    this.chatPanel = page.locator('[data-testid="chat-panel"], .chat-panel, [aria-label*="chat" i]').first();
    this.messageCountText = page.getByText(/^\d+ messages$/).first();
    this.messageInput = page.locator('textarea, input[placeholder*="message" i], [contenteditable="true"]').first();
    this.sendButton = page.getByRole('button', { name: /send/i }).first();
  }

  async open(runId, desktopPath = '/desktop') {
    await this.page.goto(`${desktopPath}/${runId}`);
  }

  async waitForDesktopShell() {
    await expect(this.page).toHaveURL(/\/desktop(v2)?\//);
    await expect(this.page.locator('body')).toContainText(/chat|desktop|interaction/i);
  }

  async ensureAgentReady() {
    const inviteVisible =
      (await this.chatInviteButton.isVisible().catch(() => false)) ||
      (await this.chatInviteTextControl.isVisible().catch(() => false));

    if (inviteVisible) {
      return;
    }

    if (await this.agentStatusSelect.isVisible().catch(() => false)) {
      await this.agentStatusSelect.selectOption('Ready');
    } else if (await this.readyButton.isVisible().catch(() => false)) {
      await this.readyButton.click();
    } else {
      await this.readyTextControl.click();
    }

    await expect
      .poll(async () => {
        const roleVisible = await this.chatInviteButton.isVisible().catch(() => false);
        const textVisible = await this.chatInviteTextControl.isVisible().catch(() => false);
        return roleVisible || textVisible;
      }, {
        timeout: 20_000,
      })
      .toBeTruthy();
  }

  async setAgentStatus(status) {
    await expect(this.agentStatusSelect).toBeVisible();
    await this.agentStatusSelect.selectOption(status);
  }

  async acceptChatInvite() {
    const roleVisible = await this.chatInviteButton.isVisible().catch(() => false);

    if (roleVisible) {
      await this.chatInviteButton.click();
    } else {
      await this.chatInviteTextControl.click();
    }

    await expect(this.page.locator('body')).toContainText(/interaction information|customer profile|live conversation/i, {
      timeout: 20_000,
    });
  }

  async waitForInteractionData(payload) {
    const { interactionInformation } = payload;

    await expect(this.page.locator('body')).toContainText(interactionInformation.interactionId, {
      timeout: 20_000,
    });
    await expect(this.page.locator('body')).toContainText(interactionInformation.customerAccountNumber, {
      timeout: 20_000,
    });
  }

  async acceptChatInviteIfPresent() {
    const isVisible = await this.chatInviteButton.isVisible().catch(() => false);
    if (isVisible) {
      await this.acceptChatInvite();
    }
  }

  async isChatInviteVisible() {
    const roleVisible = await this.chatInviteButton.isVisible().catch(() => false);
    const textVisible = await this.chatInviteTextControl.isVisible().catch(() => false);
    return roleVisible || textVisible;
  }

  async expectInteractionInfo(payload) {
    const { interactionInformation } = payload;
    await expect(this.page.locator('body')).toContainText(interactionInformation.interactionId);
    await expect(this.page.locator('body')).toContainText(interactionInformation.channel);
    await expect(this.page.locator('body')).toContainText(interactionInformation.queueName);
    await expect(this.page.locator('body')).toContainText(interactionInformation.journeyName);
  }

  async expectTranscript(payload) {
    for (const entry of payload.chatTranscript) {
      await expect(this.page.locator('body')).toContainText(entry.message);
    }
  }

  async expectAuthenticatedProfile(payload) {
    const { authenticationStatus, customerAccountNumber } = payload.interactionInformation;
    if (/authenticated/i.test(authenticationStatus)) {
      await expect(this.page.locator('body')).toContainText(customerAccountNumber);
    }
  }

  async sendLiveChatMessage(message) {
    await expect(this.messageInput).toBeVisible();
    await this.messageInput.fill(message);
    await this.sendButton.click();
  }

  async expectLiveChatEcho(message) {
    await expect(this.page.locator('body')).toContainText(message);
  }

  async getMessageCountBadge() {
    const text = await this.messageCountText.textContent();
    if (!text) {
      throw new Error('Message count badge was not found.');
    }

    const match = text.match(/(\d+)/);
    if (!match) {
      throw new Error(`Could not parse message count badge text: ${text}`);
    }

    return Number(match[1]);
  }

  async getMessageCountLabel() {
    const text = await this.messageCountText.textContent();
    if (!text) {
      throw new Error('Message count badge was not found.');
    }

    return text.trim();
  }

  async getRenderedMessageCount(searchText = 'Automation burst') {
    const text = await this.page.locator('body').innerText();
    return (text.match(new RegExp(searchText, 'g')) || []).length;
  }
}

module.exports = {
  DesktopPage,
};