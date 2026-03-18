async function createTestRun(request, payload) {
  const response = await request.post('/api/testrun', {
    data: payload,
  });

  if (!response.ok()) {
    throw new Error(`Failed to create test run: ${response.status()} ${response.statusText()}`);
  }

  const body = await response.json();

  if (!body.runId) {
    throw new Error(`Test run response did not include runId: ${JSON.stringify(body)}`);
  }

  return body;
}

module.exports = {
  createTestRun,
};