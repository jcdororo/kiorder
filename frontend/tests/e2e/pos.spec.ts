import { test, expect } from "@playwright/test";

test("POS 페이지 로드", async ({ page }) => {
  await page.goto("/pos");
  await expect(page.getByText("포스 결제")).toBeVisible();
  await expect(page.getByText("테이블 선택")).toBeVisible();
  await expect(page.getByText("주문 내역")).toBeVisible();
});

test("테이블 그리드: API 응답 후 테이블 버튼 렌더링", async ({ page }) => {
  await page.goto("/pos");
  // GET /tables 응답 후 버튼이 나타날 때까지 대기
  const tableBtn = page.locator(".grid-cols-5 button").first();
  await expect(tableBtn).toBeVisible({ timeout: 10_000 });
  // 버튼이 숫자 텍스트를 가지는지 확인
  const text = await tableBtn.textContent();
  expect(Number(text?.trim())).toBeGreaterThan(0);
});

test("테이블 클릭 → 주문 패널에 테이블 번호 표시", async ({ page }) => {
  await page.goto("/pos");
  const tableBtn = page.locator(".grid-cols-5 button").first();
  await tableBtn.waitFor({ timeout: 10_000 });
  const tableNumber = (await tableBtn.textContent())?.trim();
  await tableBtn.click();
  await expect(page.getByText(`테이블 ${tableNumber}`)).toBeVisible();
});

test("주문 없는 테이블 → '결제할 주문이 없습니다' 표시", async ({ page }) => {
  await page.goto("/pos");
  // 주문 없는 테이블(회색 버튼)을 찾아 클릭
  const emptyBtn = page.locator(".grid-cols-5 button.bg-\\[\\#374151\\]").first();
  if (await emptyBtn.count() > 0) {
    await emptyBtn.click();
    await expect(page.getByText("결제할 주문이 없습니다")).toBeVisible({ timeout: 5_000 });
  } else {
    test.skip();
  }
});

test("결제 버튼 클릭 → 결제 완료 화면", async ({ page }) => {
  await page.goto("/pos");
  // 주문 있는 테이블(orange tint 버튼) 찾기
  const activeBtn = page.locator(".grid-cols-5 button.bg-orange-500\\/10").first();
  if (await activeBtn.count() === 0) {
    test.skip();
    return;
  }
  await activeBtn.click();
  // 주문 목록이 나타날 때까지 대기
  await expect(page.getByText("총 결제금액")).toBeVisible({ timeout: 5_000 });
  await page.getByRole("button", { name: "카드 결제" }).click();
  await expect(page.getByText("결제 완료!")).toBeVisible({ timeout: 10_000 });
});
