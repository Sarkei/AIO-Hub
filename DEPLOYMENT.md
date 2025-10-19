# 🚀 Deployment auf Ugreen NAS (UGOS)

## Voraussetzungen auf deinem Ugreen NAS

### 1. Docker Installation in UGOS
- Öffne **UGOS Container Manager** (Docker)
- Falls noch nicht installiert: Installiere Docker über den UGOS App Store

### 2. SSH-Zugang aktivieren (optional, aber empfohlen)
- Gehe zu **Einstellungen → Terminal & SNMP**
- Aktiviere **SSH-Dienst**
- Notiere dir Port (Standard: 22) und Passwort

---

## 📋 Schritt-für-Schritt Installation

### **Schritt 1: Projekt auf NAS kopieren**

**Option A - Via SSH/SCP:**
```bash
# Von deinem Windows PC aus (PowerShell):
scp -r C:\Apps\AIO-Hub admin@<NAS-IP>:/volume1/docker/

# Beispiel:
scp -r C:\Apps\AIO-Hub admin@192.168.1.100:/volume1/docker/
```

**Option B - Via UGOS File Manager:**
1. Öffne **UGOS File Manager**
2. Navigiere zu `/volume1/docker/` (oder erstelle diesen Ordner)
3. Lade den kompletten `AIO-Hub` Ordner hoch

---

### **Schritt 2: .env Datei erstellen**

SSH in dein NAS oder nutze den UGOS Terminal:

```bash
# In das Projekt-Verzeichnis wechseln
cd /volume1/docker/AIO-Hub

# .env Datei erstellen
nano .env
```

Füge folgende Inhalte ein:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# PostgreSQL Datenbank-Verbindung
POSTGRES_USER=aiohub              # PostgreSQL Benutzername
POSTGRES_PASSWORD=dein_sicheres_passwort_hier_123!  # ÄNDERE DIES!
POSTGRES_DB=aiohub_db             # Name der Haupt-Datenbank
DATABASE_URL=postgresql://aiohub:dein_sicheres_passwort_hier_123!@postgres:5432/aiohub_db

# ============================================
# JWT AUTHENTICATION
# ============================================
# Wird für Login-Token verwendet (muss geheim bleiben!)
JWT_SECRET=dein_super_geheimer_jwt_key_mit_mindestens_32_zeichen_1234567890!  # ÄNDERE DIES!

# ============================================
# PORT CONFIGURATION
# ============================================
# Externe Ports (wie du im Browser darauf zugreifst)
NGINX_PORT=8080                   # Frontend-Port (http://<NAS-IP>:8080)
BACKEND_PORT=4000                 # Backend API-Port (direkt, falls nötig)
FRONTEND_PORT=3000                # Frontend Dev-Port (intern)

# ============================================
# PGADMIN CONFIGURATION
# ============================================
# pgAdmin Login-Daten für Web-Interface
PGADMIN_EMAIL=admin@aiohub.local  # Login E-Mail für pgAdmin
PGADMIN_PASSWORD=admin123         # Login Passwort für pgAdmin (ÄNDERN!)

# ============================================
# DOCKER INTERNAL PORTS (nicht ändern!)
# ============================================
DB_INTERNAL_PORT=5432
BACKEND_INTERNAL_PORT=4000
FRONTEND_INTERNAL_PORT=3000
```

**Speichern:** 
- In `nano`: `STRG+O` → `Enter` → `STRG+X`
- In `vim`: `ESC` → `:wq` → `Enter`

---

### **Schritt 3: .env Variablen Erklärung**

#### 🔐 **POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB**
- **Zweck:** PostgreSQL Datenbank-Zugangsdaten
- **Wo verwendet:** 
  - Docker Container erstellt die Datenbank mit diesen Credentials
  - Backend verbindet sich mit `DATABASE_URL` zur Datenbank
- **Wichtig:** Wähle ein **starkes Passwort** (mind. 16 Zeichen, Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen)

#### 🔑 **JWT_SECRET**
- **Zweck:** Verschlüsselt die Login-Token (JSON Web Tokens)
- **Wo verwendet:** 
  - Backend signiert Token beim Login
  - Backend verifiziert Token bei jeder API-Anfrage
- **Wichtig:** 
  - Muss **absolut geheim** bleiben (niemals committen!)
  - Mindestens 32 Zeichen lang
  - Bei Änderung werden alle bestehenden Logins ungültig

#### 🌐 **NGINX_PORT**
- **Zweck:** Externer Port für Zugriff auf die App
- **Standard:** 8080
- **Zugriff:** `http://<deine-nas-ip>:8080`
- **Anpassen falls:** Port 8080 schon belegt ist (dann z.B. 8081)

