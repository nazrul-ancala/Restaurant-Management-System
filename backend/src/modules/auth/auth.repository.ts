import { prisma } from '../../lib/prisma';

export class AuthRepository {
  findByEmail(email: string) {
    return prisma.employee.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  findById(id: number) {
    return prisma.employee.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  updatePassword(id: number, password: string) {
    return prisma.employee.update({ where: { id }, data: { password } });
  }
}
