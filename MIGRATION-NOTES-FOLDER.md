# Migration: /notes Unterverzeichnis entfernen

## Problem

Bisher wurden alle Notizen unter `/volume1/docker/AIO-Hub-Data/{Benutzername}/notes/` gespeichert.

**Neu**: Alle Ordner und Dateien liegen direkt unter `/volume1/docker/AIO-Hub-Data/{Benutzername}/`

## Bestehende Daten migrieren

### Option 1: Verschieben (Empfohlen)

```bash
# SSH ins NAS
ssh nasadmin@dein-nas

# Alle Dateien aus /notes nach oben verschieben
cd /volume1/docker/AIO-Hub-Data/Sarkei
mv notes/* .
rmdir notes

# Oder für alle Benutzer:
for user in /volume1/docker/AIO-Hub-Data/*/; do
  if [ -d "$user/notes" ]; then
    echo "Migrating $user"
    cd "$user"
    mv notes/* . 2>/dev/null
    rmdir notes 2>/dev/null
  fi
done
```

### Option 2: Symlink (Temporär)

Falls du noch nicht verschieben willst:

```bash
# Erstelle Symlink von Root zu notes
cd /volume1/docker/AIO-Hub-Data/Sarkei
ln -s . notes

# Jetzt funktionieren beide Pfade:
# /volume1/docker/AIO-Hub-Data/Sarkei/Ordner1
# /volume1/docker/AIO-Hub-Data/Sarkei/notes/Ordner1
```

### Option 3: Neu starten

Wenn noch keine wichtigen Daten vorhanden:

```bash
# Altes notes-Verzeichnis löschen
rm -rf /volume1/docker/AIO-Hub-Data/Sarkei/notes

# Neue Ordner werden automatisch erstellt
```

## Datenbank anpassen

Nach der Migration musst du die Pfade in der Datenbank aktualisieren:

```sql
-- PostgreSQL Container
docker exec -it aiohub_db psql -U aiohub -d aiohub_main

-- Schema setzen
SET search_path TO user_sarkei_1760989676750;

-- OPTION 1: Alle Pfade anpassen (notes/ entfernen)
UPDATE note_folders 
SET path = REPLACE(path, 'notes/', '')
WHERE path LIKE 'notes/%';

-- OPTION 2: Alle DB-Einträge löschen und neu syncen lassen
DELETE FROM note_files;
DELETE FROM notes;
DELETE FROM note_folders;

-- Danach: Notizen-Seite neu laden → System scannt Dateisystem und erstellt Einträge
```

## Prüfen ob Migration erfolgreich

```bash
# 1. Ordnerstruktur prüfen
ls -la /volume1/docker/AIO-Hub-Data/Sarkei/

# Sollte zeigen:
# Ordner1/
# Ordner2/
# Projekt/
# etc.

# NICHT:
# notes/
#   Ordner1/
#   Ordner2/

# 2. Datenbank prüfen
docker exec -it aiohub_db psql -U aiohub -d aiohub_main
SET search_path TO user_sarkei_1760989676750;
SELECT path FROM note_folders;

# Sollte zeigen:
# Ordner1
# Ordner1/Unterordner
# Projekt

# NICHT:
# notes/Ordner1
# notes/Projekt
```

## Backup vor Migration

**Wichtig**: Erstelle Backup bevor du Daten verschiebst!

```bash
# Komplettes Backup
tar -czf ~/aiohub-backup-$(date +%Y%m%d).tar.gz /volume1/docker/AIO-Hub-Data/Sarkei/

# Nur notes-Ordner
tar -czf ~/aiohub-notes-backup-$(date +%Y%m%d).tar.gz /volume1/docker/AIO-Hub-Data/Sarkei/notes/
```

## Rollback

Falls etwas schiefgeht:

```bash
# 1. Backup wiederherstellen
tar -xzf ~/aiohub-backup-*.tar.gz -C /

# 2. Docker Container neu starten
docker-compose restart

# 3. Alte Version ausrollen (Git)
git checkout b38cd48  # Commit VOR der Migration
docker-compose build --no-cache
docker-compose up -d
```

## Nach Migration

1. ✅ Docker Container neu bauen:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. ✅ Browser-Cache leeren (Strg+Shift+R)

3. ✅ Notizen-Seite öffnen → Ordner sollten erscheinen

4. ✅ Test: Neuen Ordner erstellen → sollte in `/volume1/docker/AIO-Hub-Data/Sarkei/` landen

5. ✅ Test: Datei hochladen → sollte direkt unter Benutzername landen

## Häufige Probleme

### Problem: "Ordner nicht gefunden"

**Ursache**: Pfade in DB zeigen noch auf `notes/...`

**Lösung**:
```sql
UPDATE note_folders SET path = REPLACE(path, 'notes/', '');
UPDATE note_files SET file_path = REPLACE(file_path, '/notes/', '/');
```

### Problem: Doppelte Ordner

**Ursache**: Sowohl alte als auch neue Struktur vorhanden

**Lösung**:
```bash
# Alte Struktur entfernen
rm -rf /volume1/docker/AIO-Hub-Data/Sarkei/notes

# DB-Einträge neu syncen lassen
# (siehe Option 2 oben: DELETE FROM ...)
```

### Problem: Dateien nicht auffindbar

**Ursache**: file_path in DB zeigt auf alten Pfad

**Lösung**:
```sql
-- Prüfe aktuelle Pfade
SELECT id, filename, file_path FROM note_files LIMIT 5;

-- Wenn /notes/ enthalten, aktualisiere:
UPDATE note_files 
SET file_path = REPLACE(file_path, '/notes/', '/');
```

## Zusammenfassung

**Alt**:
```
/volume1/docker/AIO-Hub-Data/
  └── Sarkei/
      └── notes/
          ├── Ordner1/
          └── Ordner2/
```

**Neu**:
```
/volume1/docker/AIO-Hub-Data/
  └── Sarkei/
      ├── Ordner1/
      └── Ordner2/
```

**Vorteile**:
- ✅ Einfachere Struktur
- ✅ Direkter Zugriff auf Benutzer-Ordner
- ✅ Kompatibel mit WebDAV/SMB
- ✅ Weniger Verschachtelung

**Nächste Schritte**:
1. Backup erstellen
2. Daten verschieben (Option 1)
3. DB-Pfade anpassen
4. Docker neu bauen
5. Testen
