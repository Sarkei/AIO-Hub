# 🚀 Quick Start - AIO Hub

## Schritt 1: Dependencies installieren

### Backend
```powershell
cd backend
npm install
```

### Frontend
```powershell
cd frontend
npm install
```

---

## Schritt 2: Umgebungsvariablen prüfen

Die `.env` Datei im Root-Verzeichnis ist bereits konfiguriert.

**⚠️ Für Production:** Ändere `JWT_SECRET` und `POSTGRES_PASSWORD`!

---

## Schritt 3: Docker Container starten

```powershell
# Im Root-Verzeichnis (AIO-Hub/)
docker-compose up -d --build
```

Dies startet:
- PostgreSQL Datenbank (Port 5432, intern)
- Backend API (Port 4000)
- Frontend (Port 3000)
- Nginx Proxy (Port 80)

---

## Schritt 4: Datenbank initialisieren

```powershell
# In Backend-Container einloggen
docker exec -it aiohub_backend sh

# Prisma Migrationen ausführen
npx prisma migrate deploy

# Exit
exit
```

---

## Schritt 5: App öffnen

🌐 **http://localhost** oder **http://localhost:3000**

### Ersten Account erstellen:
1. Klicke auf "Jetzt registrieren"
2. Fülle Benutzername, E-Mail und Passwort aus
3. Nach Registrierung wirst du automatisch eingeloggt
4. Du siehst das Dashboard mit dem Privatbereich

---

## 📊 Status prüfen

```powershell
# Container Status
docker-compose ps

# Logs anzeigen
docker-compose logs -f

# Backend Logs
docker-compose logs -f backend

# Health Check
curl http://localhost:4000/health
```

---

## 🛑 Container stoppen

```powershell
docker-compose down

# Mit Datenbank-Reset (ACHTUNG: Löscht alle Daten!)
docker-compose down -v
```

---

## 🔧 Troubleshooting

### Problem: Port bereits belegt
```powershell
# Prüfe welcher Prozess Port 80/3000/4000 nutzt
netstat -ano | findstr :80
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# Prozess beenden
taskkill /PID <prozess-id> /F
```

### Problem: Container startet nicht
```powershell
# Logs prüfen
docker-compose logs backend
docker-compose logs frontend

# Container neu bauen ohne Cache
docker-compose build --no-cache
docker-compose up -d
```

### Problem: Datenbank-Verbindung fehlgeschlagen
```powershell
# PostgreSQL Container Status prüfen
docker exec aiohub_db pg_isready -U aiohub

# Falls nicht ready, Container neu starten
docker-compose restart postgres
```

---

## 🎯 Nächste Schritte

1. ✅ Registriere einen Account
2. ✅ Melde dich an
3. ✅ Sieh dir das Dashboard an
4. ⏳ Warte auf Todo-Implementierung (kommt als nächstes)

---

## 📖 Weitere Infos

- **SETUP.md** - Detaillierte Setup-Anleitung
- **README.md** - Projektübersicht
- **backend/prisma/schema.prisma** - Datenbank-Schema

---

**Happy Coding! 🚀**
