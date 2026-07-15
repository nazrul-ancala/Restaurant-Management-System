import { Page, Locator } from '@playwright/test';

export function findKitchenColumn(
  page: Page,
  label: 'New' | 'Cooking' | 'Ready for Pickup'
): Locator {
  return page.locator('.card').filter({ has: page.locator('.card-header', { hasText: label }) });
}
