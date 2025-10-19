/**
 * Workout Controller
 * 
 * Verwaltet Gym-Workouts mit verschachtelten Exercises und Sets
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

export class WorkoutController {
  /**
   * Alle Workouts des Users abrufen
   */
  async getAllWorkouts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;

      const workouts = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."workouts"
        WHERE user_id = '${userId}'
        ORDER BY date DESC
      `);

      res.status(200).json({ workouts });
    } catch (error) {
      console.error('Get workouts error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch workouts'
      });
    }
  }

  /**
   * Neues Workout erstellen
   */
  async createWorkout(req: AuthRequest, res: Response): Promise<void> {
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
      const { name, date, notes } = req.body;

      const id = uuidv4();

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."workouts"
        (id, user_id, name, date, notes, created_at, updated_at)
        VALUES (
          '${id}',
          '${userId}',
          '${name.replace(/'/g, "''")}',
          '${date}',
          ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          NOW(),
          NOW()
        )
      `);

      const workout: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."workouts"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'Workout created successfully',
        workout: workout[0]
      });
    } catch (error) {
      console.error('Create workout error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create workout'
      });
    }
  }

  /**
   * Workout nach ID mit allen Exercises und Sets abrufen
   */
  async getWorkoutById(req: AuthRequest, res: Response): Promise<void> {
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

      const workout: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."workouts"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!workout || workout.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Workout not found'
        });
        return;
      }

      // Exercises abrufen
      const exercises: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."exercises"
        WHERE workout_id = '${id}'
        ORDER BY created_at ASC
      `);

      // Für jede Exercise die Sets abrufen
      for (const exercise of exercises) {
        const sets: any = await prisma.$queryRawUnsafe(`
          SELECT * FROM "${schemaName}"."sets"
          WHERE exercise_id = '${exercise.id}'
          ORDER BY created_at ASC
        `);
        exercise.sets = sets;
      }

      const result = {
        ...workout[0],
        exercises
      };

      res.status(200).json({ workout: result });
    } catch (error) {
      console.error('Get workout error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch workout'
      });
    }
  }

  /**
   * Workout aktualisieren
   */
  async updateWorkout(req: AuthRequest, res: Response): Promise<void> {
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
      const { name, date, notes } = req.body;

      const existing: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."workouts"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!existing || existing.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Workout not found'
        });
        return;
      }

      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."workouts"
        SET 
          name = '${name.replace(/'/g, "''")}',
          date = '${date}',
          notes = ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          updated_at = NOW()
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      const updated: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."workouts"
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'Workout updated successfully',
        workout: updated[0]
      });
    } catch (error) {
      console.error('Update workout error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update workout'
      });
    }
  }

  /**
   * Workout löschen (CASCADE löscht auch Exercises und Sets)
   */
  async deleteWorkout(req: AuthRequest, res: Response): Promise<void> {
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
        SELECT * FROM "${schemaName}"."workouts"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!existing || existing.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Workout not found'
        });
        return;
      }

      // CASCADE delete
      await prisma.$queryRawUnsafe(`
        DELETE FROM "${schemaName}"."workouts"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      res.status(200).json({
        message: 'Workout deleted successfully'
      });
    } catch (error) {
      console.error('Delete workout error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete workout'
      });
    }
  }

  /**
   * Exercise zu Workout hinzufügen
   */
  async addExercise(req: AuthRequest, res: Response): Promise<void> {
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
      const { id: workoutId } = req.params;
      const { name, notes } = req.body;

      // Prüfen ob Workout existiert
      const workout: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."workouts"
        WHERE id = '${workoutId}' AND user_id = '${userId}'
      `);

      if (!workout || workout.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Workout not found'
        });
        return;
      }

      const id = uuidv4();

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."exercises"
        (id, workout_id, name, notes, created_at, updated_at)
        VALUES (
          '${id}',
          '${workoutId}',
          '${name.replace(/'/g, "''")}',
          ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          NOW(),
          NOW()
        )
      `);

      const exercise: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."exercises"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'Exercise added successfully',
        exercise: exercise[0]
      });
    } catch (error) {
      console.error('Add exercise error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to add exercise'
      });
    }
  }

  /**
   * Exercise aktualisieren
   */
  async updateExercise(req: AuthRequest, res: Response): Promise<void> {
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
      const { workoutId, exerciseId } = req.params;
      const { name, notes } = req.body;

      // Prüfen ob Exercise zu User gehört
      const exercise: any = await prisma.$queryRawUnsafe(`
        SELECT e.* FROM "${schemaName}"."exercises" e
        INNER JOIN "${schemaName}"."workouts" w ON e.workout_id = w.id
        WHERE e.id = '${exerciseId}' AND w.id = '${workoutId}' AND w.user_id = '${userId}'
      `);

      if (!exercise || exercise.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Exercise not found'
        });
        return;
      }

      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."exercises"
        SET 
          name = '${name.replace(/'/g, "''")}',
          notes = ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          updated_at = NOW()
        WHERE id = '${exerciseId}'
      `);

      const updated: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."exercises"
        WHERE id = '${exerciseId}'
      `);

      res.status(200).json({
        message: 'Exercise updated successfully',
        exercise: updated[0]
      });
    } catch (error) {
      console.error('Update exercise error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update exercise'
      });
    }
  }

  /**
   * Exercise löschen (CASCADE löscht auch Sets)
   */
  async deleteExercise(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { workoutId, exerciseId } = req.params;

      const exercise: any = await prisma.$queryRawUnsafe(`
        SELECT e.* FROM "${schemaName}"."exercises" e
        INNER JOIN "${schemaName}"."workouts" w ON e.workout_id = w.id
        WHERE e.id = '${exerciseId}' AND w.id = '${workoutId}' AND w.user_id = '${userId}'
      `);

      if (!exercise || exercise.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Exercise not found'
        });
        return;
      }

      await prisma.$queryRawUnsafe(`
        DELETE FROM "${schemaName}"."exercises"
        WHERE id = '${exerciseId}'
      `);

      res.status(200).json({
        message: 'Exercise deleted successfully'
      });
    } catch (error) {
      console.error('Delete exercise error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete exercise'
      });
    }
  }

  /**
   * Set zu Exercise hinzufügen
   */
  async addSet(req: AuthRequest, res: Response): Promise<void> {
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
      const { workoutId, exerciseId } = req.params;
      const { reps, weight, rpe, notes } = req.body;

      // Prüfen ob Exercise zu User gehört
      const exercise: any = await prisma.$queryRawUnsafe(`
        SELECT e.* FROM "${schemaName}"."exercises" e
        INNER JOIN "${schemaName}"."workouts" w ON e.workout_id = w.id
        WHERE e.id = '${exerciseId}' AND w.id = '${workoutId}' AND w.user_id = '${userId}'
      `);

      if (!exercise || exercise.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Exercise not found'
        });
        return;
      }

      const id = uuidv4();

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."sets"
        (id, exercise_id, reps, weight, rpe, notes, created_at, updated_at)
        VALUES (
          '${id}',
          '${exerciseId}',
          ${reps},
          ${weight || 'NULL'},
          ${rpe || 'NULL'},
          ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          NOW(),
          NOW()
        )
      `);

      const set: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."sets"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'Set added successfully',
        set: set[0]
      });
    } catch (error) {
      console.error('Add set error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to add set'
      });
    }
  }

  /**
   * Set aktualisieren
   */
  async updateSet(req: AuthRequest, res: Response): Promise<void> {
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
      const { workoutId, exerciseId, setId } = req.params;
      const { reps, weight, rpe, notes } = req.body;

      // Prüfen ob Set zu User gehört
      const set: any = await prisma.$queryRawUnsafe(`
        SELECT s.* FROM "${schemaName}"."sets" s
        INNER JOIN "${schemaName}"."exercises" e ON s.exercise_id = e.id
        INNER JOIN "${schemaName}"."workouts" w ON e.workout_id = w.id
        WHERE s.id = '${setId}' AND e.id = '${exerciseId}' AND w.id = '${workoutId}' AND w.user_id = '${userId}'
      `);

      if (!set || set.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Set not found'
        });
        return;
      }

      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."sets"
        SET 
          reps = ${reps},
          weight = ${weight || 'NULL'},
          rpe = ${rpe || 'NULL'},
          notes = ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          updated_at = NOW()
        WHERE id = '${setId}'
      `);

      const updated: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."sets"
        WHERE id = '${setId}'
      `);

      res.status(200).json({
        message: 'Set updated successfully',
        set: updated[0]
      });
    } catch (error) {
      console.error('Update set error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update set'
      });
    }
  }

  /**
   * Set löschen
   */
  async deleteSet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { workoutId, exerciseId, setId } = req.params;

      const set: any = await prisma.$queryRawUnsafe(`
        SELECT s.* FROM "${schemaName}"."sets" s
        INNER JOIN "${schemaName}"."exercises" e ON s.exercise_id = e.id
        INNER JOIN "${schemaName}"."workouts" w ON e.workout_id = w.id
        WHERE s.id = '${setId}' AND e.id = '${exerciseId}' AND w.id = '${workoutId}' AND w.user_id = '${userId}'
      `);

      if (!set || set.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Set not found'
        });
        return;
      }

      await prisma.$queryRawUnsafe(`
        DELETE FROM "${schemaName}"."sets"
        WHERE id = '${setId}'
      `);

      res.status(200).json({
        message: 'Set deleted successfully'
      });
    } catch (error) {
      console.error('Delete set error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete set'
      });
    }
  }
}
