# 🚀 AIO Hub - All-in-One Hub

Ein modularer, selbst gehosteter Hub für **Privat**, **Arbeit** und **Schule**.  
Läuft als Docker-Container auf deinem Ugreen-NAS.

---

## 📋 Features (Privatbereich)

✅ **Authentifizierung**: JWT-basiert, Multi-User mit eigenen Schemas  
✅ **Todos**: Kanban-Board mit Drag & Drop  
✅ **Termine**: CRUD-Funktion mit Kalenderintegration  
✅ **Kalender**: Monats-/Wochenansicht (Todos + Termine)  
✅ **Körperdaten**: Gewicht & Maße tracken  
✅ **Gym-Tracker**: Workouts, Sets, Volumenanalyse  
✅ **Ernährung**: Kalorienziel & Makros mit Tageslog  
✅ **Dark Mode**: Theme-Switcher  
✅ **Responsive**: Mobile-optimiert  

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Next.js + React + Tailwind CSS
- **Datenbank**: PostgreSQL (1 Schema pro User)
- **ORM**: Prisma
- **Auth**: JWT + bcrypt
- **Deployment**: Docker Compose + Nginx

---

## 🚀 Quick Start

### ⚡ Für Ugreen NAS (Empfohlen)
**→ [QUICK-START.md](./QUICK-START.md)** - 5 Minuten Setup  
**→ [DEPLOYMENT.md](./DEPLOYMENT.md)** - Vollständige Anleitung mit Troubleshooting

### 💻 Lokale Entwicklung

1. **Repository klonen**
```bash
git clone <repo-url>
cd AIO-Hub
```

2. **Umgebungsvariablen erstellen**
```bash
# .env im Root-Verzeichnis erstellen
nano .env
```

Minimal-Config:
```env
POSTGRES_USER=aiohub
POSTGRES_PASSWORD=dein_sicheres_passwort_123!
POSTGRES_DB=aiohub_db
DATABASE_URL=postgresql://aiohub:dein_sicheres_passwort_123!@postgres:5432/aiohub_db
JWT_SECRET=super_geheimer_key_mindestens_32_zeichen_lang_1234567890
NGINX_PORT=8080
BACKEND_PORT=4000
FRONTEND_PORT=3000
```

3. **Docker Container starten**
```bash
docker-compose up -d
```

4. **App öffnen**
- **Web-App**: http://localhost:8080 (via NGINX)
- **Backend API**: http://localhost:4000
- **Frontend Dev**: http://localhost:3000
- **pgAdmin**: http://localhost:5050 (Login: `admin@aiohub.local` / `admin123`)

---

## 🎯 Module im Detail

### Todos (Kanban)
- **Drag & Drop** zwischen 3 Spalten (Open, In Progress, Done)
- **Prioritäten:** Low, Medium, High (farbcodiert)
- **CRUD:** Erstellen, Bearbeiten, Löschen, Status ändern
- **Backend:** Automatische Order-Berechnung pro Spalte

### Events (Termine)
- **Datum & Zeit** mit optionalem Ganztags-Modus
- **Ort & Notizen** für jeden Termin
- **Filterung:** Upcoming vs. Past Events
- **CRUD:** Vollständiges Management

### Body Metrics
- **8 Metriken:** Gewicht, Körperfett, Brust, Taille, Hüfte, Bizeps, Oberschenkel, Waden
- **Statistiken:** 4 Info-Cards mit Wochenvergleich
- **Chart:** Line Chart für alle Metriken (Recharts)
- **Fortschritt:** Pfeile & Prozent-Änderung zu vor 7 Tagen

### Gym Tracker
- **Timer:** Start/Pause/Reset während Workout
- **Workout-Struktur:** Workout → Exercises → Sets
- **Set-Tracking:** Reps, Gewicht, RPE (1-10)
- **Volumen:** Automatische Berechnung (Gewicht × Reps)
- **RPE-Farben:** Visuelle Anstrengungsanzeige

### Nutrition Tracker
- **Profil:** Goal (Abnehmen/Halten/Zunehmen), Diet Type, Makro-Ziele
- **Meal-Logging:** Frühstück, Mittagessen, Abendessen, Snack
- **Makro-Tracking:** Protein, Carbs, Fat mit individuellen Progress-Bars
- **Charts:** Pie Chart für Makro-Verteilung
- **Stats:** Heute & Diese Woche Zusammenfassung

---

## � Projektstruktur

