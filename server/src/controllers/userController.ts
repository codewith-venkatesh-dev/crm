import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email address is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    userRight: z.number().int().min(0).max(1).default(0), // 1 = Super Admin, 0 = Normal User
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Valid email address is required').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    userRight: z.number().int().min(0).max(1).optional(),
  }),
});

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        userRight: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdLeads: true,
            assignedFollowUps: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, password, userRight } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userRight: userRight !== undefined ? userRight : 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        userRight: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, email, password, userRight } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(userRight !== undefined && { userRight }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        userRight: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({
      success: true,
      message: 'User details updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account while logged in.',
      });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
