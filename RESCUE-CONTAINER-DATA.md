# 🆘 Daten aus Container retten

## Problem

Ordner wurden **im Container** erstellt, aber nicht physisch auf dem NAS, weil der Volume-Mount fehlte.

## Wo sind die Daten?

Die Ordner existieren **innerhalb des Container-Filesystems** auf einer temporären Layer-Ebene.

---

## 🔧 Schritt 1: Container prüfen

### Option A: Container läuft noch

```bash
# SSH ins NAS
ssh nasadmin@NAS-TIMGREEN01

# In den Container einsteigen
sudo docker exec -it aiohub_backend sh

# Ordner auflisten
ls -la /volume1/docker/AIO-Hub-Data/Sarkei/

# Wenn Ordner sichtbar sind:
ls -R /volume1/docker/AIO-Hub-Data/Sarkei/
```

**Falls Ordner sichtbar sind** → Weiter zu Schritt 2: Daten kopieren

### Option B: Container wurde gestoppt

```bash
# Container-ID finden (auch gestoppte)
sudo docker ps -a | grep aiohub_backend

# Container starten (falls gestoppt)
sudo docker start aiohub_backend

# In Container einsteigen
sudo docker exec -it aiohub_backend sh
ls -la /volume1/docker/AIO-Hub-Data/Sarkei/
exit
```

---

## 📦 Schritt 2: Daten aus Container kopieren

### Option A: Mit docker cp (Empfohlen)

```bash
# Kompletten Benutzer-Ordner kopieren
sudo docker cp aiohub_backend:/volume1/docker/AIO-Hub-Data/Sarkei /tmp/sarkei-backup

# Prüfen
ls -R /tmp/sarkei-backup/

# Auf richtigen Ort verschieben
sudo mkdir -p /volume1/docker/AIO-Hub-Data
sudo mv /tmp/sarkei-backup /volume1/docker/AIO-Hub-Data/Sarkei

# Berechtigungen setzen
sudo chmod -R 777 /volume1/docker/AIO-Hub-Data/Sarkei
```

### Option B: Einzelne Ordner kopieren

```bash
# Wenn du nur bestimmte Ordner retten willst
sudo docker cp aiohub_backend:/volume1/docker/AIO-Hub-Data/Sarkei/IT-Technik /tmp/
sudo docker cp aiohub_backend:/volume1/docker/AIO-Hub-Data/Sarkei/Projekte /tmp/

# Struktur neu aufbauen
sudo mkdir -p /volume1/docker/AIO-Hub-Data/Sarkei
sudo mv /tmp/IT-Technik /volume1/docker/AIO-Hub-Data/Sarkei/
sudo mv /tmp/Projekte /volume1/docker/AIO-Hub-Data/Sarkei/
```

### Option C: Container-Commit (falls A/B nicht funktionieren)

```bash
# Container als Image speichern
sudo docker commit aiohub_backend aiohub_backend_backup

# Neuen Container mit gemounteten Volumes starten
sudo docker run --rm -v /volume1/docker/AIO-Hub-Data:/volume1/docker/AIO-Hub-Data \
  aiohub_backend_backup \
  cp -r /volume1/docker/AIO-Hub-Data/Sarkei /backup/

# Image löschen
sudo docker rmi aiohub_backend_backup
```

---

## 🗃️ Schritt 3: Datenbank-Einträge prüfen

Die Ordner-Informationen sind auch in der Datenbank gespeichert:

```bash
# PostgreSQL Container
sudo docker exec -it aiohub_db psql -U aiohub -d aiohub_main

# In deinem Schema
SET search_path TO user_sarkei_1760989676750;

-- Alle erstellten Ordner anzeigen
SELECT id, name, path, created_at FROM note_folders ORDER BY path;

-- Alle hochgeladenen Dateien
SELECT id, filename, file_path FROM note_files;

-- Notizen
SELECT id, title FROM notes;
```

**Wichtig**: Diese DB-Einträge bleiben erhalten! Nach dem Fix werden die Ordner neu erstellt basierend auf diesen Einträgen.

---

## 🔄 Schritt 4: System mit Volume-Mount neu starten

Nachdem du die Daten gerettet hast:

```bash
# 1. Container stoppen
sudo docker compose down

# 2. Prüfe dass Daten auf Host vorhanden
ls -R /volume1/docker/AIO-Hub-Data/Sarkei/

# 3. Code mit Fix aktualisieren
cd /volume1/docker/AIO-Hub
git pull

# 4. Container mit Volume-Mount neu starten
sudo docker compose up -d

# 5. Logs prüfen
sudo docker logs -f aiohub_backend
```

---

## ✅ Verifikation

### Check 1: Daten auf Host

```bash
ls -la /volume1/docker/AIO-Hub-Data/Sarkei/
```

**Erwartung**: Alle geretteten Ordner sichtbar

### Check 2: Daten im Container

```bash
sudo docker exec -it aiohub_backend sh
ls -la /volume1/docker/AIO-Hub-Data/Sarkei/
exit
```

**Erwartung**: Gleiche Ordner wie auf Host (wegen Volume-Mount)

### Check 3: UI

