/**
 * Todo Controller
 * 
 * Verwaltet alle Todo-Operationen mit Schema-basierter Datentrennung
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

export class TodoController {
  /**
   * Alle Todos des Users abrufen
   */
  async getAllTodos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { status } = req.query;

      // Query mit optionalem Status-Filter
      let whereClause = `WHERE user_id = '${userId}'`;
      if (status && ['OPEN', 'IN_PROGRESS', 'DONE'].includes(status as string)) {
        whereClause += ` AND status = '${status}'`;
      }

      const todos = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."todos"
        ${whereClause}
        ORDER BY "order" ASC, created_at DESC
      `);

      res.status(200).json({ todos });
    } catch (error) {
      console.error('Get todos error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch todos'
      });
    }
  }

  /**
   * Neues Todo erstellen
   */
  async createTodo(req: AuthRequest, res: Response): Promise<void> {
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
      const { title, description, status, priority, dueDate } = req.body;

      const id = uuidv4();
      const todoStatus = status || 'OPEN';
      const todoPriority = priority || 1;

      // Nächste Order-Nummer für die Spalte ermitteln
      const maxOrderResult: any = await prisma.$queryRawUnsafe(`
        SELECT COALESCE(MAX("order"), -1) as max_order
        FROM "${schemaName}"."todos"
        WHERE user_id = '${userId}' AND status = '${todoStatus}'
      `);
      const nextOrder = (maxOrderResult[0]?.max_order ?? -1) + 1;

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."todos"
        (id, user_id, title, description, status, priority, due_date, "order", created_at, updated_at)
        VALUES (
          '${id}',
          '${userId}',
          '${title.replace(/'/g, "''")}',
          ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'},
          '${todoStatus}',
          ${todoPriority},
          ${dueDate ? `'${dueDate}'` : 'NULL'},
          ${nextOrder},
          NOW(),
          NOW()
        )
      `);

      const todo: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."todos"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'Todo created successfully',
        todo: todo[0]
      });
    } catch (error) {
      console.error('Create todo error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create todo'
      });
    }
  }

  /**
   * Todo nach ID abrufen
   */
  async getTodoById(req: AuthRequest, res: Response): Promise<void> {
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

      const todo: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."todos"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!todo || todo.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Todo not found'
        });
        return;
      }

      res.status(200).json({ todo: todo[0] });
    } catch (error) {
      console.error('Get todo error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch todo'
      });
    }
  }

  /**
   * Todo aktualisieren
   */
  async updateTodo(req: AuthRequest, res: Response): Promise<void> {
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
      const { title, description, status, priority, dueDate } = req.body;

      // Prüfen ob Todo existiert
      const existing: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."todos"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!existing || existing.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Todo not found'
        });
        return;
      }

      // Update Query bauen
      const updates: string[] = [];
      if (title !== undefined) updates.push(`title = '${title.replace(/'/g, "''")}'`);
      if (description !== undefined) updates.push(`description = ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'}`);
      if (status !== undefined) updates.push(`status = '${status}'`);
      if (priority !== undefined) updates.push(`priority = ${priority}`);
      if (dueDate !== undefined) updates.push(`due_date = ${dueDate ? `'${dueDate}'` : 'NULL'}`);
      updates.push(`updated_at = NOW()`);

      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."todos"
        SET ${updates.join(', ')}
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      const updated: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."todos"
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'Todo updated successfully',
        todo: updated[0]
      });
    } catch (error) {
      console.error('Update todo error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update todo'
      });
    }
  }

  /**
   * Todo löschen
   */
  async deleteTodo(req: AuthRequest, res: Response): Promise<void> {
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

      // Prüfen ob Todo existiert
      const existing: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."todos"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!existing || existing.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Todo not found'
        });
        return;
      }

      await prisma.$queryRawUnsafe(`
        DELETE FROM "${schemaName}"."todos"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      res.status(200).json({
        message: 'Todo deleted successfully'
      });
    } catch (error) {
      console.error('Delete todo error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete todo'
      });
    }
  }

  /**
   * Todo verschieben (Drag & Drop)
   * Aktualisiert Status und Order für Kanban-Sortierung
   */
  async moveTodo(req: AuthRequest, res: Response): Promise<void> {
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
      const { status, order } = req.body;

      // Prüfen ob Todo existiert
      const existing: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."todos"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!existing || existing.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Todo not found'
        });
        return;
      }

      // Update Status und Order
      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."todos"
        SET status = '${status}', "order" = ${order}, updated_at = NOW()
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      const updated: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."todos"
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'Todo moved successfully',
        todo: updated[0]
      });
    } catch (error) {
      console.error('Move todo error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to move todo'
      });
    }
  }
}
