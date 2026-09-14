import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { LeadSource, LeadStatus, ActivityType, Prisma } from '@prisma/client';

export const createLeadSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Full name is required'),
    companyName: z.string().optional().nullable(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')).nullable(),
    phone: z.string().optional().nullable(),
    source: z.nativeEnum(LeadSource, { required_error: 'Lead source is required' }),
    status: z.nativeEnum(LeadStatus, { required_error: 'Lead status is required' }),
    notes: z.string().optional().nullable(),
  }),
});

export const updateLeadSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Full name is required').optional(),
    companyName: z.string().optional().nullable(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')).nullable(),
    phone: z.string().optional().nullable(),
    source: z.nativeEnum(LeadSource).optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(LeadStatus, { required_error: 'Status is required' }),
  }),
});

export async function getLeads(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      search,
      status,
      source,
      followUpState,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '50',
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.LeadWhereInput = {};

    // Search query across name, companyName, email, phone
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { companyName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    // Status filter
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as LeadStatus;
    }

    // Source filter
    if (source && typeof source === 'string' && source !== 'ALL') {
      where.source = source as LeadSource;
    }

    // Follow-up state filter
    const now = new Date();
    if (followUpState && typeof followUpState === 'string') {
      if (followUpState === 'overdue') {
        where.followUps = {
          some: {
            isCompleted: false,
            dueDate: { lt: now },
          },
        };
      } else if (followUpState === 'upcoming') {
        where.followUps = {
          some: {
            isCompleted: false,
            dueDate: { gte: now },
          },
        };
      } else if (followUpState === 'none') {
        where.followUps = {
          none: {},
        };
      }
    }

    // Dynamic sorting
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'companyName', 'status'];
    const field = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { [field]: order },
        skip,
        take: limitNum,
        include: {
          followUps: {
            orderBy: { dueDate: 'asc' },
          },
          _count: {
            select: { followUps: true, activities: true },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return res.json({
      success: true,
      data: leads,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getLeadById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        followUps: {
          orderBy: { dueDate: 'asc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    return res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
}

export async function createLead(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, companyName, email, phone, source, status, notes } = req.body;

    const newLead = await prisma.lead.create({
      data: {
        name,
        companyName: companyName || null,
        email: email || null,
        phone: phone || null,
        source,
        status: status || LeadStatus.NEW,
        notes: notes || null,
        activities: {
          create: {
            type: ActivityType.SYSTEM,
            content: `Lead created manually with source "${source}" and status "${status || LeadStatus.NEW}".`,
          },
        },
      },
      include: {
        followUps: true,
        activities: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: newLead,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateLead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await prisma.lead.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const { name, companyName, email, phone, source, status, notes } = req.body;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(companyName !== undefined && { companyName: companyName || null }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(source && { source }),
        ...(status && { status }),
        ...(notes !== undefined && { notes: notes || null }),
        activities: {
          create: {
            type: ActivityType.NOTE,
            content: 'Lead details updated.',
          },
        },
      },
      include: {
        followUps: true,
        activities: true,
      },
    });

    return res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateLeadStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (existing.status === status) {
      return res.json({ success: true, data: existing });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status,
        activities: {
          create: {
            type: ActivityType.STATUS_CHANGE,
            content: `Status changed from ${existing.status} to ${status}.`,
          },
        },
      },
      include: {
        followUps: true,
        activities: true,
      },
    });

    return res.json({
      success: true,
      message: `Lead status updated to ${status}`,
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteLead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await prisma.lead.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    await prisma.lead.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
