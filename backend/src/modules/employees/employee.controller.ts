import { Request, Response } from 'express';
import { EmployeeService } from './employee.service';
import { createEmployeeSchema, updateEmployeeSchema, resetPasswordSchema } from './employee.validation';

export class EmployeeController {
  private readonly employeeService = new EmployeeService();

  list = async (_req: Request, res: Response) => {
    const employees = await this.employeeService.list();
    res.json({ employees });
  };

  listRoles = async (_req: Request, res: Response) => {
    const roles = await this.employeeService.listRoles();
    res.json({ roles });
  };

  getById = async (req: Request, res: Response) => {
    try {
      const employee = await this.employeeService.getById(Number(req.params.id));
      res.json({ employee });
    } catch {
      res.status(404).json({ message: 'Employee not found' });
    }
  };

  create = async (req: Request, res: Response) => {
    const parsed = createEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    try {
      const employee = await this.employeeService.create(parsed.data);
      res.status(201).json({ employee });
    } catch (err) {
      res.status(409).json({ message: err instanceof Error ? err.message : 'Could not create employee' });
    }
  };

  update = async (req: Request, res: Response) => {
    const parsed = updateEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    try {
      const employee = await this.employeeService.update(Number(req.params.id), parsed.data);
      res.json({ employee });
    } catch {
      res.status(404).json({ message: 'Employee not found' });
    }
  };

  deactivate = async (req: Request, res: Response) => {
    try {
      const employee = await this.employeeService.deactivate(Number(req.params.id));
      res.json({ employee });
    } catch {
      res.status(404).json({ message: 'Employee not found' });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    try {
      const result = await this.employeeService.resetPassword(Number(req.params.id), parsed.data.password);
      res.json(result);
    } catch {
      res.status(404).json({ message: 'Employee not found' });
    }
  };
}
