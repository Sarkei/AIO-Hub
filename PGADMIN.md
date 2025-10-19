# 📊 pgAdmin Setup & Nutzung

## Was ist pgAdmin?

**pgAdmin 4** ist ein Web-basiertes Datenbank-Management-Tool für PostgreSQL. Du kannst damit:
- 🔍 Datenbank-Strukturen visualisieren (Schemas, Tabellen, Indizes)
- ✏️ SQL-Queries direkt ausführen
- 📊 Daten in Tabellen anzeigen & bearbeiten
- 🔧 Datenbank-Performance überwachen
- 💾 Backups erstellen & wiederherstellen

---

## 🚀 Zugriff auf pgAdmin

Nach `docker-compose up -d`:

1. **Browser öffnen:** `http://<deine-nas-ip>:5050`
2. **Login:**
   - **E-Mail:** `admin@aiohub.local` (aus `.env`)
   - **Passwort:** `admin123` (aus `.env`)

---

## 🔐 Erster Zugriff auf die Datenbank

### 1. Server ist bereits konfiguriert
- Links im Menü: **"Servers"** → **"AIO Hub PostgreSQL"**
- Beim ersten Klick wirst du nach einem Passwort gefragt

### 2. Passwort eingeben
- **Passwort:** Dein `POSTGRES_PASSWORD` aus der `.env` Datei
- ✅ **"Save Password"** aktivieren (optional)
- Klick **"OK"**

### 3. Datenbank erkunden
Nach dem Login siehst du:
```
AIO Hub PostgreSQL
└── Databases (2)
    ├── aiohub_db          # Haupt-Datenbank
    │   ├── Schemas
    │   │   ├── public     # User-Tabelle
    │   │   ├── user_john_123456  # User-Schema (Beispiel)
    │   │   └── user_jane_789012  # User-Schema (Beispiel)
    └── postgres           # System-DB
```

---

## 📋 Häufige Aufgaben

### 1. Tabellen anzeigen

**Schemas → public → Tables → users → View/Edit Data**

Rechtsklick auf Tabelle → **"View/Edit Data"** → **"All Rows"**

### 2. SQL Query ausführen

**Tools → Query Tool** (oder `ALT+SHIFT+Q`)

Beispiel-Queries:

```sql
-- Alle User anzeigen
SELECT id, email, username, created_at FROM public.users;

-- Alle Schemas anzeigen
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name LIKE 'user_%';

-- Todos eines Users anzeigen (ersetze schema_name)
SELECT * FROM "user_john_123456"."todos" 
ORDER BY "order" ASC;

-- Events der nächsten 7 Tage (ersetze schema_name)
SELECT * FROM "user_john_123456"."events"
WHERE date >= CURRENT_DATE 
  AND date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY date ASC;

-- Body Metrics des Users (ersetze schema_name)
SELECT date, weight, body_fat 
FROM "user_john_123456"."body_metrics"
ORDER BY date DESC 
LIMIT 10;
```

### 3. User-Schema finden

```sql
-- Alle User mit ihren Schemas
SELECT 
    u.username,
    u.email,
    u.schema_name,
    u.created_at
FROM public.users u
ORDER BY u.created_at DESC;
```

### 4. Datenbank-Größe prüfen

```sql
-- Gesamtgröße der Datenbank
SELECT pg_size_pretty(pg_database_size('aiohub_db'));

-- Größe jedes Schemas
SELECT 
    schemaname,
    pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename))::bigint) as size
FROM pg_tables
WHERE schemaname LIKE 'user_%'
GROUP BY schemaname
ORDER BY SUM(pg_total_relation_size(schemaname||'.'||tablename)) DESC;
```

### 5. Backup erstellen

**Rechtsklick auf "aiohub_db"** → **"Backup..."**

- **Format:** Custom
- **Filename:** `aiohub_backup_2024-10-19.backup`
- **Encoding:** UTF8
- Klick **"Backup"**

### 6. Backup wiederherstellen

**Rechtsklick auf "aiohub_db"** → **"Restore..."**

- **Format:** Custom or tar
- **Filename:** Wähle deine Backup-Datei
- Klick **"Restore"**

