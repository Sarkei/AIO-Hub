# 📝 Changelog

## [Unreleased] - 2025-10-19

### 🔧 Fixed
- **Backend**: OpenSSL support für Alpine Linux hinzugefügt
- **Backend**: Prisma binary targets für Alpine Linux konfiguriert
- **Frontend**: Cross-origin warning für NAS-Deployment behoben
- **Frontend**: libc6-compat für bessere Alpine-Kompatibilität
- **Frontend**: ESLint v9 downgrade auf v8 (Next.js 14 Kompatibilität)
- **Docker**: npm install mit --legacy-peer-deps für bessere Paket-Kompatibilität

### ⬆️ Updated
- **Backend Packages**:
  - express: 4.18.2 → 4.21.1
  - @prisma/client: 5.6.0 → 5.21.1
  - prisma: 5.6.0 → 5.21.1
  - helmet: 7.1.0 → 8.0.0
  - uuid: 9.0.1 → 10.0.0
  - typescript: 5.2.2 → 5.6.3
  - nodemon: 3.0.1 → 3.1.7
  - dotenv: 16.3.1 → 16.4.5
  - express-validator: 7.0.1 → 7.2.0

- **Frontend Packages**:
  - react: 18.2.0 → 18.3.1
  - react-dom: 18.2.0 → 18.3.1
  - next: 14.0.3 → 14.2.33
  - axios: 1.6.2 → 1.7.7
  - date-fns: 2.30.0 → 3.6.0
  - recharts: 2.10.3 → 2.12.7
  - zustand: 4.4.7 → 4.5.5
  - typescript: 5.2.2 → 5.6.3
  - tailwindcss: 3.3.5 → 3.4.14
  - eslint: 8.54.0 → 8.57.1 (kept at v8 for Next.js compatibility)

### 🔄 Replaced
- **Frontend**: `react-beautiful-dnd` → `@hello-pangea/dnd` (deprecated package replaced)
  - `react-beautiful-dnd` wird nicht mehr maintained
  - `@hello-pangea/dnd` ist ein aktiver Fork mit gleicher API

### 📚 Documentation
- CHANGELOG.md erstellt
- .dockerignore Dateien erweitert für schnellere Builds

---

## 🚀 Migration Guide

### Drag & Drop Update

Falls du eigene Komponenten mit Drag & Drop hast:

**Vorher:**
```tsx
import { DragDropContext } from 'react-beautiful-dnd'
```

**Nachher:**
```tsx
import { DragDropContext } from '@hello-pangea/dnd'
```

Die API ist **100% kompatibel** - kein Code-Change nötig! ✅

### date-fns v3 Breaking Changes

Falls du `date-fns` direkt nutzt:

**Vorher (v2):**
```tsx
import { format } from 'date-fns'
format(new Date(), 'yyyy-MM-dd')
```

**Nachher (v3):**
```tsx
import { format } from 'date-fns'
format(new Date(), 'yyyy-MM-dd') // Gleiche Syntax!
```

v3 ist weitgehend rückwärtskompatibel. ✅

### ESLint v9 Breaking Changes

Falls du custom ESLint-Config hast:

- **Flat Config** ist jetzt Standard
- Alte `.eslintrc.json` wird weiterhin unterstützt
- Next.js kümmert sich automatisch darum ✅

---

## 📦 Deployment auf NAS

Nach Git Pull:

```bash
cd /volume1/docker/AIO-Hub

# Container stoppen
sudo docker compose down

# Neu bauen (wichtig wegen Paket-Updates!)
sudo docker compose build --no-cache

# Starten
sudo docker compose up -d

# Logs prüfen
sudo docker compose logs -f
```

---

## ✅ Getestete Umgebungen

- ✅ Ugreen NAS (UGOS)
- ✅ Alpine Linux (Docker)
- ✅ Node.js 18
- ✅ PostgreSQL 15
- ✅ Chrome/Firefox/Safari

---

## 🐛 Known Issues

Keine bekannten Probleme! 🎉

---

## 📅 Version History

### v1.0.0 (2025-10-19) - Initial Release
- ✅ Alle 5 privaten Module implementiert
- ✅ Docker Compose Setup
- ✅ PostgreSQL mit User-Schemas
- ✅ JWT Authentication
- ✅ pgAdmin Integration
