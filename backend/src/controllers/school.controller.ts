/**
 * School Controller
 * 
 * Verwaltet Schuljahre, Stundenplan, Schul-Todos, Notizen und Noten
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { FilesystemService } from '../services/filesystem.service';

export class SchoolController {
  // ============================================
  // SCHULJAHRE
  // ============================================

  /**
   * Alle Schuljahre abrufen
   */
  async getSchoolYears(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;

      const years: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."school_years"
        WHERE user_id = '${userId}'
        ORDER BY start_date DESC
      `);

      res.status(200).json({ schoolYears: years });
    } catch (error) {
      console.error('Get school years error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch school years'
      });
    }
  }

  /**
   * Aktives Schuljahr abrufen
   */
  async getActiveSchoolYear(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;

      const activeYear: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."school_years"
        WHERE user_id = '${userId}' AND is_active = true
        LIMIT 1
      `);

      if (!activeYear || activeYear.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'No active school year found'
        });
        return;
      }

      res.status(200).json({ schoolYear: activeYear[0] });
    } catch (error) {
      console.error('Get active school year error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch active school year'
      });
    }
  }

  /**
   * Schuljahr erstellen
   */
  async createSchoolYear(req: AuthRequest, res: Response): Promise<void> {
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
      const { name, startDate, endDate, isActive } = req.body;

      const id = uuidv4();

      // Wenn neues Jahr aktiv sein soll, deaktiviere alle anderen
      if (isActive) {
        await prisma.$queryRawUnsafe(`
          UPDATE "${schemaName}"."school_years"
          SET is_active = false
          WHERE user_id = '${userId}'
        `);
      }

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."school_years"
        (id, user_id, name, start_date, end_date, is_active, created_at, updated_at)
        VALUES (
          '${id}',
          '${userId}',
          '${name}',
          '${startDate}',
          '${endDate}',
          ${isActive || false},
          NOW(),
          NOW()
        )
      `);

      const schoolYear: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."school_years"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'School year created successfully',
        schoolYear: schoolYear[0]
      });
    } catch (error) {
      console.error('Create school year error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create school year'
      });
    }
  }

  /**
   * Schuljahr aktivieren/deaktivieren
   */
  async setActiveSchoolYear(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { id } = req.params;

      // Deaktiviere alle anderen
      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."school_years"
        SET is_active = false
        WHERE user_id = '${userId}'
      `);

      // Aktiviere das gewählte
      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."school_years"
        SET is_active = true, updated_at = NOW()
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      const schoolYear: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."school_years"
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'School year activated',
        schoolYear: schoolYear[0]
      });
    } catch (error) {
      console.error('Set active school year error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to set active school year'
      });
    }
  }

  // ============================================
  // STUNDENPLAN
  // ============================================

  /**
   * Stundenplan für aktives Schuljahr abrufen
   */
  async getTimetable(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { schoolYearId } = req.query;

      let query = `
        SELECT t.* FROM "${schemaName}"."timetable_entries" t
        INNER JOIN "${schemaName}"."school_years" y ON t.school_year_id = y.id
        WHERE y.user_id = '${userId}'
      `;

      if (schoolYearId) {
        query += ` AND t.school_year_id = '${schoolYearId}'`;
      } else {
        query += ` AND y.is_active = true`;
      }

      query += ` ORDER BY t.day_of_week, t.start_time`;

      const entries = await prisma.$queryRawUnsafe(query);

      res.status(200).json({ timetable: entries });
    } catch (error) {
      console.error('Get timetable error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch timetable'
      });
    }
  }

  /**
   * Stundenplan-Eintrag erstellen
   */
  async createTimetableEntry(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
        return;
      }

      const schemaName = req.user!.schemaName;
      const { schoolYearId, subject, teacher, room, dayOfWeek, startTime, endTime, color, notes } = req.body;

      const id = uuidv4();

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."timetable_entries"
        (id, school_year_id, subject, teacher, room, day_of_week, start_time, end_time, color, notes, created_at, updated_at)
        VALUES (
          '${id}',
          '${schoolYearId}',
          '${subject}',
          ${teacher ? `'${teacher}'` : 'NULL'},
          ${room ? `'${room}'` : 'NULL'},
          ${dayOfWeek},
          '${startTime}',
          '${endTime}',
          ${color ? `'${color}'` : 'NULL'},
          ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          NOW(),
          NOW()
        )
      `);

      const entry: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."timetable_entries"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'Timetable entry created successfully',
        entry: entry[0]
      });
    } catch (error) {
      console.error('Create timetable entry error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create timetable entry'
      });
    }
  }

  // ============================================
  // SCHUL-TODOS
  // ============================================

  /**
   * Alle Schul-Todos für aktives Schuljahr abrufen
   */
  async getSchoolTodos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { schoolYearId, status } = req.query;

      let query = `
        SELECT t.* FROM "${schemaName}"."school_todos" t
        INNER JOIN "${schemaName}"."school_years" y ON t.school_year_id = y.id
        WHERE y.user_id = '${userId}'
      `;

      if (schoolYearId) {
        query += ` AND t.school_year_id = '${schoolYearId}'`;
      } else {
        query += ` AND y.is_active = true`;
      }

      if (status) {
        query += ` AND t.status = '${status}'`;
      }

      query += ` ORDER BY t.due_date ASC NULLS LAST, t.priority DESC`;

      const todos = await prisma.$queryRawUnsafe(query);

      res.status(200).json({ todos });
    } catch (error) {
      console.error('Get school todos error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch school todos'
      });
    }
  }

  /**
   * Schul-Todo erstellen
   */
  async createSchoolTodo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
        return;
      }

      const schemaName = req.user!.schemaName;
      const { schoolYearId, subject, title, description, dueDate, priority } = req.body;

      const id = uuidv4();

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."school_todos"
        (id, school_year_id, subject, title, description, due_date, status, priority, created_at, updated_at)
        VALUES (
          '${id}',
          '${schoolYearId}',
          '${subject}',
          '${title}',
          ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'},
          ${dueDate ? `'${dueDate}'` : 'NULL'},
          'OPEN',
          ${priority || 1},
          NOW(),
          NOW()
        )
      `);

      const todo: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."school_todos"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'School todo created successfully',
        todo: todo[0]
      });
    } catch (error) {
      console.error('Create school todo error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create school todo'
      });
    }
  }

  /**
   * Schul-Todo Status aktualisieren
   */
  async updateSchoolTodoStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schemaName = req.user!.schemaName;
      const { id } = req.params;
      const { status } = req.body;

      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."school_todos"
        SET status = '${status}', updated_at = NOW()
        WHERE id = '${id}'
      `);

      const todo: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."school_todos"
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'Todo status updated',
        todo: todo[0]
      });
    } catch (error) {
      console.error('Update school todo status error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update todo status'
      });
    }
  }

  // ============================================
  // NOTIZEN
  // ============================================

  /**
   * Alle Notizen-Ordner abrufen
   */
  async getNoteFolders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const username = req.user!.username;
      const schemaName = req.user!.schemaName;

      // Synchronisiere Ordner vom Dateisystem
      await FilesystemService.syncFoldersFromFilesystem(userId, username, schemaName);

      const folders: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."note_folders"
        WHERE user_id = '${userId}'
        ORDER BY path
      `);

      res.status(200).json({ folders });
    } catch (error) {
      console.error('Get note folders error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch note folders'
      });
    }
  }

  /**
   * Notizen-Ordner erstellen (auch physisch auf Server)
   */
  async createNoteFolder(req: AuthRequest, res: Response): Promise<void> {
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
      const username = req.user!.username;
      const schemaName = req.user!.schemaName;
      const { name, parentId } = req.body;

      const id = uuidv4();
      
      // Pfad berechnen
      let folderPath = name;
      if (parentId) {
        const parent: any = await prisma.$queryRawUnsafe(`
          SELECT path FROM "${schemaName}"."note_folders"
          WHERE id = '${parentId}' AND user_id = '${userId}'
        `);
        if (parent && parent.length > 0) {
          folderPath = `${parent[0].path}/${name}`;
        }
      }

      // Physischen Ordner erstellen
      const physicalPath = path.join('/volume1/docker/AIO-Hub-Data', username, 'notes', folderPath);
      try {
        if (!fs.existsSync(physicalPath)) {
          fs.mkdirSync(physicalPath, { recursive: true });
          console.log('📁 Note folder created:', physicalPath);
        }
      } catch (fsError) {
        console.error('⚠️ Failed to create physical folder:', fsError);
      }

      // In DB speichern
      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."note_folders"
        (id, user_id, name, path, parent_id, created_at, updated_at)
        VALUES (
          '${id}',
          '${userId}',
          '${name}',
          '${folderPath}',
          ${parentId ? `'${parentId}'` : 'NULL'},
          NOW(),
          NOW()
        )
      `);

      const folder: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."note_folders"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'Note folder created successfully',
        folder: folder[0]
      });
    } catch (error) {
      console.error('Create note folder error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create note folder'
      });
    }
  }

  /**
   * Notizen abrufen
   */
  async getNotes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { folderId } = req.query;

      let query = `
        SELECT * FROM "${schemaName}"."notes"
        WHERE user_id = '${userId}'
      `;

      if (folderId) {
        query += ` AND folder_id = '${folderId}'`;
      } else {
        query += ` AND folder_id IS NULL`;
      }

      query += ` ORDER BY updated_at DESC`;

      const notes = await prisma.$queryRawUnsafe(query);

      res.status(200).json({ notes });
    } catch (error) {
      console.error('Get notes error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch notes'
      });
    }
  }

  /**
   * Notiz erstellen (optional mit physischer Datei)
   */
  async createNote(req: AuthRequest, res: Response): Promise<void> {
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
      const username = req.user!.username;
      const schemaName = req.user!.schemaName;
      const { folderId, title, content, tags } = req.body;

      const id = uuidv4();
      let filePath = null;

      // Optional: Physische Datei erstellen
      if (folderId) {
        const folder: any = await prisma.$queryRawUnsafe(`
          SELECT path FROM "${schemaName}"."note_folders"
          WHERE id = '${folderId}' AND user_id = '${userId}'
        `);
        
        if (folder && folder.length > 0) {
          const fileName = `${title.replace(/[^a-zA-Z0-9-_äöüÄÖÜß]/g, '_')}_${id}.md`;
          filePath = path.join(folder[0].path, fileName);
          const physicalPath = path.join('/volume1/docker/AIO-Hub-Data', username, 'notes', filePath);
          
          try {
            fs.writeFileSync(physicalPath, content, 'utf8');
            console.log('📄 Note file created:', physicalPath);
          } catch (fsError) {
            console.error('⚠️ Failed to create note file:', fsError);
            filePath = null;
          }
        }
      }

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."notes"
        (id, user_id, folder_id, title, content, file_path, tags, created_at, updated_at)
        VALUES (
          '${id}',
          '${userId}',
          ${folderId ? `'${folderId}'` : 'NULL'},
          '${title.replace(/'/g, "''")}',
          '${content.replace(/'/g, "''")}',
          ${filePath ? `'${filePath}'` : 'NULL'},
          ARRAY[${tags ? tags.map((t: string) => `'${t}'`).join(',') : ''}]::text[],
          NOW(),
          NOW()
        )
      `);

      const note: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."notes"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'Note created successfully',
        note: note[0]
      });
    } catch (error) {
      console.error('Create note error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create note'
      });
    }
  }

  // ============================================
  // NOTEN
  // ============================================

  /**
   * Noten für aktives Schuljahr abrufen
   */
  async getGrades(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { schoolYearId, subject } = req.query;

      let query = `
        SELECT g.* FROM "${schemaName}"."grades" g
        INNER JOIN "${schemaName}"."school_years" y ON g.school_year_id = y.id
        WHERE y.user_id = '${userId}'
      `;

      if (schoolYearId) {
        query += ` AND g.school_year_id = '${schoolYearId}'`;
      } else {
        query += ` AND y.is_active = true`;
      }

      if (subject) {
        query += ` AND g.subject = '${subject}'`;
      }

      query += ` ORDER BY g.date DESC`;

      const grades = await prisma.$queryRawUnsafe(query);

      res.status(200).json({ grades });
    } catch (error) {
      console.error('Get grades error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch grades'
      });
    }
  }

  /**
   * Note erstellen
   */
  async createGrade(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
        return;
      }

      const schemaName = req.user!.schemaName;
      const { schoolYearId, subject, title, grade, maxGrade, weight, date, notes } = req.body;

      const id = uuidv4();

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."grades"
        (id, school_year_id, subject, title, grade, max_grade, weight, date, notes, created_at, updated_at)
        VALUES (
          '${id}',
          '${schoolYearId}',
          '${subject}',
          '${title}',
          ${grade},
          ${maxGrade},
          ${weight || 1.0},
          '${date}',
          ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          NOW(),
          NOW()
        )
      `);

      const gradeEntry: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."grades"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'Grade created successfully',
        grade: gradeEntry[0]
      });
    } catch (error) {
      console.error('Create grade error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create grade'
      });
    }
  }

  // ============================================
  // DATEI-UPLOADS FÜR NOTIZEN
  // ============================================

  /**
   * Datei hochladen
   */
  async uploadFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'No file provided'
        });
        return;
      }

      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { noteId, folderId } = req.body;

      const id = uuidv4();
      const file = req.file;

      await prisma.$queryRawUnsafe(`
        INSERT INTO "${schemaName}"."note_files"
        (id, note_id, user_id, folder_id, filename, stored_name, file_path, file_type, file_size, created_at, updated_at)
        VALUES (
          '${id}',
          ${noteId ? `'${noteId}'` : 'NULL'},
          '${userId}',
          ${folderId ? `'${folderId}'` : 'NULL'},
          '${file.originalname.replace(/'/g, "''")}',
          '${file.filename}',
          '${file.path.replace(/\\/g, '\\\\')}',
          '${file.mimetype}',
          ${file.size},
          NOW(),
          NOW()
        )
      `);

      const uploadedFile: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."note_files"
        WHERE id = '${id}'
      `);

      res.status(201).json({
        message: 'File uploaded successfully',
        file: uploadedFile[0]
      });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to upload file'
      });
    }
  }

  /**
   * Alle Dateien eines Ordners abrufen
   */
  async getFiles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const username = req.user!.username;
      const schemaName = req.user!.schemaName;
      const { folderId, noteId } = req.query;

      // Synchronisiere Dateien vom Dateisystem
      await FilesystemService.syncFilesFromFilesystem(
        userId,
        username,
        schemaName,
        folderId as string | undefined
      );

      let query = `
        SELECT * FROM "${schemaName}"."note_files"
        WHERE user_id = '${userId}'
      `;

      if (folderId) {
        query += ` AND folder_id = '${folderId}'`;
      }

      if (noteId) {
        query += ` AND note_id = '${noteId}'`;
      }

      query += ` ORDER BY created_at DESC`;

      const files = await prisma.$queryRawUnsafe(query);

      res.status(200).json({ files });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch files'
      });
    }
  }

  /**
   * Datei herunterladen/anzeigen
   */
  async getFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { id } = req.params;

      const fileRecord: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."note_files"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!fileRecord || fileRecord.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'File not found'
        });
        return;
      }

      const file = fileRecord[0];

      // Prüfen ob Datei existiert
      if (!fs.existsSync(file.file_path)) {
        res.status(404).json({
          error: 'Not Found',
          message: 'File not found on disk'
        });
        return;
      }

      // Content-Type setzen
      res.setHeader('Content-Type', file.file_type);
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

      // Datei streamen
      const fileStream = fs.createReadStream(file.file_path);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve file'
      });
    }
  }

  /**
   * Datei-Annotationen speichern
   */
  async saveFileAnnotations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { id } = req.params;
      const { annotations } = req.body;

      const fileRecord: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."note_files"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!fileRecord || fileRecord.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'File not found'
        });
        return;
      }

      // Annotationen als JSON speichern
      const annotationsJson = JSON.stringify(annotations).replace(/'/g, "''");

      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."note_files"
        SET annotations = '${annotationsJson}'::jsonb,
            updated_at = NOW()
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'Annotations saved successfully'
      });
    } catch (error) {
      console.error('Save annotations error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to save annotations'
      });
    }
  }

  /**
   * Datei löschen
   */
  async deleteFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { id } = req.params;

      const fileRecord: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."note_files"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!fileRecord || fileRecord.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'File not found'
        });
        return;
      }

      const file = fileRecord[0];

      // Datei von Disk löschen
      if (fs.existsSync(file.file_path)) {
        fs.unlinkSync(file.file_path);
      }

      // DB Eintrag löschen
      await prisma.$queryRawUnsafe(`
        DELETE FROM "${schemaName}"."note_files"
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete file'
      });
    }
  }

  /**
   * Notiz aktualisieren
   */
  async updateNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { id } = req.params;
      const { title, content, tags } = req.body;

      const noteRecord: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."notes"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!noteRecord || noteRecord.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Note not found'
        });
        return;
      }

      const tagsArray = tags ? `ARRAY[${tags.map((t: string) => `'${t.replace(/'/g, "''")}'`).join(',')}]::text[]` : 'ARRAY[]::text[]';

      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."notes"
        SET title = '${title.replace(/'/g, "''")}',
            content = '${content.replace(/'/g, "''")}',
            tags = ${tagsArray},
            updated_at = NOW()
        WHERE id = '${id}'
      `);

      const note: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."notes"
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'Note updated successfully',
        note: note[0]
      });
    } catch (error) {
      console.error('Update note error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update note'
      });
    }
  }

  /**
   * Notiz löschen
   */
  async deleteNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { id } = req.params;

      const noteRecord: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."notes"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!noteRecord || noteRecord.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Note not found'
        });
        return;
      }

      await prisma.$queryRawUnsafe(`
        DELETE FROM "${schemaName}"."notes"
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'Note deleted successfully'
      });
    } catch (error) {
      console.error('Delete note error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete note'
      });
    }
  }

  /**
   * Datei-Inhalt aktualisieren (z.B. bearbeitetes Bild)
   */
  async updateFileContent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const schemaName = req.user!.schemaName;
      const { id } = req.params;
      const { dataUrl } = req.body; // Base64 Data URL

      if (!dataUrl) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'dataUrl is required'
        });
        return;
      }

      const fileRecord: any = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${schemaName}"."note_files"
        WHERE id = '${id}' AND user_id = '${userId}'
      `);

      if (!fileRecord || fileRecord.length === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'File not found'
        });
        return;
      }

      const file = fileRecord[0];

      // Extrahiere Base64-Daten
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid data URL format'
        });
        return;
      }

      const buffer = Buffer.from(matches[2], 'base64');

      // Schreibe Datei zurück ins Dateisystem
      fs.writeFileSync(file.file_path, buffer);

      // Aktualisiere Dateigröße in DB
      await prisma.$queryRawUnsafe(`
        UPDATE "${schemaName}"."note_files"
        SET file_size = ${buffer.length},
            updated_at = NOW()
        WHERE id = '${id}'
      `);

      res.status(200).json({
        message: 'File content updated successfully'
      });
    } catch (error) {
      console.error('Update file content error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update file content'
      });
    }
  }
}
