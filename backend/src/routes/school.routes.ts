import { Router } from 'express';
import { SchoolController } from '../controllers/school.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new SchoolController();

// School Years
router.get('/years', authenticate, controller.getSchoolYears.bind(controller));
router.get('/years/active', authenticate, controller.getActiveSchoolYear.bind(controller));
router.post('/years', authenticate, controller.createSchoolYear.bind(controller));
router.put('/years/:id/activate', authenticate, controller.setActiveSchoolYear.bind(controller));

// Timetable
router.get('/timetable', authenticate, controller.getTimetable.bind(controller));
router.post('/timetable', authenticate, controller.createTimetableEntry.bind(controller));

// School Todos
router.get('/todos', authenticate, controller.getSchoolTodos.bind(controller));
router.post('/todos', authenticate, controller.createSchoolTodo.bind(controller));
router.put('/todos/:id/status', authenticate, controller.updateSchoolTodoStatus.bind(controller));

// Notes & Folders
router.get('/notes/folders', authenticate, controller.getNoteFolders.bind(controller));
router.post('/notes/folders', authenticate, controller.createNoteFolder.bind(controller));
router.get('/notes', authenticate, controller.getNotes.bind(controller));
router.post('/notes', authenticate, controller.createNote.bind(controller));

// Grades
router.get('/grades', authenticate, controller.getGrades.bind(controller));
router.post('/grades', authenticate, controller.createGrade.bind(controller));

export default router;
