import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, changePasswordSchema } from './auth.validation';

export class AuthController {
  private readonly authService = new AuthService();

  login = async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }

    try {
      const result = await this.authService.login(parsed.data);
      res.json(result);
    } catch {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      const employee = await this.authService.me(req.employee!.id);
      res.json({ employee });
    } catch {
      res.status(404).json({ message: 'Employee not found' });
    }
  };

  changePassword = async (req: Request, res: Response) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    try {
      await this.authService.changePassword(req.employee!.id, parsed.data.currentPassword, parsed.data.newPassword);
      res.json({ message: 'Password changed' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      res.status(400).json({ message });
    }
  };
}
