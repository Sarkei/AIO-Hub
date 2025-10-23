import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get user preferences
 */
export const getPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    // Create default preferences if not exist
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId,
          collapsedCategories: []
        }
      });
    }

    res.json({ preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update collapsed categories
 */
export const updateCollapsedCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { collapsedCategories } = req.body;

    if (!Array.isArray(collapsedCategories)) {
      res.status(400).json({ message: 'collapsedCategories must be an array' });
      return;
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: { collapsedCategories },
      create: {
        userId,
        collapsedCategories
      }
    });

    res.json({ preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
