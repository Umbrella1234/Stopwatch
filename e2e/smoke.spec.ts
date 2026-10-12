import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const timerButton = (page: Page) => page.getByTestId("timer");
const lapsLabel = (page: Page) => page.getByTestId("laps");
const warmupCountdown = (page: Page) => page.getByTestId("warmup-countdown");

function trackPageErrors(page: Page) {
  const errors: Array<string> = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test.beforeEach(async ({ page }) => {
  await page.clock.install();
});

test("loads at the deployment base path and runs warmup into the first lap", async ({
  page,
}) => {
  const errors = trackPageErrors(page);

  await page.goto("/");
  await expect(timerButton(page)).toHaveText("0");
  await expect(lapsLabel(page)).toHaveText("Laps:0");

  await timerButton(page).click();
  await expect(warmupCountdown(page)).toHaveText("5");

  await page.clock.fastForward(3000);
  await expect(warmupCountdown(page)).toHaveText("2");

  await page.clock.fastForward(3000);
  await expect(warmupCountdown(page)).toHaveCount(0);
  await expect(timerButton(page)).toHaveText("1");
  await expect(lapsLabel(page)).toHaveText("Laps:0");

  expect(errors).toEqual([]);
});

test("applies new settings and switches from lap to rest at the boundary", async ({
  page,
}) => {
  const errors = trackPageErrors(page);

  await page.goto("/");

  await page.getByTestId("open-settings").click();
  const dialog = page.getByTestId("settings-dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByTestId("overall-time").fill("30");
  await dialog.getByTestId("lap-time").fill("10");
  await dialog.getByTestId("warmup-time").fill("0");
  await dialog.getByTestId("apply-settings").click();
  await expect(dialog).toBeHidden();

  await expect(timerButton(page)).toHaveText("0");
  await expect(lapsLabel(page)).toHaveText("Laps:0");

  await timerButton(page).click();
  await page.clock.fastForward(1000);
  await expect(timerButton(page)).toHaveText("1");
  const lapColor = await timerButton(page).evaluate(
    (element) => getComputedStyle(element).color,
  );

  await page.clock.fastForward(10000);
  await expect(timerButton(page)).toHaveText("11");
  await expect(lapsLabel(page)).toHaveText("Laps:1");
  const restColor = await timerButton(page).evaluate(
    (element) => getComputedStyle(element).color,
  );
  expect(restColor).not.toBe(lapColor);

  expect(errors).toEqual([]);
});

test("resets a running timer on reload", async ({ page }) => {
  const errors = trackPageErrors(page);

  await page.goto("/");
  await timerButton(page).click();
  await page.clock.fastForward(4000);
  await expect(warmupCountdown(page)).toHaveText("1");

  await page.reload();
  await expect(timerButton(page)).toHaveText("0");
  await expect(lapsLabel(page)).toHaveText("Laps:0");
  await expect(warmupCountdown(page)).toHaveCount(0);

  expect(errors).toEqual([]);
});
