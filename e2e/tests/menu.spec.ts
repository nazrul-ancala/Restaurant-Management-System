import { test, expect } from '@playwright/test';
import { login } from '../utils/login';
import { createMenuItem, deleteMenuItem, findMenuRow } from '../utils/menu';

test.describe('Menu', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('admin can add a new menu item and see it in the table', async ({ page }) => {
    const item = await createMenuItem(page, { price: 15.9 });

    await page.getByPlaceholder('Search menu items...').fill(item.name);
    const row = findMenuRow(page, item.name);
    await expect(row).toBeVisible();
    await expect(row).toContainText(item.category);
    await expect(row).toContainText('RM 15.90');
    await expect(row).toContainText('Available');

    await deleteMenuItem(page, item.name);
  });

  test('admin can edit a menu item', async ({ page }) => {
    const item = await createMenuItem(page, { price: 10 });

    await page.getByPlaceholder('Search menu items...').fill(item.name);
    const row = findMenuRow(page, item.name);
    await row.getByTitle('Edit').click();

    const editForm = page.locator('form').filter({ has: page.locator('#name') });
    await expect(editForm.getByRole('button', { name: 'Save Changes' })).toBeVisible();

    const newName = `${item.name} Edited`;
    await editForm.locator('#name').fill(newName);

    await editForm.locator('#category').selectOption({ label: '+ Add New Category' });
    const categoryInput = editForm.locator('#category');
    await expect(categoryInput).toBeEditable();
    await categoryInput.fill('E2E Menu Category Edited');

    await editForm.locator('#price').fill('19.99');

    await editForm.getByRole('button', { name: 'Save Changes' }).click();
    await expect(editForm).toBeHidden();

    await page.getByPlaceholder('Search menu items...').fill(newName);
    const updatedRow = findMenuRow(page, newName);
    await expect(updatedRow).toContainText('E2E Menu Category Edited');
    await expect(updatedRow).toContainText('RM 19.99');

    await deleteMenuItem(page, newName);
  });

  test("admin can toggle a menu item's availability", async ({ page }) => {
    const item = await createMenuItem(page);

    await page.getByPlaceholder('Search menu items...').fill(item.name);
    const row = findMenuRow(page, item.name);
    await expect(row).toContainText('Available');

    await row.locator('button[title="Mark unavailable"]').click();
    await expect(row).toContainText('Unavailable');
    await expect(row.locator('button[title="Mark available"]')).toBeVisible();

    await row.locator('button[title="Mark available"]').click();
    await expect(row).toContainText('Available');
    await expect(row.locator('button[title="Mark unavailable"]')).toBeVisible();

    await deleteMenuItem(page, item.name);
  });

  test('shows validation errors for invalid name/category/price input', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add Item' }).click();
    const modalForm = page.locator('form').filter({ has: page.locator('#name') });

    // blank name, valid category + price -> "Name is required"
    await modalForm.locator('#category').selectOption({ label: '+ Add New Category' });
    const categoryInput = modalForm.locator('#category');
    await expect(categoryInput).toBeEditable();
    await categoryInput.fill('E2E Menu Validation Category');
    await modalForm.locator('#price').fill('10');
    await modalForm.getByRole('button', { name: 'Add Item' }).click();
    await expect(modalForm.getByText('Name is required')).toBeVisible();

    // fix name; blank category (revert via "Choose existing") -> "Category is required"
    await modalForm.locator('#name').fill('E2E Menu Validation Item');
    await modalForm.getByRole('button', { name: 'Choose existing' }).click();
    await modalForm.getByRole('button', { name: 'Add Item' }).click();
    await expect(modalForm.getByText('Category is required')).toBeVisible();

    // fix category; blank price -> "Price is required"
    await modalForm.locator('#category').selectOption({ label: '+ Add New Category' });
    await expect(categoryInput).toBeEditable();
    await categoryInput.fill('E2E Menu Validation Category');
    await modalForm.locator('#price').fill('');
    await modalForm.getByRole('button', { name: 'Add Item' }).click();
    await expect(modalForm.getByText('Price is required')).toBeVisible();

    // price = 0 -> "Price must be greater than 0"
    await modalForm.locator('#price').fill('0');
    await modalForm.getByRole('button', { name: 'Add Item' }).click();
    await expect(modalForm.getByText('Price must be greater than 0')).toBeVisible();

    // never submitted successfully throughout -> no item was created
    await expect(modalForm).toBeVisible();
    await page.locator('.modal-header button.btn-close').click();
    await expect(modalForm).toBeHidden();
  });

  test('renaming a category updates the item row', async ({ page }) => {
    const categoryName = `E2E Rename Category ${Date.now()}`;
    const item = await createMenuItem(page, { category: categoryName });

    const categoriesCard = page.locator('.card').filter({
      has: page.getByRole('heading', { name: 'Categories' }),
    });
    const categoryPill = categoriesCard.locator('div.border.rounded-2').filter({ hasText: categoryName });
    await categoryPill.getByTitle('Rename category').click();

    const renameModal = page.locator('.modal').filter({ hasText: 'Rename Category' });
    await expect(renameModal).toBeVisible();
    const renameInput = renameModal.locator('#rename-category');
    await expect(renameInput).toHaveValue(categoryName);

    const newCategoryName = `${categoryName} Renamed`;
    await renameInput.fill(newCategoryName);
    await renameModal.getByRole('button', { name: 'Save' }).click();
    await expect(renameModal).toBeHidden();

    await page.getByPlaceholder('Search menu items...').fill(item.name);
    const row = findMenuRow(page, item.name);
    await expect(row).toContainText(newCategoryName);

    await deleteMenuItem(page, item.name);
  });
});
