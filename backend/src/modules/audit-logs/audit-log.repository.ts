import { prisma } from '../../lib/prisma';

export class AuditLogRepository {
  create(data: { employeeId?: number; action: string; entityType: string; entityId: number; details?: string }) {
    return prisma.auditLog.create({ data });
  }

  findAll(filters: { from?: string; to?: string }) {
    // `to` is a plain YYYY-MM-DD, which Date parses as UTC midnight -- push it
    // to the end of that day so entries created later on the "to" date aren't
    // excluded (same fix report.service.ts's parseDateRange already applies).
    const lte = filters.to ? new Date(filters.to) : undefined;
    lte?.setHours(23, 59, 59, 999);

    return prisma.auditLog.findMany({
      where: {
        ...(filters.from || filters.to
          ? {
              createdAt: {
                ...(filters.from ? { gte: new Date(filters.from) } : {}),
                ...(lte ? { lte } : {}),
              },
            }
          : {}),
      },
      include: { employee: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
