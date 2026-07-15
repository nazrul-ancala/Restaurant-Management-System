import { Page, Locator, expect } from '@playwright/test';
import { escapeRegExp } from './text';

export interface OrderLineInput {
  name: string;
  price: number;
  quantity?: number;
}

export interface CreatedOrder {
  id: number;
  orderType: 'Dine-In' | 'Takeaway';
  tableName?: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
}

export function findOrderCard(page: Page, uniqueText: string): Locator {
  return page.locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(escapeRegExp(uniqueText)) });
}

export function findOrderCardById(page: Page, id: number): Locator {
  return page.locator('div.border.rounded.bg-body').filter({ hasText: new RegExp(`#${id}(?!\\d)`) });
}

export function findStatusColumn(
  page: Page,
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served'
): Locator {
  return page.locator('.card').filter({ has: page.locator('.card-header', { hasText: status }) });
}

export function findHistoryCard(page: Page): Locator {
  return page.locator('.card').filter({ has: page.locator('.card-header', { hasText: 'History (' }) });
}

export async function openHistory(page: Page): Promise<void> {
  const history = findHistoryCard(page);
  const body = history.locator('.card-body');
  if (!(await body.isVisible().catch(() => false))) {
    await history.locator('.card-header').click();
  }
  await expect(body).toBeVisible();
}

async function fillAndSubmitNewOrder(
  page: Page,
  opts: { orderType: 'Dine-In' | 'Takeaway'; tableName?: string; items: OrderLineInput[] }
): Promise<{ items: { name: string; price: number; quantity: number }[]; total: number }> {
  await page.goto('/orders');
  await page.getByRole('button', { name: 'New Order' }).click();

  const modalForm = page.locator('form').filter({ has: page.locator('#orderType') });
  await modalForm.locator('#orderType').selectOption(opts.orderType);

  if (opts.orderType === 'Dine-In') {
    await modalForm.locator('#tableId').selectOption({ label: opts.tableName! });
  }

  const itemRows = modalForm.locator('.row').filter({ has: page.getByRole('button', { name: 'Remove' }) });

  let total = 0;
  const items = opts.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity ?? 1 }));

  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      await modalForm.getByRole('button', { name: 'Add Item' }).click();
    }
    const row = itemRows.nth(i);
    const label = `${items[i].name} — RM ${items[i].price.toFixed(2)}`;
    await row.locator('select').selectOption({ label });
    if (items[i].quantity !== 1) {
      await row.locator('input[type="number"]').fill(String(items[i].quantity));
    }
    total += items[i].price * items[i].quantity;
  }

  await modalForm.getByRole('button', { name: 'Create Order' }).click();
  await expect(modalForm).toBeHidden();

  return { items, total };
}

async function extractFreshOrderId(page: Page, uniqueItemName: string): Promise<number> {
  const card = findOrderCard(page, uniqueItemName);
  await expect(card).toBeVisible();
  const idSpan = card.locator('span.fw-semibold').filter({ hasText: /^#\d+/ });
  const text = await idSpan.textContent();
  const id = Number((text ?? '').replace('#', '').trim());
  if (!Number.isFinite(id)) throw new Error(`Failed to extract order id from card text "${text}"`);
  return id;
}

export async function createTakeawayOrder(page: Page, items: OrderLineInput[]): Promise<CreatedOrder> {
  const { items: resolved, total } = await fillAndSubmitNewOrder(page, { orderType: 'Takeaway', items });
  const id = await extractFreshOrderId(page, resolved[0].name);
  return { id, orderType: 'Takeaway', items: resolved, total };
}

export async function createDineInOrder(
  page: Page,
  tableName: string,
  items: OrderLineInput[]
): Promise<CreatedOrder> {
  const { items: resolved, total } = await fillAndSubmitNewOrder(page, { orderType: 'Dine-In', tableName, items });
  const id = await extractFreshOrderId(page, resolved[0].name);
  return { id, orderType: 'Dine-In', tableName, items: resolved, total };
}

export async function advanceOrder(page: Page, id: number, expectedLabel?: string): Promise<void> {
  const btn = findOrderCardById(page, id).locator('button.btn-primary');
  if (expectedLabel) {
    await expect(btn).toHaveText(expectedLabel);
  }
  await btn.click();
}

export async function completeOrder(page: Page, id: number, paymentMethod = 'Cash'): Promise<void> {
  await findOrderCardById(page, id).locator('button.btn-primary').click();
  const modal = page.locator('.modal').filter({ hasText: 'Complete Order' });
  await expect(modal).toBeVisible();
  await modal.locator('#paymentMethod').selectOption({ label: paymentMethod });
  await modal.getByRole('button', { name: 'Confirm' }).click();
  await expect(modal).toBeHidden();
}

export async function cancelOrder(page: Page, id: number): Promise<void> {
  const card = findOrderCardById(page, id);
  await card.locator('button[title="Cancel order"]').click();
  await expect(card.locator('button[title="Cancel order"]')).toHaveCount(0);
}

// Safe to call even if the order is already terminal (Completed/Cancelled/Refunded) —
// in that case there is no Cancel button and this is a no-op. There is no delete-order
// endpoint, so "cleanup" for Orders always means "cancel if still active", never "delete".
export async function cleanupOrder(page: Page, id: number): Promise<void> {
  const card = findOrderCardById(page, id);
  const cancelBtn = card.locator('button[title="Cancel order"]');
  if ((await cancelBtn.count()) > 0) {
    await cancelBtn.click();
    await expect(cancelBtn).toHaveCount(0);
  }
}
