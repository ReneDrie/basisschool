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

test('A dragged treasure follows the finger across the island and stays where it is dropped', async ({ page }) => {
  await openApp(page);
  await createProfile(page, 'Noor', 2);
  await startShapesRound(page);
  await playRoundToEnd(page);
  await page.getByRole('button', { name: 'Bekijk mijn eiland' }).click();
  await page.getByRole('button', { name: 'Versieren' }).click();

  const treasure = page.getByRole('button', { name: /Sleep of verplaats met de pijltjes/ }).first();
  const island = (await page.locator('.island-art').boundingBox())!;
  const start = (await treasure.boundingBox())!;
  const from = { x: start.x + start.width / 2, y: start.y + start.height / 2 };
  // Up and down through the depth layers, so the treasure changes layer mid-drag.
  const path = [
    { x: island.x + island.width * 0.3, y: island.y + island.height * 0.55 },
    { x: island.x + island.width * 0.6, y: island.y + island.height * 0.8 },
    { x: island.x + island.width * 0.7, y: island.y + island.height * 0.6 },
  ];
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (const point of path) await page.mouse.move(point.x, point.y, { steps: 8 });
  await expect(page.locator('.island-treasure.is-dragging')).toHaveCount(1);
  await page.mouse.up();
  await expect(page.locator('.island-treasure.is-dragging')).toHaveCount(0);

  const dropped = (await treasure.boundingBox())!;
  const end = path[path.length - 1];
  expect(Math.abs(dropped.x + dropped.width / 2 - end.x)).toBeLessThan(30);
  // Moving the pointer afterwards, also over the treasure, does not drag it any more.
  await page.mouse.move(dropped.x + dropped.width / 2, dropped.y + dropped.height / 2, { steps: 4 });
  await page.mouse.move(island.x + island.width * 0.3, island.y + island.height * 0.75, { steps: 8 });
  const after = (await treasure.boundingBox())!;
  expect(Math.round(after.x)).toBe(Math.round(dropped.x));
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