#### 📡 **BACKEND_PORT / FRONTEND_PORT**
- **Zweck:** Interne Container-Ports (Docker-Netzwerk)
- **Normal:** Nicht ändern (nur bei Konflikten)

#### 🗄️ **DATABASE_URL**
- **Zweck:** Komplette Verbindungs-URL für Prisma ORM
- **Format:** `postgresql://user:password@host:port/database`
- **Wichtig:** Muss mit `POSTGRES_*` Variablen übereinstimmen!

#### 📊 **PGADMIN_PORT**
- **Zweck:** Externer Port für pgAdmin Web-UI
- **Standard:** 5050
- **Zugriff:** `http://<deine-nas-ip>:5050`
- **Anpassen falls:** Port 5050 schon belegt ist

#### 🔑 **PGADMIN_EMAIL / PGADMIN_PASSWORD**
- **Zweck:** Login-Daten für pgAdmin Web-Interface
- **Standard:** admin@aiohub.local / admin123
- **Wichtig:** Ändere das Passwort für Produktiv-Umgebungen!
- **Verwendung:** Login auf `http://<nas-ip>:5050`

---

### **Schritt 4: Docker Container starten**

```bash
# In das Projekt-Verzeichnis
cd /volume1/docker/AIO-Hub

# Container bauen und starten
docker-compose up -d

# Logs anschauen (zum Debuggen)
docker-compose logs -f

# Status prüfen
docker-compose ps
```

**Erwartete Ausgabe:**
```
NAME                    STATUS              PORTS
aiohub-postgres-1       Up 30 seconds      0.0.0.0:5432->5432/tcp
aiohub-backend-1        Up 25 seconds      0.0.0.0:4000->4000/tcp
aiohub-frontend-1       Up 20 seconds      0.0.0.0:3000->3000/tcp
aiohub-proxy-1          Up 15 seconds      0.0.0.0:8080->80/tcp
aiohub-pgadmin-1        Up 10 seconds      0.0.0.0:5050->80/tcp
```

---

### **Schritt 5: App öffnen**

1. Öffne Browser
2. **AIO Hub App:** `http://<deine-nas-ip>:8080`
   - Beispiel: `http://192.168.1.100:8080`
3. Du solltest die Login-Page sehen! 🎉

### **Schritt 6: pgAdmin öffnen (optional)**

1. Öffne Browser
2. **pgAdmin:** `http://<deine-nas-ip>:5050`
   - Beispiel: `http://192.168.1.100:5050`
3. Login mit:
   - **E-Mail:** `admin@aiohub.local` (aus `.env`)
   - **Passwort:** `admin123` (aus `.env` - ändern empfohlen!)
4. Server **"AIO Hub PostgreSQL"** ist automatisch verbunden
5. Beim ersten Zugriff auf den Server: Gib dein `POSTGRES_PASSWORD` ein

---

## 🔧 UGOS Container Manager (GUI-Alternative)

Falls du Docker Compose nicht per Terminal nutzen möchtest:

### 1. UGOS Container Manager öffnen
- App öffnen
- Gehe zu **"Container"** Tab

### 2. Projekt importieren
- Klicke auf **"Projekt"** → **"Erstellen"**
- Wähle Projektordner: `/volume1/docker/AIO-Hub`
- UGOS erkennt automatisch die `docker-compose.yml`
- Klicke **"Starten"**

### 3. Container verwalten
- **Starten/Stoppen:** Über Play/Stop Buttons
- **Logs anzeigen:** Klick auf Container → "Logs"
- **Terminal öffnen:** Klick auf Container → "Terminal"

---

## 🌐 Port-Freigabe für externen Zugriff (optional)

Falls du von außerhalb deines Heimnetzwerks zugreifen willst:

### Option 1: Router Port-Forwarding
1. Öffne Router-Admin-Panel
2. Port-Forwarding Regel erstellen:
   - **Extern:** 8080 (oder beliebiger Port)
   - **Intern:** 8080 (NGINX_PORT)
   - **Ziel-IP:** Deine NAS-IP (z.B. 192.168.1.100)
