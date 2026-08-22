import { expect, test } from "@playwright/test";

test("public navigation and contact form are usable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Aklar İnşaat/i);
  await page.goto("/projeler");
  await expect(page.getByRole("heading", { name: /Projeler/i }).first()).toBeVisible();
  await page.goto("/iletisim");
  await expect(page.getByRole("heading", { name: /İletişim/i }).first()).toBeVisible();
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(horizontalOverflow).toBe(false);
});

test("admin requires owner authentication", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.getByRole("heading", { name: /Aklar İnşaat/i })).toBeVisible();
  await expect(page.getByText(/Yönetim paneli girişi/i)).toBeVisible();
});

test("draft legal pages are not public", async ({ request }) => {
  expect((await request.get("/kvkk")).status()).toBe(404);
  expect((await request.get("/gizlilik")).status()).toBe(404);
});
