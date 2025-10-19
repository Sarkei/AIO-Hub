/**
 * Event Controller
 * 
 * Verwaltet alle Event-Operationen (Termine)
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

export class EventController {
  /**
   * Alle Events des Users abrufen
   * Optional mit Datumsfilter (startDate, endDate)
   */
  async getAllEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { startDate, endDate } = req.query;

      let whereClause = `WHERE user_id = '${userId}'`;
      
      if (startDate) {
        whereClause += ` AND start_time >= '${startDate}'`;
      }
      if (endDate) {
        whereClause += ` AND end_time <= '${endDate}'`;
      }

      const events = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."events"
        ${whereClause}
        ORDER BY start_time ASC
      `);

      res.status(200).json({ events });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch events'
      });
    }
  }

  /**
   * Neues Event erstellen
   */
  async createEvent(req: AuthRequest, res: Response): Promise<void> {
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
      const { title, description, location, startTime, endTime, allDay, notes } = req.body;

      const id = uuidv4();

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."events"
        (id, user_id, title, description, location, start_time, end_time, all_day, notes, created_at, updated_at)
        VALUES (
          '${id}',
          '${userId}',
          '${title.replace(/'/g, "''")}',
          ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'},
          ${location ? `'${location.replace(/'/g, "''")}'` : 'NULL'},
          '${startTime}',
          '${endTime}',
          ${allDay || false},
          ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          NOW(),
          NOW()
        )
      `);

      const event: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."events"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'Event created successfully',
        event: event[0]
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create event'
      });
    }
  }

  /**
   * Event nach ID abrufen
   */
  async getEventById(req: AuthRequest, res: Response): Promise<void> {
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

      const event: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."events"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!event || event.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Event not found'
        });
        return;
      }

      res.status(200).json({ event: event[0] });
    } catch (error) {
      console.error('Get event error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch event'
      });
    }
  }

  /**
   * Event aktualisieren
   */
  async updateEvent(req: AuthRequest, res: Response): Promise<void> {
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
      const { title, description, location, startTime, endTime, allDay, notes } = req.body;

      const existing: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."events"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!existing || existing.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Event not found'
        });
        return;
      }

      const updates: string[] = [];
      if (title !== undefined) updates.push(`title = '${title.replace(/'/g, "''")}'`);
      if (description !== undefined) updates.push(`description = ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'}`);
      if (location !== undefined) updates.push(`location = ${location ? `'${location.replace(/'/g, "''")}'` : 'NULL'}`);
      if (startTime !== undefined) updates.push(`start_time = '${startTime}'`);
      if (endTime !== undefined) updates.push(`end_time = '${endTime}'`);
      if (allDay !== undefined) updates.push(`all_day = ${allDay}`);
      if (notes !== undefined) updates.push(`notes = ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'}`);
      updates.push(`updated_at = NOW()`);

      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."events"
        SET ${updates.join(', ')}
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      const updated: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."events"
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'Event updated successfully',
        event: updated[0]
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update event'
      });
    }
  }

  /**
   * Event löschen
   */
  async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
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
        SELECT * FROM "${schemaName}"."events"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!existing || existing.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Event not found'
        });
        return;
      }

      await prisma.$queryRawUnsafe(`
        DELETE FROM "${schemaName}"."events"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      res.status(200).json({
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete event'
      });
    }
  }
}
