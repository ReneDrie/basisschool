import { expect, test } from '@playwright/test';
import { createProfile, openApp, playRoundToEnd, startShapesRound } from './helpers';

test('Ga spelen starts a round with one tap', async ({ page }) => {
  await openApp(page);
  await createProfile(page, 'Mila', 2);
  await page.getByRole('button', { name: 'Ga spelen' }).click();
  await expect(page.locator('.question-number')).toHaveText('OPDRACHT 1');
  await expect(page.locator('.question-heading h1')).not.toBeEmpty();
});

test('A full round shows the answer after two wrong tries, earns a star and a treasure', async ({ page }) => {
  await openApp(page);
  await createProfile(page, 'Noor', 2);
  await startShapesRound(page);
  const total = Number((await page.locator('.round-progress span').nth(1).textContent())!.split(' van ')[1]);

  // Two wrong taps on the first question reveal the right answer and add the question again at the end.
  const wrong = page.locator('.answer-button:not(:disabled)').first();
  await wrong.click();
  if (!(await page.locator('.celebration-next').isVisible())) {
    await page.locator('.answer-button:not(:disabled)').first().click();
    if (!(await page.locator('.celebration-next').isVisible())) {
      await expect(page.locator('.answer-button.reveal-answer')).toHaveCount(1);
      await expect(page.locator('.hint-feedback')).toContainText('dit is het goede antwoord');
    }
  }
  await playRoundToEnd(page);
  expect(total).toBeGreaterThan(0);

  await expect(page.locator('.star-wallet')).toHaveAccessibleName('1 ster');
  await expect(page.locator('.new-sticker')).toContainText('Nieuwe schat!');
  await page.getByRole('button', { name: 'Bekijk mijn eiland' }).click();
  await expect(page.locator('.island-home')).toBeVisible();
  await expect(page.getByLabel(/Vandaag 1 van de 3 rondjes gespeeld/)).toBeVisible();
});

test('A child can decorate the island and the spot is kept after a reload', async ({ page }) => {
  await openApp(page);
  await createProfile(page, 'Sam', 2);
  await startShapesRound(page);
  await playRoundToEnd(page);
  await page.getByRole('button', { name: 'Bekijk mijn eiland' }).click();

  await page.getByRole('button', { name: 'Versieren' }).click();
  await expect(page.getByText('Sleep je schatten!')).toBeVisible();
  const treasure = page.getByRole('button', { name: /Sleep of verplaats met de pijltjes/ }).first();
  const before = (await treasure.boundingBox())!;
  await treasure.focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await treasure.boundingBox())!.x).toBeGreaterThan(before.x + 10);
  const moved = (await treasure.boundingBox())!;
  await page.getByRole('button', { name: 'Klaar' }).click();

  await page.reload();
  await expect(page.locator('.island-home')).toBeVisible();
  await page.getByRole('button', { name: 'Versieren' }).click();
  const again = page.getByRole('button', { name: /Sleep of verplaats met de pijltjes/ }).first();
  await expect.poll(async () => Math.round((await again.boundingBox())!.x)).toBe(Math.round(moved.x));

  await page.getByRole('button', { name: 'Alles terug' }).click();
  await expect.poll(async () => Math.round((await again.boundingBox())!.x)).toBe(Math.round(before.x));
});

test('The parent area is behind a sum and shows how the goals are going', async ({ page }) => {
  await openApp(page);
  await createProfile(page, 'Lot', 2);
  await startShapesRound(page);
  await playRoundToEnd(page);
  await page.getByRole('button', { name: 'Bekijk mijn eiland' }).click();

  await page.getByRole('button', { name: 'Voor ouders' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Even voor de grote mensen' })).toBeVisible();
  await dialog.getByRole('textbox').fill('1');
  await dialog.getByRole('button', { name: 'Naar de instellingen' }).click();
  await expect(dialog.getByRole('alert')).toHaveText('Dat klopte niet. Probeer deze som.');

  const [, a, b] = (await dialog.locator('label').first().textContent())!.match(/(\d+) × (\d+)/)!;
  await dialog.getByRole('textbox').fill(String(Number(a) * Number(b)));
  await dialog.getByRole('button', { name: 'Naar de instellingen' }).click();
  await expect(dialog.getByRole('heading', { name: 'Voor de grote ontdekkers' })).toBeVisible();
  await expect(dialog.locator('.parent-insights')).toContainText('Hoe gaat het in groep 2?');
});
