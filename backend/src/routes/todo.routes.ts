/**
 * Todo Routes
 * 
 * Endpoints:
 * - GET    /api/todos          - Alle Todos abrufen
 * - POST   /api/todos          - Neues Todo erstellen
 * - GET    /api/todos/:id      - Todo nach ID abrufen
 * - PUT    /api/todos/:id      - Todo aktualisieren
 * - DELETE /api/todos/:id      - Todo löschen
 * - PATCH  /api/todos/:id/move - Todo verschieben (Drag & Drop)
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { TodoController } from '../controllers/todo.controller';

const router = Router();
const todoController = new TodoController();

// Alle Routes benötigen Authentication
router.use(authenticate);

// Validation Rules
const createTodoValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be at most 2000 characters'),
  
  body('status')
    .optional()
    .isIn(['OPEN', 'IN_PROGRESS', 'DONE'])
    .withMessage('Status must be OPEN, IN_PROGRESS, or DONE'),
  
  body('priority')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Priority must be 1 (low), 2 (medium), or 3 (high)'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
];

const updateTodoValidation = [
  param('id').isUUID().withMessage('Invalid todo ID'),
  ...createTodoValidation
];

const idValidation = [
  param('id').isUUID().withMessage('Invalid todo ID')
];

const moveTodoValidation = [
  param('id').isUUID().withMessage('Invalid todo ID'),
  body('status')
    .isIn(['OPEN', 'IN_PROGRESS', 'DONE'])
    .withMessage('Status must be OPEN, IN_PROGRESS, or DONE'),
  body('order')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
];

// Routes
router.get('/', todoController.getAllTodos);
router.post('/', createTodoValidation, todoController.createTodo);
router.get('/:id', idValidation, todoController.getTodoById);
router.put('/:id', updateTodoValidation, todoController.updateTodo);
router.delete('/:id', idValidation, todoController.deleteTodo);
router.patch('/:id/move', moveTodoValidation, todoController.moveTodo);

export default router;
