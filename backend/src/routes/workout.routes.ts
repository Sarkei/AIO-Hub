/**
 * Workout Routes
 * 
 * Endpoints:
 * - GET    /api/workouts              - Alle Workouts abrufen
 * - POST   /api/workouts              - Neues Workout erstellen
 * - GET    /api/workouts/:id          - Workout nach ID mit Übungen & Sätzen
 * - PUT    /api/workouts/:id          - Workout aktualisieren
 * - DELETE /api/workouts/:id          - Workout löschen
 * - POST   /api/workouts/:id/exercises - Übung zu Workout hinzufügen
 * - PUT    /api/workouts/:workoutId/exercises/:exerciseId - Übung aktualisieren
 * - DELETE /api/workouts/:workoutId/exercises/:exerciseId - Übung löschen
 * - POST   /api/workouts/:workoutId/exercises/:exerciseId/sets - Satz hinzufügen
 * - PUT    /api/workouts/:workoutId/exercises/:exerciseId/sets/:setId - Satz aktualisieren
 * - DELETE /api/workouts/:workoutId/exercises/:exerciseId/sets/:setId - Satz löschen
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { WorkoutController } from '../controllers/workout.controller';

const router = Router();
const workoutController = new WorkoutController();

// Alle Routes benötigen Authentication
router.use(authenticate);

// Workout Validation
const createWorkoutValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('notes').optional().trim()
];

const updateWorkoutValidation = [
  param('id').isUUID(),
  ...createWorkoutValidation
];

// Exercise Validation
const createExerciseValidation = [
  param('id').isUUID().withMessage('Invalid workout ID'),
  body('name').trim().notEmpty().withMessage('Exercise name is required'),
  body('notes').optional().trim()
];

const updateExerciseValidation = [
  param('workoutId').isUUID(),
  param('exerciseId').isUUID(),
  body('name').trim().notEmpty(),
  body('notes').optional().trim()
];

// Set Validation
const createSetValidation = [
  param('workoutId').isUUID(),
  param('exerciseId').isUUID(),
  body('reps').isInt({ min: 0 }).withMessage('Reps must be a positive integer'),
  body('weight').optional().isFloat({ min: 0 }),
  body('rpe').optional().isInt({ min: 1, max: 10 }).withMessage('RPE must be between 1 and 10'),
  body('notes').optional().trim()
];

const updateSetValidation = [
  param('workoutId').isUUID(),
  param('exerciseId').isUUID(),
  param('setId').isUUID(),
  ...createSetValidation.slice(2) // Ohne die param validations
];

// Workout Routes
router.get('/', workoutController.getAllWorkouts);
router.post('/', createWorkoutValidation, workoutController.createWorkout);
router.get('/:id', param('id').isUUID(), workoutController.getWorkoutById);
router.put('/:id', updateWorkoutValidation, workoutController.updateWorkout);
router.delete('/:id', param('id').isUUID(), workoutController.deleteWorkout);

// Exercise Routes
router.post('/:id/exercises', createExerciseValidation, workoutController.addExercise);
router.put('/:workoutId/exercises/:exerciseId', updateExerciseValidation, workoutController.updateExercise);
router.delete('/:workoutId/exercises/:exerciseId', workoutController.deleteExercise);

// Set Routes
router.post('/:workoutId/exercises/:exerciseId/sets', createSetValidation, workoutController.addSet);
router.put('/:workoutId/exercises/:exerciseId/sets/:setId', updateSetValidation, workoutController.updateSet);
router.delete('/:workoutId/exercises/:exerciseId/sets/:setId', workoutController.deleteSet);

export default router;
