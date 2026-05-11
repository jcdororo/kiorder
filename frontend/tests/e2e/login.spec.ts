import { test, expect } from "@playwright/test";

// 이 파일은 인증 없이 실행
test.use({ storageState: { cookies: [], origins: [] } });

test("로그인 성공 → 대시보드 이동", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#email").fill("owner1@test.com");
  await page.locator("#password").fill("test1234");
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL("**/owner/dashboard");
  await expect(page).toHaveURL(/owner\/dashboard/);
});

test("잘못된 비밀번호 → 에러 토스트 표시", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#email").fill("owner1@test.com");
  await page.locator("#password").fill("wrongpassword");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.locator("[data-sonner-toast]")).toBeVisible({ timeout: 5_000 });
});

test("빈 폼 제출 → 로그인 페이지 유지", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/login/);
});
