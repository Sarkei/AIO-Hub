/**
 * Filesystem Service
 * 
 * Synchronisiert Dateisystem mit Datenbank für Notizen
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma/client';

export class FilesystemService {
  /**
   * Synchronisiert Ordner vom Dateisystem zur Datenbank
   * Scannt ALLE Ordner auf der Festplatte und erstellt DB-Einträge falls nötig
   */
  static async syncFoldersFromFilesystem(
    userId: string,
    username: string,
    schemaName: string
  ): Promise<void> {
    const basePath = path.join('/volume1/docker/AIO-Hub-Data', username);
    
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
      return;
    }

    // Hole alle DB-Ordner
    const dbFolders: any = await prisma.$queryRawUnsafe(`
      SELECT * FROM "${schemaName}"."note_folders"
      WHERE user_id = '${userId}'
    `);

    const dbFolderPaths = new Set<string>(dbFolders.map((f: any) => f.path as string));

    // Lösche DB-Einträge für Ordner, die nicht mehr auf der Festplatte existieren
    for (const folder of dbFolders) {
      const folderFullPath = path.join(basePath, folder.path);
      if (!fs.existsSync(folderFullPath)) {
        console.log(`🗑️ Deleting folder from DB (not on filesystem): ${folder.path}`);
        await prisma.$queryRawUnsafe(`
          DELETE FROM "${schemaName}"."note_folders"
          WHERE id = '${folder.id}'
        `);
        dbFolderPaths.delete(folder.path);
      }
    }

    // Scanne Dateisystem rekursiv und erstelle fehlende DB-Einträge
    await this.scanDirectory(basePath, '', userId, schemaName, dbFolderPaths);
  }

  /**
   * Scannt Verzeichnis rekursiv und erstellt DB-Einträge
   */
  private static async scanDirectory(
    basePath: string,
    relativePath: string,
    userId: string,
    schemaName: string,
    existingPaths: Set<string>
  ): Promise<void> {
    const fullPath = path.join(basePath, relativePath);
    
    if (!fs.existsSync(fullPath)) return;

    const items = fs.readdirSync(fullPath, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        const folderPath = relativePath ? `${relativePath}/${item.name}` : item.name;
        
        // Wenn Ordner nicht in DB existiert, erstelle Eintrag
        if (!existingPaths.has(folderPath)) {
          console.log(`📁 Syncing folder from filesystem: ${folderPath}`);
          
          const id = uuidv4();
          const parentPath = relativePath || null;
          let parentId = null;

          // Finde Parent-ID wenn vorhanden
          if (parentPath) {
            const parent: any = await prisma.$queryRawUnsafe(`
              SELECT id FROM "${schemaName}"."note_folders"
              WHERE user_id = '${userId}' AND path = '${parentPath}'
              LIMIT 1
            `);
            if (parent && parent.length > 0) {
              parentId = parent[0].id;
            }
          }

          // Erstelle DB-Eintrag
          await prisma.$queryRawUnsafe(`
            INSERT INTO "${schemaName}"."note_folders"
            (id, user_id, name, path, parent_id, created_at, updated_at)
            VALUES (
              '${id}',
              '${userId}',
              '${item.name.replace(/'/g, "''")}',
              '${folderPath.replace(/'/g, "''")}',
              ${parentId ? `'${parentId}'` : 'NULL'},
              NOW(),
              NOW()
            )
          `);

          existingPaths.add(folderPath);
        }

        // Rekursiv in Unterordner
        await this.scanDirectory(basePath, folderPath, userId, schemaName, existingPaths);
      }
    }
  }

  /**
   * Synchronisiert Dateien vom Dateisystem zur Datenbank
   * Löscht DB-Einträge für Dateien, die nicht mehr existieren
   * Erstellt DB-Einträge für neue Dateien
   */
  static async syncFilesFromFilesystem(
    userId: string,
    username: string,
    schemaName: string,
    folderId?: string
  ): Promise<void> {
    const basePath = path.join('/volume1/docker/AIO-Hub-Data', username);
    
    if (!fs.existsSync(basePath)) {
      return;
    }

    // Hole Ordner-Info wenn folderId gegeben
    let folderPath = '';
    if (folderId) {
      const folder: any = await prisma.$queryRawUnsafe(`
        SELECT path FROM "${schemaName}"."note_folders"
        WHERE id = '${folderId}' AND user_id = '${userId}'
        LIMIT 1
      `);
      if (folder && folder.length > 0) {
        folderPath = folder[0].path;
      }
    }

    const scanPath = folderPath ? path.join(basePath, folderPath) : basePath;
    
    if (!fs.existsSync(scanPath)) {
      return;
    }

    // Hole alle DB-Dateien für diesen Ordner
    const dbFiles: any = await prisma.$queryRawUnsafe(`
      SELECT id, stored_name, file_path FROM "${schemaName}"."note_files"
      WHERE user_id = '${userId}'
      ${folderId ? `AND folder_id = '${folderId}'` : 'AND folder_id IS NULL'}
    `);

    // Lösche DB-Einträge für Dateien, die nicht mehr existieren
    for (const dbFile of dbFiles) {
      if (!fs.existsSync(dbFile.file_path)) {
        console.log(`🗑️ Deleting file from DB (not on filesystem): ${dbFile.stored_name}`);
        await prisma.$queryRawUnsafe(`
          DELETE FROM "${schemaName}"."note_files"
          WHERE id = '${dbFile.id}'
        `);
      }
    }

    const dbFileNames = new Set(dbFiles.map((f: any) => f.stored_name));

    // Scanne Dateien im Ordner
    const items = fs.readdirSync(scanPath, { withFileTypes: true });

    for (const item of items) {
      if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        const supportedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.docx', '.doc', '.txt'];
        
        if (!supportedExts.includes(ext)) continue;
        if (dbFileNames.has(item.name)) continue;

        console.log(`📄 Syncing file from filesystem: ${item.name}`);

        const id = uuidv4();
        const filePath = path.join(scanPath, item.name);
        const stats = fs.statSync(filePath);
        
        // Bestimme MIME-Type
        let mimeType = 'application/octet-stream';
        if (ext === '.pdf') mimeType = 'application/pdf';
        else if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
        else if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (ext === '.doc') mimeType = 'application/msword';
        else if (ext === '.txt') mimeType = 'text/plain';

        // Erstelle DB-Eintrag
        await prisma.$queryRawUnsafe(`
          INSERT INTO "${schemaName}"."note_files"
          (id, user_id, folder_id, filename, stored_name, file_path, file_type, file_size, created_at, updated_at)
          VALUES (
            '${id}',
            '${userId}',
            ${folderId ? `'${folderId}'` : 'NULL'},
            '${item.name.replace(/'/g, "''")}',
            '${item.name.replace(/'/g, "''")}',
            '${filePath.replace(/\\/g, '\\\\').replace(/'/g, "''")}',
            '${mimeType}',
            ${stats.size},
            NOW(),
            NOW()
          )
        `);
      }
    }
  }

  /**
   * Synchronisiert Markdown-Notizen vom Dateisystem zur Datenbank
   * Löscht DB-Einträge für Notizen, die nicht mehr existieren
   * Erstellt DB-Einträge für neue Markdown-Dateien
   */
  static async syncNotesFromFilesystem(
    userId: string,
    username: string,
    schemaName: string,
    folderId?: string
  ): Promise<void> {
    const basePath = path.join('/volume1/docker/AIO-Hub-Data', username);
    
    if (!fs.existsSync(basePath)) {
      return;
    }

    // Hole Ordner-Info wenn folderId gegeben
    let folderPath = '';
    if (folderId) {
      const folder: any = await prisma.$queryRawUnsafe(`
        SELECT path FROM "${schemaName}"."note_folders"
        WHERE id = '${folderId}' AND user_id = '${userId}'
        LIMIT 1
      `);
      if (folder && folder.length > 0) {
        folderPath = folder[0].path;
      }
    }

    const scanPath = folderPath ? path.join(basePath, folderPath) : basePath;
    
    if (!fs.existsSync(scanPath)) {
      return;
    }

    // Hole alle DB-Notizen für diesen Ordner
    const dbNotes: any = await prisma.$queryRawUnsafe(`
      SELECT id, title FROM "${schemaName}"."notes"
      WHERE user_id = '${userId}'
      ${folderId ? `AND folder_id = '${folderId}'` : 'AND folder_id IS NULL'}
    `);

    // Lösche DB-Einträge für Notizen, deren Markdown-Dateien nicht mehr existieren
    for (const dbNote of dbNotes) {
      const expectedFileName = `${dbNote.title.replace(/[^a-zA-Z0-9-_äöüÄÖÜß\s]/g, '_')}.md`;
      const expectedPath = path.join(scanPath, expectedFileName);
      
      if (!fs.existsSync(expectedPath)) {
        console.log(`🗑️ Deleting note from DB (markdown file not on filesystem): ${dbNote.title}`);
        await prisma.$queryRawUnsafe(`
          DELETE FROM "${schemaName}"."notes"
          WHERE id = '${dbNote.id}'
        `);
      }
    }

    const dbNoteTitles = new Set(dbNotes.map((n: any) => n.title));

    // Scanne Markdown-Dateien im Ordner (nur auf oberster Ebene, nicht rekursiv)
    const items = fs.readdirSync(scanPath, { withFileTypes: true });

    for (const item of items) {
      if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        
        // Nur Markdown-Dateien
        if (ext !== '.md' && ext !== '.markdown') continue;
        
        const titleWithoutExt = path.basename(item.name, ext);
        
        // Überspringe Dateien die bereits als Notizen in der DB sind
        if (dbNoteTitles.has(titleWithoutExt)) continue;

        console.log(`📝 Syncing markdown note from filesystem: ${item.name}`);

        const id = uuidv4();
        const filePath = path.join(scanPath, item.name);
        
        // Lese Dateiinhalt
        let content = '';
        try {
          content = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
          console.error(`Failed to read markdown file ${filePath}:`, error);
          continue;
        }

        // Erstelle Notiz-Eintrag in DB
        await prisma.$queryRawUnsafe(`
          INSERT INTO "${schemaName}"."notes"
          (id, user_id, folder_id, title, content, tags, created_at, updated_at)
          VALUES (
            '${id}',
            '${userId}',
            ${folderId ? `'${folderId}'` : 'NULL'},
            '${titleWithoutExt.replace(/'/g, "''")}',
            '${content.replace(/'/g, "''")}',
            ARRAY[]::text[],
            NOW(),
            NOW()
          )
        `);
      }
    }
  }

  /**
   * Synchronisiert alle Notizen rekursiv in allen Ordnern
   */
  static async syncAllNotesRecursively(
    userId: string,
    username: string,
    schemaName: string
  ): Promise<void> {
    // Synchronisiere erst alle Ordner
    await this.syncFoldersFromFilesystem(userId, username, schemaName);

    // Hole alle Ordner aus DB
    const folders: any = await prisma.$queryRawUnsafe(`
      SELECT id, path FROM "${schemaName}"."note_folders"
      WHERE user_id = '${userId}'
      ORDER BY path
    `);

    // Synchronisiere Notizen in jedem Ordner
    for (const folder of folders) {
      await this.syncNotesFromFilesystem(userId, username, schemaName, folder.id);
    }

    // Synchronisiere auch Notizen im Root-Verzeichnis
    await this.syncNotesFromFilesystem(userId, username, schemaName);
  }
}
