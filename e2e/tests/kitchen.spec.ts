import { test, expect } from '@playwright/test';
import { login } from '../utils/login';
import { createMenuItem } from '../utils/menu';
import { createTakeawayOrder, findOrderCardById, advanceOrder, cleanupOrder } from '../utils/orders';
import { findKitchenColumn } from '../utils/kitchen';

test.describe('Kitchen', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('ticket created on Orders advances New -> Cooking -> Ready for Pickup on the Kitchen board', async ({ page }) => {
    const item = await createMenuItem(page);
    const order = await createTakeawayOrder(page, [{ name: item.name, price: item.price }]);
    const id = order.id;

    await page.goto('/kitchen');
    const card = findOrderCardById(page, id);

    await expect(card).toBeVisible();
    await expect(
      findKitchenColumn(page, 'New').locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) })
    ).toHaveCount(1);
    await expect(card.locator('button.btn-primary')).toHaveText('Start Cooking');
    await expect(card.locator('button[title^="Undo"]')).toHaveCount(0);
    await expect(card.locator('button[title="Cancel order"]')).toHaveCount(0);

    await advanceOrder(page, id, 'Start Cooking');
    await expect(
      findKitchenColumn(page, 'Cooking').locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) })
    ).toHaveCount(1);
    await expect(
      findKitchenColumn(page, 'New').locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) })
    ).toHaveCount(0);
    await expect(card.locator('button.btn-primary')).toHaveText('Mark Ready');
    await expect(card.locator('button[title="Undo (back to Pending)"]')).toBeVisible();
    await expect(card.locator('button[title="Cancel order"]')).toHaveCount(0);

    await advanceOrder(page, id, 'Mark Ready');
    await expect(
      findKitchenColumn(page, 'Ready for Pickup').locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) })
    ).toHaveCount(1);
    await expect(
      findKitchenColumn(page, 'Cooking').locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) })
    ).toHaveCount(0);
    await expect(card.locator('button.btn-primary')).toHaveCount(0);
    await expect(card.locator('.badge.bg-primary-subtle.text-primary')).toHaveText('Ready for Pickup');
    await expect(card.locator('button[title="Undo (back to Preparing)"]')).toBeVisible();
    await expect(card.locator('button[title="Cancel order"]')).toHaveCount(0);

    // Note: the menu item is never deleted here — it's now permanently referenced
    // by this order's OrderItem row (even cancelled), so a delete would 409
    // ("Menu item is referenced by existing orders and cannot be deleted"),
    // matching the same constraint already observed in orders.spec.ts.
    await page.goto('/orders');
    await cleanupOrder(page, id);
  });

  test('focus mode toggles the kitchen-focus-mode class on the document body', async ({ page }) => {
    await page.goto('/kitchen');
    const body = page.locator('body');

    await expect(body).not.toHaveClass(/kitchen-focus-mode/);
    const enterBtn = page.getByTitle('Enter focus mode');
    await expect(enterBtn).toBeVisible();

    await enterBtn.click();
    await expect(body).toHaveClass(/kitchen-focus-mode/);
    await expect(page.getByTitle('Exit focus mode')).toBeVisible();

    await page.getByTitle('Exit focus mode').click();
    await expect(body).not.toHaveClass(/kitchen-focus-mode/);
    await expect(page.getByTitle('Enter focus mode')).toBeVisible();
  });
});
