/**
 * Nutrition Controller
 * 
 * Verwaltet Ernährungsprofil und Mahlzeiten-Logs
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

export class NutritionController {
  /**
   * Ernährungsprofil des Users abrufen
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;

      const profile: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."nutrition_profiles"
        WHERE user_id = '${userId}'
      `);

      if (!profile || profile.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'No nutrition profile found. Please create one.'
        });
        return;
      }

      res.status(200).json({ profile: profile[0] });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch profile'
      });
    }
  }

  /**
   * Ernährungsprofil erstellen oder aktualisieren
   */
  async createOrUpdateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
        return;
      }

      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { goal, dietType, targetCalories, targetProtein, targetCarbs, targetFat } = req.body;

      // Prüfen ob Profil bereits existiert
      const existing: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."nutrition_profiles"
        WHERE user_id = '${userId}'
      `);

      if (existing && existing.length > 0) {
        // Update
        await prisma.$queryRawUnsafe(`
          UPDATE "${schemaName}"."nutrition_profiles"
          SET 
            goal = '${goal}',
            diet_type = '${dietType}',
            target_calories = ${targetCalories},
            target_protein = ${targetProtein || 'NULL'},
            target_carbs = ${targetCarbs || 'NULL'},
            target_fat = ${targetFat || 'NULL'},
            updated_at = NOW()
          WHERE user_id = '${userId}'
        `);

        const updated: any = await prisma.$queryRawUnsafe(`
          SELECT * FROM "${schemaName}"."nutrition_profiles"
          WHERE user_id = '${userId}'
        `);

        res.status(200).json({
          message: 'Profile updated successfully',
          profile: updated[0]
        });
      } else {
        // Create
        const id = uuidv4();

        await prisma.$queryRawUnsafe(`
          INSERT INTO "${schemaName}"."nutrition_profiles"
          (id, user_id, goal, diet_type, target_calories, target_protein, target_carbs, target_fat, created_at, updated_at)
          VALUES (
            '${id}',
            '${userId}',
            '${goal}',
            '${dietType}',
            ${targetCalories},
            ${targetProtein || 'NULL'},
            ${targetCarbs || 'NULL'},
            ${targetFat || 'NULL'},
            NOW(),
            NOW()
          )
        `);

        const profile: any = await prisma.$queryRawUnsafe(`
          SELECT * FROM "${schemaName}"."nutrition_profiles"
          WHERE id = '${id}'
        `);

        res.status(201).json({
          message: 'Profile created successfully',
          profile: profile[0]
        });
      }
    } catch (error) {
      console.error('Create/Update profile error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to save profile'
      });
    }
  }

  /**
   * Alle Nutrition Logs abrufen (optional mit Datum-Filter)
   */
  async getAllLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { startDate, endDate } = req.query;

      let query = `
        SELECT * FROM "${schemaName}"."nutrition_logs"
        WHERE user_id = '${userId}'
      `;

      if (startDate) {
        query += ` AND date >= '${startDate}'`;
      }
      if (endDate) {
        query += ` AND date <= '${endDate}'`;
      }

      query += ` ORDER BY date DESC, created_at DESC`;

      const logs = await prisma.$queryRawUnsafe(query);

      res.status(200).json({ logs });
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch logs'
      });
    }
  }

  /**
   * Neuen Nutrition Log erstellen
   */
  async createLog(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
        return;
      }

      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { date, mealType, foodName, calories, protein, carbs, fat, notes } = req.body;

      const id = uuidv4();

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."nutrition_logs"
        (id, user_id, date, meal_type, food_name, calories, protein, carbs, fat, notes, created_at, updated_at)
        VALUES (
          '${id}',
          '${userId}',
          '${date}',
          '${mealType}',
          '${foodName.replace(/'/g, "''")}',
          ${calories},
          ${protein || 'NULL'},
          ${carbs || 'NULL'},
          ${fat || 'NULL'},
          ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          NOW(),
          NOW()
        )
      `);

      const log: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."nutrition_logs"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'Log created successfully',
        log: log[0]
      });
    } catch (error) {
      console.error('Create log error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create log'
      });
    }
  }

  /**
   * Log nach ID abrufen
   */
  async getLogById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
        return;
      }

      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { id } = req.params;

      const log: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."nutrition_logs"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!log || log.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Log not found'
        });
        return;
      }

      res.status(200).json({ log: log[0] });
    } catch (error) {
      console.error('Get log error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch log'
      });
    }
  }

  /**
   * Log aktualisieren
   */
  async updateLog(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
        return;
      }

      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { id } = req.params;
      const { date, mealType, foodName, calories, protein, carbs, fat, notes } = req.body;

      const existing: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."nutrition_logs"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!existing || existing.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Log not found'
        });
        return;
      }

      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."nutrition_logs"
        SET 
          date = '${date}',
          meal_type = '${mealType}',
          food_name = '${foodName.replace(/'/g, "''")}',
          calories = ${calories},
          protein = ${protein || 'NULL'},
          carbs = ${carbs || 'NULL'},
          fat = ${fat || 'NULL'},
          notes = ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          updated_at = NOW()
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      const updated: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."nutrition_logs"
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'Log updated successfully',
        log: updated[0]
      });
    } catch (error) {
      console.error('Update log error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update log'
      });
    }
  }

  /**
   * Log löschen
   */
  async deleteLog(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
        return;
      }

      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { id } = req.params;

      const existing: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."nutrition_logs"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!existing || existing.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Log not found'
        });
        return;
      }

      await prisma.$queryRawUnsafe(`
        DELETE FROM "${schemaName}"."nutrition_logs"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      res.status(200).json({
        message: 'Log deleted successfully'
      });
    } catch (error) {
      console.error('Delete log error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete log'
      });
    }
  }

  /**
   * Statistiken für heute und diese Woche
   */
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      // Heute
      const todayLogs: any = await prisma.$queryRawUnsafe(`
        SELECT 
          COALESCE(SUM(calories), 0) as total_calories,
          COALESCE(SUM(protein), 0) as total_protein,
          COALESCE(SUM(carbs), 0) as total_carbs,
          COALESCE(SUM(fat), 0) as total_fat
        FROM "${schemaName}"."nutrition_logs"
        WHERE user_id = '${userId}' AND date = '${today}'
      `);

      // Diese Woche
      const weekLogs: any = await prisma.$queryRawUnsafe(`
        SELECT 
          COALESCE(SUM(calories), 0) as total_calories,
          COALESCE(SUM(protein), 0) as total_protein,
          COALESCE(SUM(carbs), 0) as total_carbs,
          COALESCE(SUM(fat), 0) as total_fat
        FROM "${schemaName}"."nutrition_logs"
        WHERE user_id = '${userId}' AND date >= '${weekAgoStr}'
      `);

      // Profile holen für Ziele
      const profile: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."nutrition_profiles"
        WHERE user_id = '${userId}'
      `);

      res.status(200).json({
        today: todayLogs[0] || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 },
        week: weekLogs[0] || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 },
        profile: profile && profile.length > 0 ? profile[0] : null
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch stats'
      });
    }
  }
}
