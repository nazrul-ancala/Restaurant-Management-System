import bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { signToken } from '../../lib/jwt';
import type { LoginDto } from './auth.types';

export class AuthService {
  private readonly authRepository = new AuthRepository();

  async login({ email, password }: LoginDto) {
    const employee = await this.authRepository.findByEmail(email);

    // BR-001: only active employees can log in.
    if (!employee || employee.status !== 'active') {
      throw new Error('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, employee.password);
    if (!passwordMatches) {
      throw new Error('Invalid credentials');
    }

    const token = signToken({ id: employee.id, role: employee.role.name });

    return {
      token,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role.name,
      },
    };
  }

  // req.employee is only ever the decoded JWT payload ({id, role}), so "me"
  // fetches the live record here rather than trusting a possibly-stale token.
  async me(employeeId: number) {
    const employee = await this.authRepository.findById(employeeId);
    if (!employee) throw new Error('Employee not found');
    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role.name,
    };
  }

  async changePassword(employeeId: number, currentPassword: string, newPassword: string) {
    const employee = await this.authRepository.findById(employeeId);
    if (!employee) throw new Error('Employee not found');

    const matches = await bcrypt.compare(currentPassword, employee.password);
    if (!matches) throw new Error('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updatePassword(employeeId, passwordHash);
  }
}