1. Notizen-Seite öffnen
2. F5 (neu laden)
3. **Erwartung**: Alle Ordner erscheinen in Liste

### Check 4: Datenbank-Sync

Die Ordner sollten mit der Datenbank synchronisiert sein:

```sql
-- In PostgreSQL
SELECT path FROM note_folders;

-- Sollte matchen mit:
ls /volume1/docker/AIO-Hub-Data/Sarkei/
```

---

## 🆘 Problembehandlung

### Problem: "docker cp" funktioniert nicht

**Fehler**: `Error: No such container:path`

**Ursache**: Container existiert nicht oder Pfad falsch

**Lösung 1**: Container-ID direkt verwenden
```bash
# Finde Container-ID
CONTAINER_ID=$(sudo docker ps -a | grep aiohub_backend | awk '{print $1}')
echo $CONTAINER_ID

# Mit ID kopieren
sudo docker cp $CONTAINER_ID:/volume1/docker/AIO-Hub-Data/Sarkei /tmp/
```

**Lösung 2**: Container neu starten
```bash
sudo docker start aiohub_backend
sudo docker exec -it aiohub_backend ls /volume1/docker/AIO-Hub-Data/Sarkei/
```

### Problem: Ordner sind leer im Container

**Ursache 1**: Daten wurden nur in DB geschrieben, aber Ordner-Erstellung schlug fehl

**Check**:
```bash
sudo docker exec -it aiohub_backend sh
cd /volume1/docker/AIO-Hub-Data
find . -type d  # Zeigt alle Ordner
exit
```

**Ursache 2**: Ordner wurden gelöscht beim Container-Neustart

**Lösung**: Daten aus Backup wiederherstellen oder neu erstellen basierend auf DB-Einträgen

### Problem: Berechtigungen verweigert

```bash
# Alle Rechte setzen (temporär)
sudo chmod -R 777 /volume1/docker/AIO-Hub-Data/

# Besitzer ändern (dauerhaft)
sudo chown -R 1000:1000 /volume1/docker/AIO-Hub-Data/
sudo chmod -R 755 /volume1/docker/AIO-Hub-Data/
```

---

## 📊 Daten-Inventar

### Was ist wo gespeichert?

| Datentyp | Container | Host | Datenbank |
|----------|-----------|------|-----------|
| Ordner-Struktur | ❌ (war) | ❌ (war) | ✅ (note_folders) |
| Ordner physisch | ❌ (war) | ❌ (wird erstellt) | - |
| Hochgeladene Dateien | ❌ (war) | ❌ (wird erstellt) | ✅ (note_files) |
| Notiz-Inhalte | - | - | ✅ (notes.content) |
| Annotationen | - | - | ✅ (note_files.annotations) |

**Nach Fix**:
| Datentyp | Container | Host | Datenbank |
|----------|-----------|------|-----------|
| Ordner-Struktur | ✅ (gemountet) | ✅ | ✅ |
| Ordner physisch | ✅ (gemountet) | ✅ | - |
| Hochgeladene Dateien | ✅ (gemountet) | ✅ | ✅ |

---

## 🔄 Alternative: Neu-Synchronisation

Falls Daten-Rettung zu kompliziert:

### Option: Ordner neu erstellen basierend auf DB

```bash
# PostgreSQL
sudo docker exec -it aiohub_db psql -U aiohub -d aiohub_main

SET search_path TO user_sarkei_1760989676750;

-- Alle Ordner-Pfade exportieren
\copy (SELECT path FROM note_folders ORDER BY path) TO '/tmp/folders.txt'
```

```bash
# Auf NAS
sudo docker cp aiohub_db:/tmp/folders.txt /tmp/

# Ordner neu erstellen
while read folder; do
  sudo mkdir -p "/volume1/docker/AIO-Hub-Data/Sarkei/$folder"
done < /tmp/folders.txt

# Berechtigungen
sudo chmod -R 777 /volume1/docker/AIO-Hub-Data/Sarkei/
```

---

## 💾 Backup erstellen

**VOR jeder Aktion**:

```bash
# Container-Backup
sudo docker commit aiohub_backend aiohub_backend_backup_$(date +%Y%m%d)

# DB-Backup
sudo docker exec aiohub_db pg_dump -U aiohub aiohub_main > ~/aiohub_db_backup_$(date +%Y%m%d).sql

# Prüfe Backups
sudo docker images | grep aiohub_backend_backup
ls -lh ~/aiohub_db_backup_*.sql
```

**Restore falls nötig**:
```bash
# Container
sudo docker tag aiohub_backend_backup_20251024 aiohub_backend:latest

# Datenbank
sudo docker exec -i aiohub_db psql -U aiohub aiohub_main < ~/aiohub_db_backup_*.sql
```

---

## 📝 Zusammenfassung

1. ✅ **Daten retten**: `docker cp` aus Container
2. ✅ **Auf Host ablegen**: `/volume1/docker/AIO-Hub-Data/Sarkei/`
3. ✅ **Code aktualisieren**: `git pull`
4. ✅ **Container neu starten**: `docker compose up -d`
5. ✅ **Verifikation**: Host = Container = UI

**Wichtig**: Nach dem Fix werden neue Ordner **automatisch physisch** erstellt! 🎉
