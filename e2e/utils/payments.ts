import { Page, Locator } from '@playwright/test';

export function findTransactionRow(page: Page, id: number): Locator {
  return page.getByRole('row', { name: new RegExp(`#${id}(?!\\d)`) });
}

function summaryCard(page: Page, label: string): Locator {
  return page.locator('.card').filter({ has: page.locator('p.text-muted', { hasText: label }) });
}

export interface PaymentsSummary {
  totalRevenue: number;
  refundedCount: number;
}

export async function readSummary(page: Page): Promise<PaymentsSummary> {
  const totalText = await summaryCard(page, 'Total Revenue').locator('h4').innerText();
  const refundedText = await summaryCard(page, 'Refunded').locator('h4').innerText();
  const totalMatch = totalText.match(/([\d.]+)/);
  return {
    totalRevenue: totalMatch ? Number(totalMatch[1]) : 0,
    refundedCount: Number(refundedText.trim()),
  };
}