```
aiohub/
├── docker-compose.yml       # Docker Orchestrierung
├── .env                      # Umgebungsvariablen
├── backend/                  # Express Backend
│   ├── src/
│   │   ├── main.ts          # Entry Point
│   │   ├── routes/          # API Routes
│   │   ├── controllers/     # Business Logic
│   │   ├── services/        # Services
│   │   ├── middleware/      # Auth & Validation
│   │   └── prisma/          # Schema & Migrations
│   └── Dockerfile
├── frontend/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/             # App Router Pages
│   │   ├── components/      # React Components
│   │   ├── hooks/           # Custom Hooks
│   │   └── context/         # Auth Context
│   └── Dockerfile
└── proxy/
    └── nginx.conf           # Reverse Proxy Config
```

---

## 🔧 Development

### Backend entwickeln
```bash
cd backend
npm install
npm run dev
```

### Frontend entwickeln
```bash
cd frontend
npm install
npm run dev
```

### Datenbank-Migrationen
```bash
cd backend
npx prisma migrate dev --name init
npx prisma studio  # DB-GUI öffnen
```

---

## 🐳 Docker Befehle

```bash
# Container starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Container stoppen
docker-compose down

# Container neu bauen
docker-compose up -d --build

# Datenbank zurücksetzen
docker-compose down -v
```

---

## 📦 Deployment auf Ugreen NAS

**Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für detaillierte Anleitung!**

Kurzversion:
1. Projekt auf NAS kopieren: `/volume1/docker/AIO-Hub`
2. `.env` erstellen (siehe [QUICK-START.md](./QUICK-START.md))
3. `docker-compose up -d` ausführen
4. App öffnen: `http://<nas-ip>:8080`

**Was die .env Variablen bedeuten:**

| Variable | Zweck | Ändern? |
|----------|-------|---------|
| `POSTGRES_PASSWORD` | Datenbank-Passwort | ⚠️ **JA!** |
| `JWT_SECRET` | Login-Token Verschlüsselung (mind. 32 Zeichen) | ⚠️ **JA!** |
| `DATABASE_URL` | DB-Verbindung (automatisch aus obigen) | Nur bei PW-Änderung |
| `NGINX_PORT` | Browser-Port (Standard: 8080) | Optional |

**Detaillierte Erklärung:** Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) → Abschnitt ".env Variablen Erklärung"

---

## 🔐 Sicherheit

- ⚠️ **JWT_SECRET ändern** vor Production (mind. 32 Zeichen!)
- ⚠️ **POSTGRES_PASSWORD ändern** (mind. 16 Zeichen!)
- ✅ Passwörter werden mit bcrypt (12 rounds) gehasht
- ✅ Jeder User hat eigenes DB-Schema (Datenisolation)
- ✅ JWT-Token mit 7 Tagen Expiration
- ✅ Nur Port 8080 (NGINX) nach außen öffnen

---

## � Entwicklungsstatus

### ✅ Phase 1 - Private Area (KOMPLETT)
- [x] Docker Infrastructure (4 Services)
- [x] Backend API (Express + Prisma + JWT)
- [x] Frontend (Next.js 14 + Tailwind)
- [x] User Authentication & Schema-Isolation
- [x] Todos Kanban-Board
- [x] Events Management
- [x] Body Metrics Tracker + Charts
- [x] Gym Tracker + Timer + RPE
- [x] Nutrition Tracker + Makros

### 🚧 Phase 2 - Dashboard & Calendar (In Arbeit)
- [ ] Kombinierter Kalender (Todos + Events)
- [ ] Dashboard mit Statistiken
- [ ] Dark Mode Theme-Switcher

### ⏳ Phase 3 - Work & School (Geplant)
- [ ] Arbeitsbereich (Projekte, Zeiterfassung)
- [ ] Schulbereich (Kurse, Hausaufgaben)

---

## 📚 Weitere Dokumentation

- **[QUICK-START.md](./QUICK-START.md)** - 5 Minuten Setup
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Vollständige Installations-Anleitung
- **[PGADMIN.md](./PGADMIN.md)** - pgAdmin Setup & SQL-Queries

---

## 🆘 Hilfe & Support

**Probleme beim Setup?**
1. Prüfe [DEPLOYMENT.md](./DEPLOYMENT.md) → "Troubleshooting" Sektion
2. Logs anschauen: `docker-compose logs -f`
3. Container-Status: `docker-compose ps`

**Häufige Fehler:**
- "Cannot connect to backend" → Warte 30 Sek (DB-Initialisierung)
- "Port already in use" → Ändere `NGINX_PORT` in `.env`
- "Database connection failed" → Prüfe `DATABASE_URL` Passwort

---

## 📝 Lizenz

MIT License - Privates Projekt für Ugreen NAS

---

## 🤝 Credits

Entwickelt mit ❤️ für Self-Hosting auf Ugreen NAS mit UGOS
