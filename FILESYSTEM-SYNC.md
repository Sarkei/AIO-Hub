# Dateisystem-Synchronisation für Notizen

## Übersicht

Das System synchronisiert automatisch zwischen dem physischen Dateisystem und der Datenbank für Notizen, Ordner und Dateien.

## Verzeichnisstruktur

```
/volume1/docker/AIO-Hub-Data/
└── {Benutzername}/           # z.B. "Sarkei"
    ├── Ordner1/
    │   ├── Unterordner1/
    │   │   └── dokument.pdf
    │   └── bild.jpg
    └── Ordner2/
        └── notiz.docx
```

**Wichtig**: Das `notes` Unterverzeichnis gibt es nicht mehr! Alle Ordner und Dateien liegen direkt unter `/volume1/docker/AIO-Hub-Data/{Benutzername}/`

## Automatische Synchronisation

### 1. Ordner-Synchronisation (Dateisystem → Datenbank)

**Wann**: Beim Laden der Ordnerliste (`GET /api/school/notes/folders`)

**Was passiert**:
- System scannt `/volume1/docker/AIO-Hub-Data/{username}/`
- Findet alle Ordner rekursiv
- Erstellt DB-Einträge für manuell erstellte Ordner
- Respektiert Ordner-Hierarchie (parent_id)

**Beispiel**:
```bash
# Auf deinem NAS:
mkdir -p /volume1/docker/AIO-Hub-Data/Sarkei/Projekte/2025

# In der Oberfläche:
# Nach dem Neuladen erscheinen automatisch:
# - Ordner "Projekte"
# - Unterordner "2025"
```

### 2. Datei-Synchronisation (Dateisystem → Datenbank)

**Wann**: Beim Laden der Dateiliste (`GET /api/school/notes/files`)

**Was passiert**:
- Scannt Dateien im angegebenen Ordner
- Unterstützte Formate: PDF, JPG, PNG, GIF, WebP, DOCX, DOC, TXT
- Erstellt DB-Einträge mit Metadaten (Größe, MIME-Type)

**Beispiel**:
```bash
# Auf deinem NAS:
cp /pfad/zur/datei.pdf /volume1/docker/AIO-Hub-Data/Sarkei/Projekte/

# In der Oberfläche:
# Nach dem Öffnen des Ordners "Projekte" erscheint "datei.pdf"
```

### 3. Bearbeitete Dateien zurückschreiben (Datenbank → Dateisystem)

**Wann**: Beim Speichern eines bearbeiteten Bildes im ImageEditor

**Was passiert**:
1. Annotationen werden als JSON in DB gespeichert
2. Bearbeitetes Bild wird als PNG zurück ins Dateisystem geschrieben
3. Datei-Metadaten (Größe) werden aktualisiert

**Endpoints**:
- `PUT /api/school/notes/files/:id/annotations` - Speichert Annotationen
- `PUT /api/school/notes/files/:id/content` - Speichert Bild-Inhalt

## Workflow-Szenarien

### Szenario 1: Manuell Ordner auf NAS erstellen

```bash
# 1. SSH ins NAS
ssh admin@dein-nas.local

# 2. Ordner erstellen
mkdir -p /volume1/docker/AIO-Hub-Data/Sarkei/Uni/Semester1

# 3. PDFs hochladen
cp ~/Downloads/vorlesung.pdf /volume1/docker/AIO-Hub-Data/Sarkei/Uni/Semester1/

# 4. In der Oberfläche:
# - Notizen-Seite öffnen/neu laden
# - Ordner "Uni" und "Semester1" erscheinen automatisch
# - PDF "vorlesung.pdf" ist sichtbar und bearbeitbar
```

### Szenario 2: Bild in Oberfläche bearbeiten

```
1. Bild in Ordner hochladen oder manuell ablegen
2. In Oberfläche auf Bild klicken
3. ImageEditor öffnet sich
4. Mit Tools zeichnen/annotieren
5. "Speichern" klicken
   ↓
   - Annotationen in DB gespeichert (als JSON)
   - Bearbeitetes Bild zurück ins Dateisystem geschrieben
   - Original wird überschrieben!
```

### Szenario 3: Word-Dokument hochladen und bearbeiten

```
1. DOCX-Datei auf NAS ablegen oder über UI hochladen
2. Datei erscheint in Notizen-Liste
3. Auf Datei klicken → Datei wird heruntergeladen
4. Lokal in Word bearbeiten
5. Zurück auf NAS hochladen (überschreibt Original)
6. Änderungen sofort sichtbar
```

## Technische Details

### Backend-Service: `FilesystemService`

**Methoden**:
- `syncFoldersFromFilesystem()` - Scannt Ordner rekursiv
- `syncFilesFromFilesystem()` - Scannt Dateien in Ordner
- `scanDirectory()` - Rekursive Ordner-Erkennung

**Sicherheit**:
- Nur Dateien mit erlaubten Extensions werden erkannt
- SQL-Injection-Schutz durch Escaping
- User-Isolation durch Schema-Trennung

### Frontend-Integration