3. Zugriff via: `http://<deine-externe-ip>:8080`

### Option 2: UGOS Reverse Proxy (falls vorhanden)
1. UGOS **"Application"** öffnen
2. Reverse Proxy einrichten für Port 8080
3. Domain/Subdomain zuweisen (z.B. `aiohub.deinedomain.de`)

---

## 🐛 Troubleshooting

### Problem: Container starten nicht
```bash
# Logs prüfen
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Container neu bauen (bei Code-Änderungen)
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Problem: "Database connection failed"
- Prüfe ob PostgreSQL Container läuft: `docker-compose ps`
- Prüfe `DATABASE_URL` in `.env` (User/Password korrekt?)
- Warte 10-15 Sekunden nach Start (DB muss initialisieren)

### Problem: Port schon belegt
```bash
# Andere Container auf Port 8080 finden
docker ps | grep 8080

# Oder Port in .env ändern (z.B. NGINX_PORT=8081)
```

### Problem: Frontend zeigt "Cannot connect to backend"
- Prüfe ob Backend läuft: `curl http://localhost:4000/api/health`
- In `frontend/.env.local` Backend-URL prüfen
- Browser-Konsole öffnen (F12) und Fehler checken

---

## 🔄 Updates & Wartung

### App aktualisieren (nach Code-Änderungen)
```bash
cd /volume1/docker/AIO-Hub

# Container stoppen
docker-compose down

# Neuen Code pullen (falls Git verwendet)
git pull

# Container neu bauen
docker-compose build --no-cache

# Container starten
docker-compose up -d
```

### Datenbank Backup
```bash
# Backup erstellen
docker exec aiohub-postgres-1 pg_dumpall -U aiohub > backup_$(date +%Y%m%d).sql

# Backup wiederherstellen
docker exec -i aiohub-postgres-1 psql -U aiohub < backup_20231015.sql
```

### Logs bereinigen (Speicherplatz freigeben)
```bash
# Alte Logs löschen
docker-compose logs --tail=0 -f > /dev/null &

# Oder Docker System aufräumen
docker system prune -a
```

---

## 📊 Monitoring

### Container-Status prüfen
```bash
# Alle Container
docker-compose ps

# Ressourcen-Verbrauch
docker stats

# Logs Live verfolgen
docker-compose logs -f --tail=50
```

### Datenbank-Größe prüfen
```bash
docker exec aiohub-postgres-1 psql -U aiohub -c "SELECT pg_size_pretty(pg_database_size('aiohub_db'));"
```

### pgAdmin verwenden
```bash
# pgAdmin öffnen
open http://localhost:5050

# Login: admin@aiohub.local / admin123 (siehe .env)
# Server "AIO Hub PostgreSQL" ist automatisch konfiguriert

# Beim ersten Zugriff auf Server: Gib POSTGRES_PASSWORD ein
```

---

## 🔒 Sicherheit Best Practices

1. **Starke Passwörter verwenden:**
   - `POSTGRES_PASSWORD`: Min. 16 Zeichen
   - `JWT_SECRET`: Min. 32 Zeichen
   
2. **Firewall konfigurieren:**
   - Nur Port 8080 (NGINX) nach außen öffnen
   - Ports 3000, 4000, 5432 **NUR intern** zugänglich

3. **Regelmäßige Backups:**
   - Täglich Datenbank-Backup (Cron-Job)
   - Wöchentlich komplettes Docker-Volume

4. **HTTPS einrichten (Produktiv):**
   - Reverse Proxy mit SSL/TLS (Let's Encrypt)
   - Oder Cloudflare vor die App schalten

---

## 📞 Support

Bei Problemen:
1. Logs prüfen: `docker-compose logs`
2. Container-Status: `docker-compose ps`
3. Datenbank-Verbindung testen: `docker exec -it aiohub-postgres-1 psql -U aiohub`
4. Backend Health-Check: `curl http://localhost:4000/api/health`

**Häufige Fehlerquellen:**
- Falsche `.env` Variablen (Tippfehler in Passwörtern)
- Port-Konflikte (8080 schon belegt)
- Zu wenig RAM (mind. 2GB für alle Container)
- Docker Version zu alt (mind. Docker 20.10+)
