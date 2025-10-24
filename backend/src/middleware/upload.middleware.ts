import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

// Erlaubte Dateitypen
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain',
];

// Max 10MB pro Datei
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Storage Configuration
const storage = multer.diskStorage({
  destination: async (req: Request & { user?: any }, file, cb) => {
    try {
      const username = req.user?.username || 'default';
      const folderId = req.body.folderId || '';
      
      // Base path für User
      const basePath = `/volume1/docker/AIO-Hub-Data/${username}`;
      
      let uploadPath = basePath;
      
      // Wenn folderId vorhanden, Ordnerpfad aus DB holen
      if (folderId && req.user?.schemaName) {
        try {
          const { prisma } = await import('../prisma/client');
          const folder: any = await prisma.$queryRawUnsafe(`
            SELECT path FROM "${req.user.schemaName}"."note_folders"
            WHERE id = '${folderId}' AND user_id = '${req.user.id}'
            LIMIT 1
          `);
          
          if (folder && folder.length > 0) {
            uploadPath = path.join(basePath, folder[0].path);
          } else {
            // Fallback: uploads Ordner
            uploadPath = path.join(basePath, 'uploads');
          }
        } catch (dbError) {
          console.error('DB query failed in upload middleware:', dbError);
          uploadPath = path.join(basePath, 'uploads');
        }
      } else {
        // Kein Ordner ausgewählt: uploads Ordner
        uploadPath = path.join(basePath, 'uploads');
      }
      
      // Ordner erstellen falls nicht vorhanden
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  
  filename: (req, file, cb) => {
    try {
      // UUID + Original Dateiname
      const uniqueId = uuidv4();
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
      
      cb(null, `${uniqueId}_${sanitizedName}${ext}`);
    } catch (error) {
      cb(error as Error, '');
    }
  }
});

// File Filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Dateityp nicht erlaubt: ${file.mimetype}`));
  }
};

// Multer Instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Error Handler für Multer
export const handleMulterError = (error: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return { status: 400, message: 'Datei zu groß (max 10MB)' };
      case 'LIMIT_FILE_COUNT':
        return { status: 400, message: 'Zu viele Dateien' };
      case 'LIMIT_UNEXPECTED_FILE':
        return { status: 400, message: 'Unerwartetes Datei-Feld' };
      default:
        return { status: 400, message: `Upload Fehler: ${error.message}` };
    }
  }
  
  if (error.message.includes('Dateityp nicht erlaubt')) {
    return { status: 400, message: error.message };
  }
  
  return { status: 500, message: 'Interner Server-Fehler beim Datei-Upload' };
};
