import type { z } from 'zod';
import { InventoryRepository } from './inventory.repository';
import type { createInventoryItemSchema, updateInventoryItemSchema, adjustStockSchema } from './inventory.validation';

type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
type AdjustStockInput = z.infer<typeof adjustStockSchema>;

const REASON_REQUIRED_TYPES = ['Waste', 'Adjustment'];

export class InventoryService {
  private readonly inventoryRepository = new InventoryRepository();

  list() {
    return this.inventoryRepository.findAll();
  }

  async getById(id: number) {
    const item = await this.inventoryRepository.findById(id);
    if (!item) throw new Error('Inventory item not found');
    return item;
  }

  create(input: CreateInventoryItemInput) {
    return this.inventoryRepository.create(input);
  }

  async update(id: number, input: UpdateInventoryItemInput) {
    const existing = await this.inventoryRepository.findById(id);
    if (!existing) throw new Error('Inventory item not found');
    return this.inventoryRepository.update(id, input);
  }

  async delete(id: number) {
    const existing = await this.inventoryRepository.findById(id);
    if (!existing) throw new Error('Inventory item not found');
    await this.inventoryRepository.delete(id);
  }

  async adjustStock(id: number, input: AdjustStockInput) {
    const item = await this.inventoryRepository.findById(id);
    if (!item) throw new Error('Inventory item not found');

    if (REASON_REQUIRED_TYPES.includes(input.type) && !input.note?.trim()) {
      throw new Error('A reason (note) is required for Waste and Adjustment movements');
    }

    const resultingQuantity = Number(item.quantity) + input.delta;
    if (resultingQuantity < 0) throw new Error('Inventory quantity cannot become negative');

    return this.inventoryRepository.createMovementAndUpdateQuantity(id, input.type, input.delta, input.note);
  }
}
