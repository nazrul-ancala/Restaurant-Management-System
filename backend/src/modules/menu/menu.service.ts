import type { z } from 'zod';
import { MenuRepository } from './menu.repository';
import type { createMenuItemSchema, updateMenuItemSchema } from './menu.validation';

type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;

export class ConflictError extends Error {}

export class MenuService {
  private readonly menuRepository = new MenuRepository();

  private async resolveCategoryId(name: string) {
    const existing = await this.menuRepository.findCategoryByName(name);
    if (existing) return existing.id;
    const created = await this.menuRepository.createCategory(name);
    return created.id;
  }

  list() {
    return this.menuRepository.findAll();
  }

  async listAvailable() {
    const items = await this.menuRepository.findAll();
    return items.filter((item) => item.status === 'available');
  }

  async getById(id: number) {
    const item = await this.menuRepository.findById(id);
    if (!item) throw new Error('Menu item not found');
    return item;
  }

  async create(input: CreateMenuItemInput) {
    const categoryId = await this.resolveCategoryId(input.category);
    return this.menuRepository.create({
      name: input.name,
      categoryId,
      price: input.price,
      description: input.description,
      imageUrl: input.imageUrl,
    });
  }

  async update(id: number, input: UpdateMenuItemInput) {
    const existing = await this.menuRepository.findById(id);
    if (!existing) throw new Error('Menu item not found');

    const { category, ...rest } = input;
    const categoryId = category ? await this.resolveCategoryId(category) : undefined;

    return this.menuRepository.update(id, { ...rest, ...(categoryId ? { categoryId } : {}) });
  }

  async delete(id: number) {
    const existing = await this.menuRepository.findById(id);
    if (!existing) throw new Error('Menu item not found');

    const orderItemCount = await this.menuRepository.countOrderItemsForMenuItem(id);
    if (orderItemCount > 0) throw new ConflictError('Menu item is referenced by existing orders and cannot be deleted');

    await this.menuRepository.delete(id);
  }
}
