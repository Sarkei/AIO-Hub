# ⚡ Quick Start Guide - 5 Minuten Setup

## TL;DR - Schnellstart für Eilige

```bash
# 1. Projekt auf NAS kopieren
scp -r C:\Apps\AIO-Hub admin@<NAS-IP>:/volume1/docker/

# 2. SSH ins NAS
ssh admin@<NAS-IP>
cd /volume1/docker/AIO-Hub

# 3. .env erstellen (siehe unten)
nano .env

# 4. Docker starten
docker-compose up -d

# 5. App öffnen
# http://<NAS-IP>:8080
```

---

## 📝 Minimale .env Konfiguration

Erstelle diese Datei: `/volume1/docker/AIO-Hub/.env`

```env
# Datenbank
POSTGRES_USER=aiohub
POSTGRES_PASSWORD=MeinSicheresPasswort123!
POSTGRES_DB=aiohub_db
DATABASE_URL=postgresql://aiohub:MeinSicheresPasswort123!@postgres:5432/aiohub_db

# Sicherheit (wichtig!)
JWT_SECRET=supersicherersecretkey123456789012345678901234567890

# Ports (Standard)
NGINX_PORT=8080
BACKEND_PORT=4000
FRONTEND_PORT=3000
PGADMIN_PORT=5050

# pgAdmin (Datenbank-Verwaltung)
PGADMIN_EMAIL=admin@aiohub.local
PGADMIN_PASSWORD=admin123
```

**⚠️ WICHTIG:** Ändere `POSTGRES_PASSWORD` und `JWT_SECRET`!

---

## 🎯 Was macht welche Variable?

| Variable | Zweck | Beispiel | Ändern? |
|----------|-------|----------|---------|
| `POSTGRES_PASSWORD` | DB-Passwort | `MeinPass123!` | ✅ **JA** |
| `JWT_SECRET` | Login-Token-Key | `abc123def456...` | ✅ **JA** |
| `NGINX_PORT` | Browser-Port | `8080` | Optional |
| `DATABASE_URL` | DB-Verbindung | `postgresql://...` | Nur wenn PW geändert |

---

## 🚀 Erster Start

Nach `docker-compose up -d`:

1. **Warte 30 Sekunden** (Datenbank initialisiert)
2. Öffne: `http://<deine-nas-ip>:8080`
3. Klicke **"Registrieren"**
4. Erstelle deinen ersten User
5. Fertig! 🎉

### 📊 pgAdmin (Datenbank-Verwaltung)
- **URL:** `http://<deine-nas-ip>:5050`
- **Login:** `admin@admin.com` / `admin123` (siehe `.env`)
- **Server:** Automatisch verbunden mit "AIO Hub PostgreSQL"
- **Passwort beim 1. Zugriff:** Dein `POSTGRES_PASSWORD` aus `.env`

---

## 🔍 Läuft alles?

```bash
# Container Status prüfen
docker-compose ps

# Sollte zeigen:
# aiohub-postgres-1   Up
# aiohub-backend-1    Up
# aiohub-frontend-1   Up
# aiohub-proxy-1      Up

# Logs anschauen
docker-compose logs -f

# Backend testen
curl http://localhost:4000/api/health
# Erwartet: {"status":"ok","message":"Backend is running"}
```

---

## 🐛 Probleme?

### "Container starten nicht"
```bash
docker-compose down
docker-compose up -d
docker-compose logs
```

### "Port 8080 belegt"
In `.env` ändern: `NGINX_PORT=8081`

### "Cannot connect to backend"
Warte 30 Sek und lade Seite neu (DB braucht Zeit)

---

## 📱 Erste Schritte in der App

1. **Registrieren:** Erstelle deinen User
2. **Dashboard:** Siehst du nach Login
3. **Module testen:**
   - 📋 **Todos** - Kanban Board
   - 📅 **Events** - Termine eintragen
   - 📊 **Body Metrics** - Gewicht & Maße tracken
   - 💪 **Gym** - Workout mit Timer loggen
   - 🍽️ **Nutrition** - Kalorien & Makros tracken

---

## 🎓 Mehr Details?

Siehe **[DEPLOYMENT.md](./DEPLOYMENT.md)** für:
- Ausführliche Erklärungen
- UGOS GUI-Setup
- Port-Forwarding
- Sicherheit & Backups
- Troubleshooting

---

## ⚙️ Nützliche Befehle

```bash
# Container stoppen
docker-compose down

# Container neu starten
docker-compose restart

# Logs live anschauen
docker-compose logs -f backend

# Container neu bauen (nach Code-Änderungen)
docker-compose build --no-cache
docker-compose up -d

# Alles löschen und neu starten (VORSICHT: löscht Daten!)
docker-compose down -v
docker-compose up -d
```

---

## 🆘 Schnelle Hilfe

**Backend erreichbar?**
```bash
curl http://localhost:4000/api/health
```

**Datenbank erreichbar?**
```bash
docker exec -it aiohub-postgres-1 psql -U aiohub -d aiohub_db -c "SELECT 1;"
```

**Frontend erreichbar?**
```bash
curl http://localhost:3000
```

**NGINX erreichbar?**
```bash
curl http://localhost:8080
```

Alle müssen antworten! Sonst:
```bash
docker-compose logs <service-name>
```
