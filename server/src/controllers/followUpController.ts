import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { FollowUpType, ActivityType } from '@prisma/client';

export const createFollowUpSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid due date format',
    }),
    dueTime: z.string().optional().nullable(),
    type: z.nativeEnum(FollowUpType).default(FollowUpType.TASK),
  }),
});

export const updateFollowUpSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional().nullable(),
    dueDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid due date format',
    }),
    dueTime: z.string().optional().nullable(),
    type: z.nativeEnum(FollowUpType).optional(),
    isCompleted: z.boolean().optional(),
  }),
});

export async function getLeadFollowUps(req: Request, res: Response, next: NextFunction) {
  try {
    const { leadId } = req.params;

    const followUps = await prisma.followUp.findMany({
      where: { leadId },
      orderBy: { dueDate: 'asc' },
    });

    return res.json({ success: true, data: followUps });
  } catch (error) {
    next(error);
  }
}

export async function createFollowUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { leadId } = req.params;
    const { title, description, dueDate, dueTime, type } = req.body;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const newFollowUp = await prisma.followUp.create({
      data: {
        leadId,
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        dueTime: dueTime || null,
        type: type || FollowUpType.TASK,
      },
    });

    // Create activity record for follow-up scheduled
    await prisma.activity.create({
      data: {
        leadId,
        type: ActivityType.SYSTEM,
        content: `Scheduled follow-up (${type || FollowUpType.TASK}): "${title}" for ${new Date(
          dueDate
        ).toLocaleDateString()}${dueTime ? ` at ${dueTime}` : ''}.`,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Follow-up created successfully',
      data: newFollowUp,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateFollowUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await prisma.followUp.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    const { title, description, dueDate, dueTime, type, isCompleted } = req.body;

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(dueTime !== undefined && { dueTime: dueTime || null }),
        ...(type && { type }),
        ...(isCompleted !== undefined && {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        }),
      },
    });

    return res.json({
      success: true,
      message: 'Follow-up updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleFollowUpCompletion(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await prisma.followUp.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    const newCompleted = !existing.isCompleted;

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        isCompleted: newCompleted,
        completedAt: newCompleted ? new Date() : null,
      },
    });

    // Create activity entry
    await prisma.activity.create({
      data: {
        leadId: existing.leadId,
        type: ActivityType.SYSTEM,
        content: newCompleted
          ? `Completed follow-up: "${existing.title}".`
          : `Re-opened follow-up: "${existing.title}".`,
      },
    });

    return res.json({
      success: true,
      message: newCompleted ? 'Follow-up marked as completed' : 'Follow-up re-opened',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteFollowUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await prisma.followUp.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    await prisma.followUp.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Follow-up deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
