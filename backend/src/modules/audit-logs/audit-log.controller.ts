import { Request, Response } from 'express';
import { AuditLogService } from './audit-log.service';

export class AuditLogController {
  private readonly auditLogService = new AuditLogService();

  list = async (req: Request, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    const logs = await this.auditLogService.list({ from, to });
    res.json({ logs });
  };
}
