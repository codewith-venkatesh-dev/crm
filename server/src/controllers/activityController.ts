import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { ActivityType } from '@prisma/client';

export const createActivitySchema = z.object({
  body: z.object({
    type: z.nativeEnum(ActivityType).default(ActivityType.NOTE),
    content: z.string().min(1, 'Content is required'),
  }),
});

export async function getLeadActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const { leadId } = req.params;

    const activities = await prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
}

export async function createActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const { leadId } = req.params;
    const { type, content } = req.body;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const activity = await prisma.activity.create({
      data: {
        leadId,
        type: type || ActivityType.NOTE,
        content,
      },
    });

    // Touch lead updatedAt
    await prisma.lead.update({
      where: { id: leadId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({
      success: true,
      message: 'Note/Activity added successfully',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
}
