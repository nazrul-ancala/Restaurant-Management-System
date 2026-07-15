import { prisma } from '../../lib/prisma';

type Range = 'daily' | 'weekly' | 'monthly';

function parseDateRange(from?: string, to?: string) {
  const lte = to ? new Date(to) : new Date();
  const gte = from ? new Date(from) : new Date(lte.getTime() - 30 * 24 * 60 * 60 * 1000);
  // Include the whole "to" day.
  lte.setHours(23, 59, 59, 999);
  return { gte, lte };
}

function bucketKey(date: Date, range: Range): string {
  if (range === 'monthly') return date.toISOString().slice(0, 7); // YYYY-MM
  if (range === 'weekly') {
    const monday = new Date(date);
    const day = monday.getDay() || 7; // Sunday -> 7
    monday.setDate(monday.getDate() - (day - 1));
    return monday.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

export class ReportService {
  async getSales(range: Range, from?: string, to?: string) {
    const { gte, lte } = parseDateRange(from, to);
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte, lte }, status: { in: ['Completed', 'Refunded'] } },
    });

    const completed = orders.filter((o) => o.status === 'Completed');
    const refunded = orders.filter((o) => o.status === 'Refunded');

    const bucketMap = new Map<string, { orderCount: number; revenue: number }>();
    for (const order of completed) {
      const key = bucketKey(order.createdAt, range);
      const bucket = bucketMap.get(key) ?? { orderCount: 0, revenue: 0 };
      bucket.orderCount += 1;
      bucket.revenue += Number(order.total);
      bucketMap.set(key, bucket);
    }
    const buckets = [...bucketMap.entries()]
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalOrders = completed.length;
    const totalRevenue = completed.reduce((sum, o) => sum + Number(o.total), 0);

    const typeMap = new Map<string, number>();
    for (const order of completed) {
      typeMap.set(order.orderType, (typeMap.get(order.orderType) ?? 0) + 1);
    }
    const byOrderType = [...typeMap.entries()].map(([orderType, count]) => ({
      orderType,
      count,
      percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 1000) / 10 : 0,
    }));

    return {
      buckets,
      totalRevenue,
      totalOrders,
      refundedCount: refunded.length,
      refundedAmount: refunded.reduce((sum, o) => sum + Number(o.total), 0),
      byOrderType,
    };
  }

  async getMenuPerformance(from: string | undefined, to: string | undefined, sort: 'best' | 'worst', limit: number) {
    const { gte, lte } = parseDateRange(from, to);
    const orderItems = await prisma.orderItem.findMany({
      where: { order: { status: 'Completed', createdAt: { gte, lte } } },
      include: { menuItem: { include: { category: true } } },
    });

    const map = new Map<number, { menuItemId: number; name: string; categoryName: string; quantitySold: number; revenue: number }>();
    for (const item of orderItems) {
      const existing = map.get(item.menuItemId) ?? {
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        categoryName: item.menuItem.category.name,
        quantitySold: 0,
        revenue: 0,
      };
      existing.quantitySold += item.quantity;
      existing.revenue += item.quantity * Number(item.unitPrice);
      map.set(item.menuItemId, existing);
    }

    const items = [...map.values()].sort((a, b) =>
      sort === 'best' ? b.quantitySold - a.quantitySold : a.quantitySold - b.quantitySold
    );
    return { items: items.slice(0, limit) };
  }

  async getLowStock() {
    const items = await prisma.inventoryItem.findMany({ orderBy: { id: 'asc' } });
    const lowStock = items
      .filter((i) => Number(i.quantity) <= Number(i.reorderThreshold))
      .map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        quantity: i.quantity,
        reorderThreshold: i.reorderThreshold,
        unit: i.unit,
      }));
    return { items: lowStock };
  }

  async getConsumption(from?: string, to?: string) {
    const { gte, lte } = parseDateRange(from, to);
    const movements = await prisma.stockMovement.findMany({
      where: { createdAt: { gte, lte }, type: { in: ['Sale', 'Waste'] } },
      include: { inventoryItem: true },
    });

    const map = new Map<number, { inventoryItemId: number; name: string; unit: string; totalUsed: number; totalWasted: number; cost: number }>();
    for (const m of movements) {
      const existing = map.get(m.inventoryItemId) ?? {
        inventoryItemId: m.inventoryItemId,
        name: m.inventoryItem.name,
        unit: m.inventoryItem.unit,
        totalUsed: 0,
        totalWasted: 0,
        cost: 0,
      };
      const magnitude = Math.abs(Number(m.delta));
      if (m.type === 'Sale') existing.totalUsed += magnitude;
      else existing.totalWasted += magnitude;
      existing.cost += magnitude * Number(m.inventoryItem.costPerUnit);
      map.set(m.inventoryItemId, existing);
    }
    return { items: [...map.values()] };
  }

  async getWaste(range: Range, from?: string, to?: string) {
    const { gte, lte } = parseDateRange(from, to);
    const movements = await prisma.stockMovement.findMany({
      where: { createdAt: { gte, lte }, type: 'Waste' },
      include: { inventoryItem: true },
    });

    const bucketMap = new Map<string, { quantity: number; cost: number }>();
    const itemMap = new Map<number, { inventoryItemId: number; name: string; quantity: number; cost: number }>();
    const reasonMap = new Map<string, number>();

    for (const m of movements) {
      const magnitude = Math.abs(Number(m.delta));
      const cost = magnitude * Number(m.inventoryItem.costPerUnit);

      const bKey = bucketKey(m.createdAt, range);
      const b = bucketMap.get(bKey) ?? { quantity: 0, cost: 0 };
      b.quantity += magnitude;
      b.cost += cost;
      bucketMap.set(bKey, b);

      const it = itemMap.get(m.inventoryItemId) ?? {
        inventoryItemId: m.inventoryItemId,
        name: m.inventoryItem.name,
        quantity: 0,
        cost: 0,
      };
      it.quantity += magnitude;
      it.cost += cost;
      itemMap.set(m.inventoryItemId, it);

      const reason = m.note?.trim() || 'No reason given';
      reasonMap.set(reason, (reasonMap.get(reason) ?? 0) + 1);
    }

    return {
      buckets: [...bucketMap.entries()].map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date)),
      byItem: [...itemMap.values()],
      byReason: [...reasonMap.entries()].map(([reason, count]) => ({ reason, count })),
    };
  }

  async getStaffSales(from?: string, to?: string) {
    const { gte, lte } = parseDateRange(from, to);
    const orders = await prisma.order.findMany({
      where: { status: 'Completed', createdAt: { gte, lte }, createdById: { not: null } },
      include: { createdBy: true },
    });

    const map = new Map<number, { employeeId: number; name: string; orderCount: number; revenue: number }>();
    for (const order of orders) {
      const employeeId = order.createdById!;
      const existing = map.get(employeeId) ?? { employeeId, name: order.createdBy!.name, orderCount: 0, revenue: 0 };
      existing.orderCount += 1;
      existing.revenue += Number(order.total);
      map.set(employeeId, existing);
    }
    return { staff: [...map.values()].sort((a, b) => b.revenue - a.revenue) };
  }

  async getKitchenPerformance(range: Range, from?: string, to?: string) {
    const { gte, lte } = parseDateRange(from, to);
    const orders = await prisma.order.findMany({
      where: { readyAt: { not: null }, createdAt: { gte, lte } },
    });

    const prepMinutesList = orders.map((o) => (o.readyAt!.getTime() - o.createdAt.getTime()) / 60000);

    const bucketMap = new Map<string, number[]>();
    orders.forEach((o, idx) => {
      const key = bucketKey(o.createdAt, range);
      const list = bucketMap.get(key) ?? [];
      list.push(prepMinutesList[idx]);
      bucketMap.set(key, list);
    });

    const buckets = [...bucketMap.entries()]
      .map(([date, list]) => ({
        date,
        avgPrepMinutes: Math.round((list.reduce((s, n) => s + n, 0) / list.length) * 10) / 10,
        orderCount: list.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const sorted = [...prepMinutesList].sort((a, b) => a - b);
    const overallAvgPrepMinutes =
      sorted.length > 0 ? Math.round((sorted.reduce((s, n) => s + n, 0) / sorted.length) * 10) / 10 : 0;
    const mid = Math.floor(sorted.length / 2);
    const rawMedian =
      sorted.length === 0 ? 0 : sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    const overallMedianPrepMinutes = Math.round(rawMedian * 10) / 10;

    return { buckets, overallAvgPrepMinutes, overallMedianPrepMinutes };
  }
}
