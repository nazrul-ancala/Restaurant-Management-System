import { prisma } from '../../lib/prisma';

export class TableRepository {
  findAll() {
    return prisma.table.findMany({ orderBy: { id: 'asc' } });
  }

  findById(id: number) {
    return prisma.table.findUnique({ where: { id } });
  }

  findByQrCode(qrCode: string) {
    return prisma.table.findUnique({ where: { qrCode } });
  }

  create(data: { name: string; capacity: number }) {
    return prisma.table.create({ data });
  }

  update(id: number, data: Partial<{ name: string; capacity: number; status: string }>) {
    return prisma.table.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.table.delete({ where: { id } });
  }
}
