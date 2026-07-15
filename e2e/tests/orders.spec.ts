import { test, expect } from '@playwright/test';
import { login } from '../utils/login';
import { createMenuItem, deleteMenuItem } from '../utils/menu';
import { createTable, findTableCard, deleteTable } from '../utils/tables';
import {
  createTakeawayOrder,
  createDineInOrder,
  findOrderCardById,
  findStatusColumn,
  findHistoryCard,
  openHistory,
  advanceOrder,
  completeOrder,
  cancelOrder,
  cleanupOrder,
} from '../utils/orders';

test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('admin can create a Takeaway order and see it on the board with correct items/total', async ({ page }) => {
    const item = await createMenuItem(page, { price: 12.5 });

    const order = await createTakeawayOrder(page, [{ name: item.name, price: item.price, quantity: 2 }]);
    const card = findOrderCardById(page, order.id);

    await expect(card).toBeVisible();
    await expect(card).toContainText('Takeaway');
    await expect(card).toContainText(`2× ${item.name}`);
    await expect(card).toContainText(`RM ${order.total.toFixed(2)}`);
    await expect(card.locator('button.btn-primary')).toHaveText('Start Preparing');
    await expect(card.locator('button[title^="Undo"]')).toHaveCount(0);
    await expect(card.locator('button[title="Cancel order"]')).toBeVisible();
    await expect(
      findStatusColumn(page, 'Pending')
        .locator('div.border.rounded.bg-body')
        .filter({ hasText: new RegExp(`#${order.id}(?!\\d)`) })
    ).toHaveCount(1);

    await cleanupOrder(page, order.id);
  });

  test('admin can create a Dine-In order linked to a table, see it Occupied, then cancel it', async ({ page }) => {
    const table = await createTable(page);
    const item = await createMenuItem(page);

    const order = await createDineInOrder(page, table.name, [{ name: item.name, price: item.price }]);
    const card = findOrderCardById(page, order.id);

    await expect(card).toBeVisible();
    await expect(card).toContainText('Dine-In');
    await expect(card.locator('div.text-muted.fs-13').first()).toHaveText(table.name);
    await expect(card).toContainText(`1× ${item.name}`);

    await page.goto('/tables');
    const tableCard = findTableCard(page, table.name);
    await expect(tableCard).toContainText('Occupied');
    await expect(tableCard.getByRole('button', { name: 'View Order' })).toBeVisible();

    await page.goto('/orders');
    await cancelOrder(page, order.id);

    await openHistory(page);
    const historyRow = findHistoryCard(page)
      .locator('div.border.rounded.bg-body')
      .filter({ hasText: new RegExp(`#${order.id}(?!\\d)`) });
    await expect(historyRow).toContainText('Cancelled');

    await page.goto('/tables');
    await expect(findTableCard(page, table.name)).not.toContainText('Occupied');
  });

  test('order status advances Pending -> Preparing -> Ready -> Served -> Completed', async ({ page }) => {
    const item = await createMenuItem(page);
    const order = await createTakeawayOrder(page, [{ name: item.name, price: item.price }]);
    const id = order.id;

    await expect(
      findStatusColumn(page, 'Pending').locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) })
    ).toHaveCount(1);

    await advanceOrder(page, id, 'Start Preparing');
    await expect(
      findStatusColumn(page, 'Preparing').locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) })
    ).toHaveCount(1);
    await expect(
      findStatusColumn(page, 'Pending').locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) })
    ).toHaveCount(0);
    await expect(findOrderCardById(page, id).locator('button[title="Undo (back to Pending)"]')).toBeVisible();

    await advanceOrder(page, id, 'Mark Ready');
    await expect(
      findStatusColumn(page, 'Ready').locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) })
    ).toHaveCount(1);

    await advanceOrder(page, id, 'Mark Served');
    await expect(
      findStatusColumn(page, 'Served').locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) })
    ).toHaveCount(1);
    await expect(findOrderCardById(page, id).locator('button.btn-primary')).toHaveText('Complete');

    await completeOrder(page, id, 'Cash');

    for (const status of ['Pending', 'Preparing', 'Ready', 'Served'] as const) {
      await expect(
        findStatusColumn(page, status).locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) })
      ).toHaveCount(0);
    }
    await openHistory(page);
    const historyRow = findHistoryCard(page)
      .locator('div.border.rounded.bg-body')
      .filter({ hasText: new RegExp(`#${id}(?!\\d)`) });
    await expect(historyRow).toContainText('Completed');
    await expect(historyRow).toContainText('1 item(s)');
  });

  test('shows validation errors on the New Order modal without ever creating an order', async ({ page }) => {
    const table = await createTable(page);
    const item = await createMenuItem(page);

    await page.goto('/orders');
    await page.getByRole('button', { name: 'New Order' }).click();
    const modalForm = page.locator('form').filter({ has: page.locator('#orderType') });

    // 1) everything blank -> "Order type is required"; the item select has no
    // <FormFeedback> in the source (only an `invalid` CSS class is toggled, no
    // error text is ever rendered for it), so assert the class, not text.
    const itemRow = modalForm.locator('.row').filter({ has: page.getByRole('button', { name: 'Remove' }) }).first();
    await modalForm.getByRole('button', { name: 'Create Order' }).click();
    await expect(modalForm.getByText('Order type is required')).toBeVisible();
    await expect(itemRow.locator('select')).toHaveClass(/is-invalid/);

    // 2) fix the item first (orderType still blank, so this can never create a real order)
    await itemRow.locator('select').selectOption({ label: `${item.name} — RM ${item.price.toFixed(2)}` });
    await modalForm.getByRole('button', { name: 'Create Order' }).click();
    await expect(itemRow.locator('select')).not.toHaveClass(/is-invalid/);
    await expect(modalForm.getByText('Order type is required')).toBeVisible();

    // 3) fix orderType -> Dine-In reveals #tableId and requires it. "Select a
    // table" is also the placeholder <option> text, so scope to the
    // .invalid-feedback element to avoid a strict-mode ambiguity.
    await modalForm.locator('#orderType').selectOption('Dine-In');
    await modalForm.getByRole('button', { name: 'Create Order' }).click();
    await expect(modalForm.getByText('Order type is required')).toHaveCount(0);
    const tableError = modalForm.locator('.invalid-feedback', { hasText: 'Select a table' });
    await expect(tableError).toBeVisible();

    // 4) fix table -> error clears via live validation; deliberately do NOT submit again,
    // since all fields would now be valid and would create a real Dine-In order.
    await modalForm.locator('#tableId').selectOption({ label: table.name });
    await expect(tableError).toHaveCount(0);

    await expect(modalForm).toBeVisible();
    await page.locator('.modal-header button.btn-close').click();
    await expect(modalForm).toBeHidden();

    await page.goto('/tables');
    await deleteTable(page, table.name);
    await page.goto('/menu');
    await deleteMenuItem(page, item.name);
  });
});
