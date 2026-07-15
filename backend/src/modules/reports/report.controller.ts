import { Request, Response } from 'express';
import { ReportService } from './report.service';

function parseRange(req: Request): 'daily' | 'weekly' | 'monthly' {
  const range = req.query.range;
  if (range === 'weekly' || range === 'monthly') return range;
  return 'daily';
}

export class ReportController {
  private readonly reportService = new ReportService();

  sales = async (req: Request, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    const report = await this.reportService.getSales(parseRange(req), from, to);
    res.json(report);
  };

  menuPerformance = async (req: Request, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    const sort = req.query.sort === 'worst' ? 'worst' : 'best';
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
    const report = await this.reportService.getMenuPerformance(from, to, sort, limit);
    res.json(report);
  };

  lowStock = async (_req: Request, res: Response) => {
    const report = await this.reportService.getLowStock();
    res.json(report);
  };

  consumption = async (req: Request, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    const report = await this.reportService.getConsumption(from, to);
    res.json(report);
  };

  waste = async (req: Request, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    const report = await this.reportService.getWaste(parseRange(req), from, to);
    res.json(report);
  };

  staffSales = async (req: Request, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    const report = await this.reportService.getStaffSales(from, to);
    res.json(report);
  };

  kitchenPerformance = async (req: Request, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    const report = await this.reportService.getKitchenPerformance(parseRange(req), from, to);
    res.json(report);
  };
}
