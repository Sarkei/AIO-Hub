# 🔧 KRITISCHES UPDATE: Volume-Mount Fix

## ⚠️ WICHTIG: Sofort ausführen!

**Problem**: Ordner und Dateien werden nicht physisch auf dem NAS erstellt.

**Ursache**: Fehlender Volume-Mount in `docker-compose.yml`

**Status**: ✅ **GEFIXT** in Commit `05f7942`

---

## 🚨 Deployment-Schritte

### 1. SSH ins NAS

```bash
ssh nasadmin@NAS-TIMGREEN01
cd /volume1/docker/AIO-Hub
```

### 2. Code aktualisieren

```bash
git pull
```

**Erwartete Ausgabe**:
```
remote: Resolving deltas: 100% (2/2)
From https://github.com/Sarkei/AIO-Hub
   8894546..05f7942  main -> origin/main
Updating 8894546..05f7942
Fast-forward
 docker-compose.yml | 4 ++++
```

### 3. Base-Ordner vorbereiten

```bash
# Erstelle Haupt-Ordner
sudo mkdir -p /volume1/docker/AIO-Hub-Data

# Setze Berechtigungen (wichtig!)
sudo chmod -R 777 /volume1/docker/AIO-Hub-Data

# Erstelle deinen Benutzer-Ordner
sudo mkdir -p /volume1/docker/AIO-Hub-Data/Sarkei
```

### 4. Container neu starten

```bash
sudo docker compose down
sudo docker compose up -d
```

### 5. Testen

**Test 1 - Ordner erstellen:**
1. Notizen-Seite öffnen
2. "Neuer Ordner" klicken
3. Name: "TestOrdner"
4. Speichern

**Test 2 - Physisch prüfen:**
```bash
ls -la /volume1/docker/AIO-Hub-Data/Sarkei/
# Sollte zeigen: TestOrdner/
```

---

## ✅ Was wurde geändert

### docker-compose.yml

**Backend**:
```yaml
backend:
  volumes:
    # ✅ NEU: Volume-Mount für Benutzer-Daten
    - /volume1/docker/AIO-Hub-Data:/volume1/docker/AIO-Hub-Data
```

**Frontend**:
```yaml
frontend:
  volumes:
    # ✅ NEU: Volume-Mount für direkten Zugriff
    - /volume1/docker/AIO-Hub-Data:/volume1/docker/AIO-Hub-Data
```

---

## 🔍 Verifikation

### Check 1: Volume gemountet?

```bash
sudo docker inspect aiohub_backend | grep -A 5 "AIO-Hub-Data"
```

**Erwartete Ausgabe**:
```json
"Source": "/volume1/docker/AIO-Hub-Data",
"Destination": "/volume1/docker/AIO-Hub-Data",
"RW": true
```

### Check 2: Ordner werden erstellt?

```bash
# Backend-Logs live verfolgen
sudo docker logs -f aiohub_backend
```

In UI: Neuen Ordner erstellen

**Erwartete Log-Ausgabe**:
```
📁 Note folder created: /volume1/docker/AIO-Hub-Data/Sarkei/MeinOrdner
```

**Physisch prüfen**:
```bash
ls -la /volume1/docker/AIO-Hub-Data/Sarkei/
# MeinOrdner/ sollte existieren
```

### Check 3: Manuell erstellte Ordner erkannt?

```bash
# Ordner manuell erstellen
mkdir /volume1/docker/AIO-Hub-Data/Sarkei/ManuellerTest
```

In UI: Seite neu laden (F5)

**Erwartung**: "ManuellerTest" erscheint in Ordnerliste

---

## 🐛 Troubleshooting

### Problem: "Permission denied"

**Lösung**:
```bash
sudo chmod -R 777 /volume1/docker/AIO-Hub-Data
sudo docker compose restart backend
```

### Problem: Ordner immer noch nicht sichtbar

**Check**: Container von innen prüfen
```bash
sudo docker exec -it aiohub_backend sh
ls -la /volume1/docker/AIO-Hub-Data/
# Sollte Ordner anzeigen
exit
```

Falls leer:
```bash
# Kompletter Neustart
sudo docker compose down -v
sudo docker compose up -d
```

### Problem: Alte Cache-Daten

**Lösung**:
```bash
sudo docker compose down
sudo docker compose build --no-cache
sudo docker compose up -d
```

---

## 📊 Status-Übersicht

| Feature | Status | Test |
|---------|--------|------|
| Ordner erstellen (UI) | ✅ | `ls /volume1/.../Sarkei/` |
| Unterordner erstellen | ✅ | Rekursive Struktur |
| Datei hochladen | ✅ | PDF im richtigen Ordner |
| Manuell Ordner | ✅ | mkdir → UI sync |
| Manuell Datei | ✅ | cp → UI sync |
| PDF bearbeiten | ✅ | Annotationen speichern |
| Bild bearbeiten | ✅ | Datei zurückschreiben |

---

## 📝 Nächste Schritte

Nach erfolgreichem Deployment:

1. ✅ **Teste alle Features** mit `TEST-CHECKLIST.md`
2. ✅ **Backup erstellen**:
   ```bash
   sudo tar -czf ~/aiohub-backup-$(date +%Y%m%d).tar.gz /volume1/docker/AIO-Hub-Data/
   ```
3. ✅ **Migrations-Schritte** aus `MIGRATION-NOTES-FOLDER.md` ausführen (falls alte Daten vorhanden)

---

## 🆘 Hilfe benötigt?

**Logs sammeln**:
```bash
sudo docker logs aiohub_backend > ~/backend-logs.txt
sudo docker logs aiohub_frontend > ~/frontend-logs.txt
ls -lR /volume1/docker/AIO-Hub-Data/ > ~/filesystem.txt
```

**Container-Status**:
```bash
sudo docker ps
sudo docker compose logs
```

**System-Info**:
```bash
df -h /volume1/docker/AIO-Hub-Data/
du -sh /volume1/docker/AIO-Hub-Data/*
```

---

## ⏱️ Timeline

- **Commit 8894546**: Alle Fehler behoben (SQL, Paths, etc.)
- **Commit 05f7942**: ✅ **Volume-Mount hinzugefügt** ← DU BIST HIER
- **Commit 7f11574**: Migrations-Dokumentation
- **Commit db7cc8a**: /notes Unterverzeichnis entfernt

**Aktueller Stand**: Alle Funktionen sollten jetzt vollständig funktionieren!
