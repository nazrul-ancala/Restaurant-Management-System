import { AuditLogRepository } from './audit-log.repository';

function toAuditLogResponse(log: any) {
  return {
    id: log.id,
    employee: log.employee ? { id: log.employee.id, name: log.employee.name } : null,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    details: log.details,
    createdAt: log.createdAt,
  };
}

export class AuditLogService {
  private readonly auditLogRepository = new AuditLogRepository();

  // Called directly from other services (in-process, not over HTTP) whenever
  // an action worth recording happens. Currently only Orders' Refund calls this.
  async log(entry: { employeeId?: number; action: string; entityType: string; entityId: number; details?: string }) {
    await this.auditLogRepository.create(entry);
  }

  async list(filters: { from?: string; to?: string }) {
    const logs = await this.auditLogRepository.findAll(filters);
    return logs.map(toAuditLogResponse);
  }
}
