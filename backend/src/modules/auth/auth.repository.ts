import { prisma } from '../../lib/prisma';

export class AuthRepository {
  findByEmail(email: string) {
    return prisma.employee.findUnique({
      where: { email },
      include: { role: true },
    });
  }
}
