/**
 * Body Metric Controller
 * 
 * Verwaltet Körperdaten (Gewicht, Körpermaße)
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

export class BodyMetricController {
  /**
   * Alle Body Metrics des Users abrufen
   */
  async getAllBodyMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;

      const metrics = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."body_metrics"
        WHERE user_id = '${userId}'
        ORDER BY date DESC
      `);

      res.status(200).json({ metrics });
    } catch (error) {
      console.error('Get body metrics error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch body metrics'
      });
    }
  }

  /**
   * Body Metric für bestimmtes Datum abrufen
   */
  async getBodyMetricByDate(req: AuthRequest, res: Response): Promise<void> {
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
      const { date } = req.params;

      const metric: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."body_metrics"
        WHERE user_id = '${userId}' AND date = '${date}'
      `);

      if (!metric || metric.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'No body metric found for this date'
        });
        return;
      }

      res.status(200).json({ metric: metric[0] });
    } catch (error) {
      console.error('Get body metric by date error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch body metric'
      });
    }
  }

  /**
   * Neuen Body Metric Eintrag erstellen
   */
  async createBodyMetric(req: AuthRequest, res: Response): Promise<void> {
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
      const { date, weight, bodyFat, chest, waist, hips, biceps, thighs, calves, notes } = req.body;

      // Prüfen ob für dieses Datum bereits ein Eintrag existiert
      const existing: any = await prisma.$queryRawUnsafe(`
        SELECT id FROM "${schemaName}"."body_metrics"
        WHERE user_id = '${userId}' AND date = '${date}'
      `);

      if (existing && existing.length > 0) {
        res.status(409).json({
          error: 'Conflict',
          message: 'Body metric for this date already exists'
        });
        return;
      }

      const id = uuidv4();

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."body_metrics"
        (id, user_id, date, weight, body_fat, chest, waist, hips, biceps, thighs, calves, notes, created_at, updated_at)
        VALUES (
          '${id}',
          '${userId}',
          '${date}',
          ${weight || 'NULL'},
          ${bodyFat || 'NULL'},
          ${chest || 'NULL'},
          ${waist || 'NULL'},
          ${hips || 'NULL'},
          ${biceps || 'NULL'},
          ${thighs || 'NULL'},
          ${calves || 'NULL'},
          ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          NOW(),
          NOW()
        )
      `);

      const metric: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."body_metrics"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'Body metric created successfully',
        metric: metric[0]
      });
    } catch (error) {
      console.error('Create body metric error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create body metric'
      });
    }
  }

  /**
   * Body Metric nach ID abrufen
   */
  async getBodyMetricById(req: AuthRequest, res: Response): Promise<void> {
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

      const metric: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."body_metrics"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!metric || metric.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Body metric not found'
        });
        return;
      }

      res.status(200).json({ metric: metric[0] });
    } catch (error) {
      console.error('Get body metric error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch body metric'
      });
    }
  }

  /**
   * Body Metric aktualisieren
   */
  async updateBodyMetric(req: AuthRequest, res: Response): Promise<void> {
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
      const { date, weight, bodyFat, chest, waist, hips, biceps, thighs, calves, notes } = req.body;

      const existing: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."body_metrics"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!existing || existing.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Body metric not found'
        });
        return;
      }

      const updates: string[] = [];
      if (date !== undefined) updates.push(`date = '${date}'`);
      if (weight !== undefined) updates.push(`weight = ${weight || 'NULL'}`);
      if (bodyFat !== undefined) updates.push(`body_fat = ${bodyFat || 'NULL'}`);
      if (chest !== undefined) updates.push(`chest = ${chest || 'NULL'}`);
      if (waist !== undefined) updates.push(`waist = ${waist || 'NULL'}`);
      if (hips !== undefined) updates.push(`hips = ${hips || 'NULL'}`);
      if (biceps !== undefined) updates.push(`biceps = ${biceps || 'NULL'}`);
      if (thighs !== undefined) updates.push(`thighs = ${thighs || 'NULL'}`);
      if (calves !== undefined) updates.push(`calves = ${calves || 'NULL'}`);
      if (notes !== undefined) updates.push(`notes = ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'}`);
      updates.push(`updated_at = NOW()`);

      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."body_metrics"
        SET ${updates.join(', ')}
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      const updated: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."body_metrics"
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'Body metric updated successfully',
        metric: updated[0]
      });
    } catch (error) {
      console.error('Update body metric error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update body metric'
      });
    }
  }

  /**
   * Body Metric löschen
   */
  async deleteBodyMetric(req: AuthRequest, res: Response): Promise<void> {
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
        SELECT * FROM "${schemaName}"."body_metrics"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!existing || existing.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Body metric not found'
        });
        return;
      }

      await prisma.$queryRawUnsafe(`
        DELETE FROM "${schemaName}"."body_metrics"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      res.status(200).json({
        message: 'Body metric deleted successfully'
      });
    } catch (error) {
      console.error('Delete body metric error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete body metric'
      });
    }
  }
}
