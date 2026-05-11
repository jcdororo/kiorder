import { test as setup } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");

setup("로그인 후 쿠키 저장", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#email").fill("owner1@test.com");
  await page.locator("#password").fill("test1234");
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL("**/owner/dashboard");
  await page.context().storageState({ path: authFile });
});
