import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { LeadStatus } from '@prisma/client';

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();

    // Calculate start and end of today in local/UTC
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      negotiatingLeads,
      closedLeads,
      lostLeads,
      overdueFollowUpsCount,
      dueTodayFollowUpsCount,
      recentLeads,
      upcomingFollowUps,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: LeadStatus.NEW } }),
      prisma.lead.count({ where: { status: LeadStatus.CONTACTED } }),
      prisma.lead.count({ where: { status: LeadStatus.NEGOTIATING } }),
      prisma.lead.count({ where: { status: LeadStatus.CLOSED } }),
      prisma.lead.count({ where: { status: LeadStatus.LOST } }),
      prisma.followUp.count({
        where: {
          isCompleted: false,
          dueDate: { lt: startOfToday },
        },
      }),
      prisma.followUp.count({
        where: {
          isCompleted: false,
          dueDate: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          followUps: {
            where: { isCompleted: false },
            orderBy: { dueDate: 'asc' },
            take: 1,
          },
        },
      }),
      prisma.followUp.findMany({
        where: { isCompleted: false },
        take: 5,
        orderBy: { dueDate: 'asc' },
        include: {
          lead: {
            select: { id: true, name: true, companyName: true, status: true },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        summary: {
          totalLeads,
          newLeads,
          contactedLeads,
          negotiatingLeads,
          closedLeads,
          lostLeads,
          overdueFollowUps: overdueFollowUpsCount,
          dueTodayFollowUps: dueTodayFollowUpsCount,
        },
        recentLeads,
        upcomingFollowUps,
      },
    });
  } catch (error) {
    next(error);
  }
}
