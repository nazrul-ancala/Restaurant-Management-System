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
}