---

## 🔧 Konfiguration anpassen

### Login-Daten ändern

In `.env`:
```env
PGADMIN_EMAIL=deine.email@domain.de
PGADMIN_PASSWORD=dein_sicheres_passwort
```

Danach:
```bash
docker-compose down
docker-compose up -d
```

### Port ändern

In `.env`:
```env
PGADMIN_PORT=8050  # Statt 5050
```

Zugriff dann über: `http://<nas-ip>:8050`

### Zusätzliche Server hinzufügen

1. **pgAdmin öffnen**
2. **Rechtsklick auf "Servers"** → **"Register"** → **"Server..."**
3. **General Tab:**
   - Name: `Anderer Server`
4. **Connection Tab:**
   - Host: `192.168.1.xxx`
   - Port: `5432`
   - Maintenance DB: `postgres`
   - Username: `your_user`
   - Password: `your_password`
5. **Save**

---

## 🐛 Troubleshooting

### Problem: "Unable to connect to server"

**Lösung 1:** PostgreSQL Container läuft nicht
```bash
docker-compose ps | grep postgres
docker-compose logs postgres
```

**Lösung 2:** Falsches Passwort
- Prüfe `POSTGRES_PASSWORD` in `.env`
- In pgAdmin: Server-Eigenschaften → Connection → Password neu eingeben

### Problem: "Server not found in servers.json"

**Lösung:** Server-Konfiguration neu laden
```bash
docker-compose down
docker-compose up -d pgadmin
```

### Problem: "Permission denied"

**Lösung:** pgAdmin Volume-Rechte zurücksetzen
```bash
docker-compose down
docker volume rm aiohub_pgadmin_data
docker-compose up -d
```

### Problem: Port 5050 bereits belegt

**Lösung:** Port in `.env` ändern
```env
PGADMIN_PORT=8050
```

---

## 🔒 Sicherheit

### Best Practices

1. **Starkes Passwort verwenden**
   ```env
   PGADMIN_PASSWORD=mein_sehr_sicheres_passwort_123!
   ```

2. **Nur intern zugänglich machen**
   - pgAdmin **NICHT** von außen erreichbar machen
   - Port 5050 **NUR** im lokalen Netzwerk öffnen

3. **HTTPS verwenden (optional)**
   - Reverse Proxy (nginx) mit SSL vor pgAdmin schalten
   - Let's Encrypt Zertifikat

4. **Regelmäßige Backups**
   - Täglich via pgAdmin Backup-Funktion
   - Oder via Cron-Job:
   ```bash
   # Backup-Script in Crontab
   0 2 * * * docker exec aiohub-postgres-1 pg_dump -U aiohub aiohub_db > /backup/aiohub_$(date +\%Y\%m\%d).sql
   ```

---

## 📖 Nützliche Features

### 1. Query History
- **Tools → Query History**
- Zeigt alle ausgeführten Queries mit Zeitstempel

### 2. ERD Diagram (Entity Relationship)
- **Tools → ERD For Database**
- Visualisiert Tabellen-Beziehungen

### 3. Import/Export
- **Rechtsklick auf Tabelle → Import/Export**
- CSV, JSON, Binary Import/Export

### 4. Dashboard
- **Dashboard Tab** oben
- Zeigt Server-Statistiken, Verbindungen, Sessions

### 5. Query Explain
- Query schreiben → **Explain Button** (F7)
- Zeigt Ausführungsplan & Performance

---

## 📊 Monitoring Queries

### Aktive Verbindungen
```sql
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity
WHERE datname = 'aiohub_db';
```

### Tabellen-Größen
```sql
SELECT 
    schemaname || '.' || tablename AS table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname LIKE 'user_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

### Langsame Queries finden
```sql
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 🆘 Support

**pgAdmin Dokumentation:** https://www.pgadmin.org/docs/

**Häufige Fehler:**
- Verbindung fehlgeschlagen → Prüfe `POSTGRES_PASSWORD`
- Port belegt → Ändere `PGADMIN_PORT`
- Server nicht sichtbar → Prüfe `pgadmin/servers.json`

**Logs anschauen:**
```bash
docker-compose logs pgadmin
```
