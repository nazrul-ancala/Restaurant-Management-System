import { prisma } from '../../lib/prisma';

export class SettingsRepository {
  findFirst() {
    return prisma.restaurantSettings.findFirst();
  }

  create() {
    return prisma.restaurantSettings.create({ data: {} });
  }

  update(id: number, data: Partial<{ name: string; address: string; phone: string; hours: string }>) {
    return prisma.restaurantSettings.update({ where: { id }, data });
  }
}
