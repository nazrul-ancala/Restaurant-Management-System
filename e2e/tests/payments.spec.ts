import { test, expect } from '@playwright/test';
import { login } from '../utils/login';
import { createMenuItem } from '../utils/menu';
import { createTakeawayOrder, advanceOrder, completeOrder, findHistoryCard, openHistory } from '../utils/orders';
import { findTransactionRow, readSummary } from '../utils/payments';

test.describe('Payments', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('a completed order appears correctly in the transactions table', async ({ page }) => {
    const item = await createMenuItem(page, { price: 18 });
    const order = await createTakeawayOrder(page, [{ name: item.name, price: item.price, quantity: 2 }]);
    await advanceOrder(page, order.id, 'Start Preparing');
    await advanceOrder(page, order.id, 'Mark Ready');
    await advanceOrder(page, order.id, 'Mark Served');
    await completeOrder(page, order.id, 'Cash');

    await page.goto('/payments');
    const row = findTransactionRow(page, order.id);

    await expect(row).toBeVisible();
    await expect(row).toContainText(`#${order.id}`);
    await expect(row).toContainText('Takeaway');
    await expect(row).toContainText('Cash');
    await expect(row).toContainText(`RM ${order.total.toFixed(2)}`);
    await expect(row.locator('span.badge')).toHaveText('Completed');
    await expect(row.locator('span.badge')).toHaveClass(/bg-success-subtle/);
    await expect(row.getByTitle('Refund')).toBeVisible();
  });

  test('refunding an order flips its status, updates summary, and reflects in Orders History', async ({ page }) => {
    const item = await createMenuItem(page, { price: 25 });
    const order = await createTakeawayOrder(page, [{ name: item.name, price: item.price }]);
    await advanceOrder(page, order.id, 'Start Preparing');
    await advanceOrder(page, order.id, 'Mark Ready');
    await advanceOrder(page, order.id, 'Mark Served');
    await completeOrder(page, order.id, 'Cash');

    await page.goto('/payments');
    const row = findTransactionRow(page, order.id);
    await expect(row.getByTitle('Refund')).toBeVisible();

    const before = await readSummary(page);

    await row.getByTitle('Refund').click();
    const modal = page.locator('.modal').filter({ hasText: 'Refund Order' });
    await expect(modal).toBeVisible();
    await expect(modal.locator('.modal-header')).toContainText(`Refund Order #${order.id}`);

    await modal.locator('#reason').fill('E2E test refund - customer complaint');
    await modal.getByRole('button', { name: 'Confirm Refund' }).click();
    await expect(modal).toBeHidden();

    await expect(row.locator('span.badge')).toHaveText('Refunded');
    await expect(row.locator('span.badge')).toHaveClass(/bg-dark-subtle/);
    await expect(row.getByTitle('Refund')).toHaveCount(0);

    const after = await readSummary(page);
    expect(after.refundedCount).toBe(before.refundedCount + 1);
    expect(Number(after.totalRevenue.toFixed(2))).toBe(Number((before.totalRevenue - order.total).toFixed(2)));

    await page.goto('/orders');
    await openHistory(page);
    const historyRow = findHistoryCard(page)
      .locator('div.border.rounded.bg-body')
      .filter({ hasText: new RegExp(`#${order.id}(?!\\d)`) });
    await expect(historyRow).toContainText('Refunded');
  });

  test('shows a validation error when refund reason is left blank', async ({ page }) => {
    const item = await createMenuItem(page, { price: 10 });
    const order = await createTakeawayOrder(page, [{ name: item.name, price: item.price }]);
    await advanceOrder(page, order.id, 'Start Preparing');
    await advanceOrder(page, order.id, 'Mark Ready');
    await advanceOrder(page, order.id, 'Mark Served');
    await completeOrder(page, order.id, 'Cash');

    await page.goto('/payments');
    const row = findTransactionRow(page, order.id);
    await row.getByTitle('Refund').click();

    const modal = page.locator('.modal').filter({ hasText: 'Refund Order' });
    await expect(modal).toBeVisible();

    await modal.getByRole('button', { name: 'Confirm Refund' }).click();
    await expect(modal.getByText('A reason is required')).toBeVisible();
    await expect(modal).toBeVisible();

    await modal.locator('.modal-header button.btn-close').click();
    await expect(modal).toBeHidden();

    await expect(row.locator('span.badge')).toHaveText('Completed');
    await expect(row.getByTitle('Refund')).toBeVisible();
  });
});
