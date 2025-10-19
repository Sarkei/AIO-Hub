/**
 * Body Metric Routes
 * 
 * Endpoints:
 * - GET    /api/body-metrics           - Alle Body Metrics abrufen
 * - POST   /api/body-metrics           - Neuen Eintrag erstellen
 * - GET    /api/body-metrics/:id       - Eintrag nach ID abrufen
 * - PUT    /api/body-metrics/:id       - Eintrag aktualisieren
 * - DELETE /api/body-metrics/:id       - Eintrag löschen
 * - GET    /api/body-metrics/by-date/:date - Eintrag für bestimmtes Datum
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { BodyMetricController } from '../controllers/bodymetric.controller';

const router = Router();
const bodyMetricController = new BodyMetricController();

// Alle Routes benötigen Authentication
router.use(authenticate);

// Validation Rules
const createBodyMetricValidation = [
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  
  body('bodyFat')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Body fat must be between 0 and 100'),
  
  body('chest').optional().isFloat({ min: 0 }),
  body('waist').optional().isFloat({ min: 0 }),
  body('hips').optional().isFloat({ min: 0 }),
  body('biceps').optional().isFloat({ min: 0 }),
  body('thighs').optional().isFloat({ min: 0 }),
  body('calves').optional().isFloat({ min: 0 }),
  body('notes').optional().trim()
];

const updateBodyMetricValidation = [
  param('id').isUUID().withMessage('Invalid body metric ID'),
  ...createBodyMetricValidation
];

const idValidation = [
  param('id').isUUID().withMessage('Invalid body metric ID')
];

const dateValidation = [
  param('date').isISO8601().withMessage('Invalid date format')
];

// Routes
router.get('/', bodyMetricController.getAllBodyMetrics);
router.post('/', createBodyMetricValidation, bodyMetricController.createBodyMetric);
router.get('/by-date/:date', dateValidation, bodyMetricController.getBodyMetricByDate);
router.get('/:id', idValidation, bodyMetricController.getBodyMetricById);
router.put('/:id', updateBodyMetricValidation, bodyMetricController.updateBodyMetric);
router.delete('/:id', idValidation, bodyMetricController.deleteBodyMetric);

export default router;
