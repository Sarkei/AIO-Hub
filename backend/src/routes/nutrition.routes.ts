/**
 * Nutrition Routes
 * 
 * Endpoints:
 * - GET    /api/nutrition/profile       - Ernährungsprofil abrufen
 * - POST   /api/nutrition/profile       - Ernährungsprofil erstellen/aktualisieren
 * - GET    /api/nutrition/logs          - Alle Logs abrufen (mit Datum-Filter)
 * - POST   /api/nutrition/logs          - Neuen Log erstellen
 * - GET    /api/nutrition/logs/:id      - Log nach ID abrufen
 * - PUT    /api/nutrition/logs/:id      - Log aktualisieren
 * - DELETE /api/nutrition/logs/:id      - Log löschen
 * - GET    /api/nutrition/stats         - Statistiken (heute, diese Woche)
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { NutritionController } from '../controllers/nutrition.controller';

const router = Router();
const nutritionController = new NutritionController();

// Alle Routes benötigen Authentication
router.use(authenticate);

// Profile Validation
const profileValidation = [
  body('goal')
    .isIn(['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_WEIGHT'])
    .withMessage('Goal must be LOSE_WEIGHT, MAINTAIN, or GAIN_WEIGHT'),
  
  body('dietType')
    .isIn(['STANDARD', 'HIGH_PROTEIN', 'KETO', 'VEGETARIAN', 'VEGAN'])
    .withMessage('Invalid diet type'),
  
  body('targetCalories')
    .isInt({ min: 500, max: 10000 })
    .withMessage('Target calories must be between 500 and 10000'),
  
  body('targetProtein').optional().isFloat({ min: 0 }),
  body('targetCarbs').optional().isFloat({ min: 0 }),
  body('targetFat').optional().isFloat({ min: 0 })
];

// Log Validation
const createLogValidation = [
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('mealType').isIn(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).withMessage('Invalid meal type'),
  body('foodName').trim().notEmpty().withMessage('Food name is required'),
  body('calories').isInt({ min: 0 }).withMessage('Calories must be a positive integer'),
  body('protein').optional().isFloat({ min: 0 }),
  body('carbs').optional().isFloat({ min: 0 }),
  body('fat').optional().isFloat({ min: 0 }),
  body('notes').optional().trim()
];

const updateLogValidation = [
  param('id').isUUID(),
  ...createLogValidation
];

// Profile Routes
router.get('/profile', nutritionController.getProfile);
router.post('/profile', profileValidation, nutritionController.createOrUpdateProfile);

// Log Routes
router.get('/logs', nutritionController.getAllLogs);
router.post('/logs', createLogValidation, nutritionController.createLog);
router.get('/logs/:id', param('id').isUUID(), nutritionController.getLogById);
router.put('/logs/:id', updateLogValidation, nutritionController.updateLog);
router.delete('/logs/:id', param('id').isUUID(), nutritionController.deleteLog);

// Stats Route
router.get('/stats', nutritionController.getStats);

export default router;
