const { request, chromium } = require('@playwright/test');

const { buildTestRunPayload } = require('../src/payloadFactory');

async function logButtons(page, label) {
  const buttonTexts = await page.getByRole('button').allInnerTexts();
  console.log(`\n[${label}] buttons:`);
  for (const text of buttonTexts) {
    console.log(`- ${text.replace(/\s+/g, ' ').trim()}`);
  }
}

async function logExactTextMatches(page, label, exactText) {
  const matches = await page
    .locator(`xpath=//*[normalize-space(text())='${exactText}']`)
    .evaluateAll((elements) =>
      elements.map((element) => ({
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        role: element.getAttribute('role'),
        tabIndex: element.getAttribute('tabindex'),
        text: (element.textContent || '').trim(),
        outerHTML: element.outerHTML.slice(0, 240),
      }))
    );

  console.log(`\n[${label}] exact text matches for "${exactText}":`);
  for (const match of matches) {
    console.log(JSON.stringify(match, null, 2));
  }
}

async function main() {
  const baseURL = process.env.BASE_URL || 'https://takehome-desktop.d.tekvisionflow.com';
  const apiContext = await request.newContext({ baseURL });
  const payload = buildTestRunPayload();
  const response = await apiContext.post('/api/testrun', { data: payload });

  if (!response.ok()) {
    throw new Error(`Failed to create test run: ${response.status()} ${response.statusText()}`);
  }

  const run = await response.json();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ baseURL });

  await page.goto(`/desktop/${run.runId}`);
  await page.waitForLoadState('networkidle');
  await logButtons(page, 'initial');
  await logExactTextMatches(page, 'initial', 'Ready');
  await logExactTextMatches(page, 'initial', 'Not Ready');
  await logExactTextMatches(page, 'initial', 'Offline');
  await logExactTextMatches(page, 'initial', 'Accept Chat');
  console.log('\n[initial] body excerpt:');
  console.log((await page.locator('body').innerText()).slice(0, 1000));

  const agentStatusSelect = page.locator('select').first();
  const readyButton = page.getByRole('button', { name: /^ready$/i }).first();
  const readyText = page.getByText(/^Ready$/).first();
  if (await agentStatusSelect.isVisible().catch(() => false)) {
    await agentStatusSelect.selectOption('Ready');
    await page.waitForTimeout(3000);
  } else if (await readyButton.isVisible().catch(() => false)) {
    await readyButton.click();
    await page.waitForTimeout(3000);
  } else if (await readyText.isVisible().catch(() => false)) {
    await readyText.click();
    await page.waitForTimeout(3000);
  }

  await logButtons(page, 'after-ready');
  console.log('\n[after-ready] body excerpt:');
  console.log((await page.locator('body').innerText()).slice(0, 1500));

  const acceptButton = page.getByRole('button', { name: /accept chat/i }).first();
  const acceptText = page.getByText(/Accept Chat/i).first();
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
    await page.waitForTimeout(3000);
    await logButtons(page, 'after-accept');
    console.log('\n[after-accept] body excerpt:');
    console.log((await page.locator('body').innerText()).slice(0, 2500));
  } else if (await acceptText.isVisible().catch(() => false)) {
    await acceptText.click();
    await page.waitForTimeout(3000);
    await logButtons(page, 'after-accept');
    console.log('\n[after-accept] body excerpt:');
    console.log((await page.locator('body').innerText()).slice(0, 2500));
  }

  await browser.close();
  await apiContext.dispose();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});