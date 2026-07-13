import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { loginSchema } from './auth.validation';

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

  me = (req: Request, res: Response) => {
    res.json({ employee: req.employee });
  };
}
