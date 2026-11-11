import { expect, type Page } from '@playwright/test';

/** Opens the app silently, as AGENTS.md asks for every automated browser check. */
export async function openApp(page: Page) {
  await page.goto('/?test=1');
}

export async function createProfile(page: Page, name: string, group: 2 | 3 | 4 | 5) {
  await page.getByRole('button', { name: 'Kies je profiel' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('Je voornaam of bijnaam').fill(name);
  await dialog.getByRole('button', { name: `Groep ${group}`, exact: true }).click();
  await dialog.getByRole('button', { name: 'Dit ben ik!' }).click();
  await expect(page.getByRole('button', { name: 'Kies je profiel' })).toHaveText(name);
}

/** Starts Het Vormenland for groep 2: only plain answer buttons, so the round can be played without knowing the answers. */
export async function startShapesRound(page: Page) {
  await page.getByRole('navigation', { name: 'Hoofdnavigatie' }).getByRole('button', { name: 'Lessen' }).click();
  await page.getByRole('button', { name: 'Ontdekken' }).click();
  await page.locator('.lesson-tile', { hasText: /vorm/i }).click();
  await expect(page.locator('.question-number')).toHaveText('OPDRACHT 1');
}

/**
 * Plays the round to the end. Wrong answers are tapped on purpose: after two wrong tries the app shows the right answer,
 * which the test then taps. The question then comes back once more at the end of the round.
 */
export async function playRoundToEnd(page: Page) {
  const result = page.getByRole('heading', { name: 'Hoera, gelukt!' });
  for (let step = 0; step < 80 && !(await result.isVisible()); step++) {
    const celebration = page.locator('.celebration-next');
    if (await celebration.isVisible()) {
      await celebration.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
      continue;
    }
    const reveal = page.locator('.answer-button.reveal-answer');
    if (await reveal.count()) {
      await reveal.click({ force: true }); // The revealed answer keeps pulsing, so it never counts as stable.
      continue;
    }
    const answers = page.locator('.answer-button:not(:disabled)');
    if (!(await answers.count())) {
      await page.waitForTimeout(150);
      continue;
    }
    await answers.first().click({ force: true });
    await page.waitForTimeout(100);
  }
  await expect(result).toBeVisible();
}
