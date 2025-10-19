# 🚀 AIO Hub - Setup & Deployment Guide

## 📋 Voraussetzungen

- Docker & Docker Compose installiert
- Node.js 18+ (nur für lokale Entwicklung)
- Git

---

## 🏗️ Projekt-Setup

### 1. Repository klonen
```bash
cd c:\Apps
git clone <your-repo> AIO-Hub
cd AIO-Hub
```

### 2. Umgebungsvariablen konfigurieren

Die `.env` Datei ist bereits vorhanden. **Wichtig**: Ändere folgende Werte für Production:

```env
JWT_SECRET=dein_sehr_sicheres_secret_hier_mindestens_32_zeichen
POSTGRES_PASSWORD=dein_sicheres_db_passwort
```

### 3. Docker Container starten

```powershell
# Alle Container bauen und starten
docker-compose up -d --build

# Logs anzeigen
docker-compose logs -f

# Nur bestimmte Services anzeigen
docker-compose logs -f backend
```

### 4. Datenbank initialisieren

```powershell
# In Backend-Container einloggen
docker exec -it aiohub_backend sh

# Prisma Migrationen ausführen
npx prisma migrate deploy

# Prisma Client generieren
npx prisma generate

# Container verlassen
exit
```

---

## 🌐 Zugriff auf die App

- **Web-App**: http://localhost
- **Frontend direkt**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health

---

## 👨‍💻 Lokale Entwicklung (ohne Docker)

### Backend

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Läuft auf: http://localhost:4000

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Läuft auf: http://localhost:3000

---

## 🗄️ Datenbank-Management

### Prisma Studio (DB-GUI)

```powershell
cd backend
npx prisma studio
```

Öffnet Browser auf: http://localhost:5555

### Neue Migration erstellen

```powershell
cd backend
npx prisma migrate dev --name beschreibung_der_aenderung
```

### Migration zurücksetzen (ACHTUNG: Löscht Daten!)

```powershell
cd backend
npx prisma migrate reset
```

---

## 🐳 Docker Befehle

### Container Management

```powershell
# Container starten
docker-compose up -d

# Container stoppen
docker-compose down

# Container neu bauen
docker-compose up -d --build

# Alle Container, Volumes UND Daten löschen
docker-compose down -v

# Logs anzeigen
docker-compose logs -f [service-name]

# In Container einloggen
docker exec -it aiohub_backend sh
docker exec -it aiohub_frontend sh
```

### Troubleshooting

```powershell
# Container Status prüfen
docker-compose ps

# Ressourcen-Nutzung
docker stats

# Bestimmten Container neu starten
docker-compose restart backend

# Cache leeren und neu bauen
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔧 Konfiguration für Ugreen NAS

### 1. Projekt auf NAS hochladen

Via SSH/SFTP:
```bash
scp -r AIO-Hub/ user@nas-ip:/volume1/docker/aiohub/
```

### 2. Auf dem NAS

```bash
cd /volume1/docker/aiohub
docker-compose up -d
```

### 3. Lokale DNS-Einstellung (optional)

Füge in deiner Router-Config oder `/etc/hosts` hinzu:
```
192.168.1.XXX  aiohub.local
```

Dann erreichbar über: http://aiohub.local

---

## 📦 API Dokumentation

### Auth Endpoints

#### Registrierung
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test1234!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "Test1234!"
}
```

#### Aktueller User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 🔐 Sicherheit

### Production Checklist

- [ ] `JWT_SECRET` in `.env` geändert
- [ ] `POSTGRES_PASSWORD` in `.env` geändert
- [ ] `.env` zu `.gitignore` hinzugefügt
- [ ] HTTPS via Reverse Proxy (Nginx/Caddy) aktiviert
- [ ] Firewall-Regeln für Docker-Ports gesetzt
- [ ] Regelmäßige Backups der PostgreSQL-Daten

### Backup erstellen

```powershell
# PostgreSQL Dump
docker exec aiohub_db pg_dump -U aiohub aiohub_main > backup.sql

# Volume sichern
docker run --rm -v aiohub_pgdata:/data -v ${PWD}:/backup alpine tar czf /backup/pgdata-backup.tar.gz /data
```

### Backup wiederherstellen

```powershell
# SQL Import
docker exec -i aiohub_db psql -U aiohub aiohub_main < backup.sql
```

---

## 🧪 Testing

```powershell
# Backend Tests (folgt)
cd backend
npm test

# Frontend Tests (folgt)
cd frontend
npm test
```

---

## 📝 Nächste Schritte

1. ✅ Docker Setup
2. ✅ Auth-System mit Multi-Schema
3. ⏳ **Todos implementieren** (nächster Schritt)
4. ⏳ Termine implementieren
5. ⏳ Kalender implementieren
6. ⏳ Körperdaten-Tracker
7. ⏳ Gym-Tracker
8. ⏳ Ernährungs-Tracker
9. ⏳ Dashboard & Dark Mode
10. ⏳ Mobile Optimierung

---

## 🤝 Support

Bei Problemen:
1. Logs prüfen: `docker-compose logs -f`
2. Container Status: `docker-compose ps`
3. Health Check: http://localhost:4000/health

---

## 📄 Lizenz

MIT License - Privates Projekt
