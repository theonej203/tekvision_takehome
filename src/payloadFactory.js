function buildTestRunPayload(overrides = {}) {
  return {
    interactionInformation: {
      interactionId: 'CHAT-10001',
      channel: 'Chat',
      authenticationStatus: 'Authenticated',
      customerAccountNumber: '10012',
      journeyName: 'Billing Support',
      queueName: 'Billing Tier 1',
      agentDesktopStatus: 'Connected',
      startTime: '2026-03-11T10:30:00Z',
      ...(overrides.interactionInformation || {}),
    },
    chatTranscript: overrides.chatTranscript || [
      {
        sender: 'Customer',
        timestamp: '14:31:01',
        message: 'I was charged twice this month.',
      },
      {
        sender: 'Bot',
        timestamp: '14:31:09',
        message: 'I can help with billing issues.',
      },
      {
        sender: 'System',
        timestamp: '14:31:50',
        message: 'Handoff to Billing Tier 1',
      },
    ],
  };
}

module.exports = {
  buildTestRunPayload,
};