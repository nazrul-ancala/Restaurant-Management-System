import type { z } from 'zod';
import { TableRepository } from './table.repository';
import type { createTableSchema, updateTableSchema } from './table.validation';

type CreateTableInput = z.infer<typeof createTableSchema>;
type UpdateTableInput = z.infer<typeof updateTableSchema>;

export class TableService {
  private readonly tableRepository = new TableRepository();

  list() {
    return this.tableRepository.findAll();
  }

  async getById(id: number) {
    const table = await this.tableRepository.findById(id);
    if (!table) throw new Error('Table not found');
    return table;
  }

  async getByQrCode(qrCode: string) {
    const table = await this.tableRepository.findByQrCode(qrCode);
    if (!table) throw new Error('Table not found');
    return table;
  }

  create(input: CreateTableInput) {
    return this.tableRepository.create(input);
  }

  async update(id: number, input: UpdateTableInput) {
    const existing = await this.tableRepository.findById(id);
    if (!existing) throw new Error('Table not found');
    return this.tableRepository.update(id, input);
  }

  async delete(id: number) {
    const existing = await this.tableRepository.findById(id);
    if (!existing) throw new Error('Table not found');
    await this.tableRepository.delete(id);
  }
}
