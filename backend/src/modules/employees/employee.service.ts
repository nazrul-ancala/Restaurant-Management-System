import bcrypt from 'bcryptjs';
import type { Employee, Role } from '@prisma/client';
import type { z } from 'zod';
import { EmployeeRepository } from './employee.repository';
import type { createEmployeeSchema, updateEmployeeSchema } from './employee.validation';

type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
type EmployeeWithRole = Employee & { role: Role };

function toSafeEmployee(employee: EmployeeWithRole) {
  const { password: _password, ...safe } = employee;
  return safe;
}

export class EmployeeService {
  private readonly employeeRepository = new EmployeeRepository();

  async list() {
    const employees = await this.employeeRepository.findAll();
    return employees.map(toSafeEmployee);
  }

  async getById(id: number) {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) throw new Error('Employee not found');
    return toSafeEmployee(employee);
  }

  async create(input: CreateEmployeeInput) {
    const existing = await this.employeeRepository.findByEmail(input.email);
    if (existing) throw new Error('Email already in use');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const employee = await this.employeeRepository.create({
      name: input.name,
      email: input.email,
      password: passwordHash,
      roleId: input.roleId,
    });
    return toSafeEmployee(employee);
  }

  async update(id: number, input: UpdateEmployeeInput) {
    const employee = await this.employeeRepository.update(id, input);
    return toSafeEmployee(employee);
  }

  // Deactivate sets status to 'inactive'; BR-001 (auth.service) blocks login for non-active employees.
  async deactivate(id: number) {
    const employee = await this.employeeRepository.updateStatus(id, 'inactive');
    return toSafeEmployee(employee);
  }

  async activate(id: number) {
    const employee = await this.employeeRepository.updateStatus(id, 'active');
    return toSafeEmployee(employee);
  }

  async resetPassword(id: number, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.employeeRepository.updatePassword(id, passwordHash);
    return { message: 'Password reset' };
  }

  listRoles() {
    return this.employeeRepository.listRoles();
  }
}
