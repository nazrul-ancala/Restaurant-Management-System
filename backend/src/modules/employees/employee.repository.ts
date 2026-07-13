import { prisma } from '../../lib/prisma';

export class EmployeeRepository {
  findAll() {
    return prisma.employee.findMany({ include: { role: true }, orderBy: { id: 'asc' } });
  }

  findById(id: number) {
    return prisma.employee.findUnique({ where: { id }, include: { role: true } });
  }

  findByEmail(email: string) {
    return prisma.employee.findUnique({ where: { email } });
  }

  create(data: { name: string; email: string; password: string; roleId: number }) {
    return prisma.employee.create({ data, include: { role: true } });
  }

  update(id: number, data: Partial<{ name: string; email: string; roleId: number }>) {
    return prisma.employee.update({ where: { id }, data, include: { role: true } });
  }

  updateStatus(id: number, status: string) {
    return prisma.employee.update({ where: { id }, data: { status }, include: { role: true } });
  }

  updatePassword(id: number, password: string) {
    return prisma.employee.update({ where: { id }, data: { password } });
  }

  listRoles() {
    return prisma.role.findMany({ orderBy: { id: 'asc' } });
  }
}