**ImageEditor**:
```typescript
const handleSave = async () => {
  // 1. Annotationen speichern
  await axios.put(`/api/school/notes/files/${fileId}/annotations`, { annotations });
  
  // 2. Bild zurückschreiben
  const dataURL = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
  await axios.put(`/api/school/notes/files/${fileId}/content`, { dataUrl: dataURL });
};
```

**Notes Page**:
- Lädt automatisch beim Öffnen: `fetchData()`
- Synchronisiert Ordner und Dateien
- Zeigt physische und DB-Daten vereint an

## Wichtige Hinweise

### ⚠️ Datenverlust-Risiko

**Bearbeitete Bilder überschreiben Originale!**
- ImageEditor speichert als PNG
- Original-Format geht verloren (JPG → PNG)
- Keine automatische Versionierung

**Empfehlung**:
- Backups erstellen vor Bearbeitung
- Versionskontrolle für wichtige Dateien
- Oder: Kopie vor Bearbeitung anlegen

### 📝 Unterstützte Dateitypen

**Voll unterstützt (mit Viewer/Editor)**:
- PDF (mit Annotation-Overlay)
- JPG, PNG, GIF, WebP (mit ImageEditor)

**Erkannt (Download/Upload)**:
- DOCX, DOC, TXT

### 🔄 Synchronisations-Timing

**Automatisch**:
- Beim Laden der Ordnerliste
- Beim Laden der Dateiliste
- Beim Speichern von Änderungen

**Manuell**:
- Seite neu laden (F5)
- Ordner neu öffnen

### 🗂️ Ordner-Hierarchie

**Unterstützt**:
```
{Benutzername}/
  Projekt/
    Dokumentation/     ← 2 Ebenen tief
      Bilder/          ← 3 Ebenen tief
```

**Keine Limitierung der Tiefe!**

## Fehlerbehebung

### Problem: Ordner erscheinen nicht

**Lösung**:
1. Prüfe Pfad: `/volume1/docker/AIO-Hub-Data/{DEIN_USERNAME}/`
2. Prüfe Berechtigungen: `chmod -R 755`
3. Backend-Logs prüfen: `docker logs aiohub_backend`
4. Seite neu laden (F5)

### Problem: Dateien erscheinen nicht

**Lösung**:
1. Unterstütztes Format? (PDF, JPG, PNG, DOCX, etc.)
2. Datei im richtigen Ordner?
3. Ordner in DB vorhanden? (erst Ordner syncen)
4. Backend-Logs prüfen

### Problem: Bearbeitetes Bild nicht gespeichert

**Lösung**:
1. Browser-Konsole öffnen (F12)
2. Netzwerk-Tab prüfen: `PUT /api/school/notes/files/:id/content`
3. Response prüfen (200 = OK)
4. Backend-Logs: `docker logs -f aiohub_backend`

## SQL-Debugging

### Ordner in User-Schema prüfen

```sql
-- PostgreSQL Container
docker exec -it aiohub_db psql -U aiohub -d aiohub_main

-- Schema setzen
SET search_path TO user_sarkei_1760989676750;

-- Ordner anzeigen
SELECT id, name, path, parent_id FROM note_folders;

-- Dateien anzeigen
SELECT id, filename, file_path, file_type, file_size FROM note_files;
```

### Manuelle Ordner-Erstellung in DB

```sql
INSERT INTO note_folders (id, user_id, name, path, parent_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'deine-user-id',
  'Testordner',
  'Testordner',
  NULL,
  NOW(),
  NOW()
);
```

## Performance-Tipps

### Große Ordnerstrukturen

Bei > 1000 Dateien:
- Sync dauert länger
- Paginierung implementieren
- Lazy Loading nutzen

### Große Bilder

ImageEditor:
- Max. Auflösung: ~4K
- Große Bilder werden skaliert
- Export-Qualität einstellbar

## Nächste Schritte

**Empfohlene Erweiterungen**:
1. ✅ Versionierung für bearbeitete Dateien
2. ✅ Batch-Upload (mehrere Dateien gleichzeitig)
3. ✅ Ordner umbenennen/verschieben
4. ✅ Drag & Drop für Datei-Upload
5. ✅ Vorschau-Thumbnails für Bilder
6. ✅ Volltext-Suche in PDFs/DOCX
7. ✅ WebDAV-Integration für externe Zugriffe
8. ✅ Automatische Backup-Strategie

## Benutzer-Registrierung

Bei der Registrierung wird automatisch ein Benutzerordner erstellt:

```
/volume1/docker/AIO-Hub-Data/{Benutzername}/
```

Dieser Ordner wird bei der User-Erstellung im Backend angelegt (siehe `auth.controller.ts`).

**Was passiert bei Registrierung:**
1. User wird in DB angelegt
2. Eigenes Schema wird erstellt (`user_{username}_{timestamp}`)
3. Benutzerordner wird im Dateisystem erstellt
4. JWT-Token wird ausgestellt

**Beispiel:**
- User `MaxMuster` registriert sich
- Ordner `/volume1/docker/AIO-Hub-Data/MaxMuster/` wird erstellt
- Alle Notizen/Dateien landen in diesem Ordner
