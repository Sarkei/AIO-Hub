/**
 * Event Routes
 * 
 * Endpoints:
 * - GET    /api/events        - Alle Events abrufen (mit optionalem Datumsfilter)
 * - POST   /api/events        - Neues Event erstellen
 * - GET    /api/events/:id    - Event nach ID abrufen
 * - PUT    /api/events/:id    - Event aktualisieren
 * - DELETE /api/events/:id    - Event löschen
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { EventController } from '../controllers/event.controller';

const router = Router();
const eventController = new EventController();

// Alle Routes benötigen Authentication
router.use(authenticate);

// Validation Rules
const createEventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('location')
    .optional()
    .trim(),
  
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date'),
  
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date'),
  
  body('allDay')
    .optional()
    .isBoolean()
    .withMessage('allDay must be a boolean'),
  
  body('notes')
    .optional()
    .trim()
];

const updateEventValidation = [
  param('id').isUUID().withMessage('Invalid event ID'),
  ...createEventValidation
];

const idValidation = [
  param('id').isUUID().withMessage('Invalid event ID')
];

// Routes
router.get(
  '/',
  eventController.getAllEvents
);
router.post('/', createEventValidation, eventController.createEvent);
router.get('/:id', idValidation, eventController.getEventById);
router.put('/:id', updateEventValidation, eventController.updateEvent);
router.delete('/:id', idValidation, eventController.deleteEvent);

export default router;
