# 🏗️ Build Tipps für langsame Systeme

## Problem: Frontend npm install dauert zu lange (>150 Sekunden)

Das Ugreen NAS ist langsam beim npm install wegen vieler Dependencies.

---

## ✅ **Lösung 1: Nur Backend neu bauen, Frontend vom Hub ziehen**

```bash
# Backend lokal bauen
sudo docker compose build --no-cache backend

# Frontend: Pre-built Image nutzen (falls verfügbar)
# ODER: Frontend ohne Rebuild starten mit alten Packages
sudo docker compose up -d
```

---

## ✅ **Lösung 2: Build mit mehr Geduld durchführen**

```bash
# Terminal 1: Build starten
sudo docker compose build backend

# Warten bis Backend fertig...

# Dann Frontend separat (mit nohup damit es nicht abbricht)
nohup sudo docker compose build frontend > frontend-build.log 2>&1 &

# Status checken
tail -f frontend-build.log

# Oder mit screen/tmux (bleibt nach SSH-Disconnect aktiv)
screen -S docker-build
sudo docker compose build frontend
# CTRL+A dann D zum Detach
# screen -r docker-build zum Wiederanhängen
```

---

## ✅ **Lösung 3: Development-Modus ohne Build**

Du kannst die Container auch **ohne vollen npm install** starten:

### Frontend mit mounted volumes (entwickelt live):

```yaml
# In docker-compose.yml für Frontend:
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  volumes:
    - ./frontend:/app
    - /app/node_modules  # Nutzt node_modules vom Image
```

Das ist schneller, weil npm install nur einmal passiert.

---

## ✅ **Lösung 4: Cache nutzen (ohne --no-cache)**

```bash
# Ohne --no-cache ist viel schneller
sudo docker compose build

# Nur wenn Packages sich ändern: --no-cache
sudo docker compose build --no-cache backend  # Backend wichtig
sudo docker compose build frontend            # Frontend mit Cache
```

---

## ✅ **Lösung 5: Pre-built Images auf Docker Hub**

Falls du das Projekt öfter deployen willst:

```bash
# Auf deinem schnellen PC:
docker build -t sarkei/aiohub-frontend:latest ./frontend
docker build -t sarkei/aiohub-backend:latest ./backend

# Push zu Docker Hub
docker push sarkei/aiohub-frontend:latest
docker push sarkei/aiohub-backend:latest

# Auf dem NAS: docker-compose.yml ändern
services:
  backend:
    image: sarkei/aiohub-backend:latest
  frontend:
    image: sarkei/aiohub-frontend:latest
```

Dann musst du auf dem NAS **gar nicht mehr builden**! ⚡

---

## 🎯 **Empfehlung für dein NAS:**

**Option A: Nur Backend neu bauen** (da OpenSSL-Fix wichtig ist):

```bash
# Backend neu bauen (dauert nur ~60 Sek)
sudo docker compose build --no-cache backend

# Frontend mit altem Cache (geht schnell)
sudo docker compose build frontend

# Starten
sudo docker compose up -d
```

**Option B: Screen Session verwenden**:

```bash
# Screen installieren
sudo apt-get install screen  # oder: sudo apk add screen

# Screen Session starten
screen -S docker-build

# Build starten (kann jetzt nicht mehr abbrechen)
sudo docker compose build --no-cache

# Detach mit: CTRL+A dann D
# SSH kann geschlossen werden!

# Später wieder anhängen:
screen -r docker-build
```

**Option C: Images auf schnellem PC bauen** (empfohlen!):

```bash
# Auf deinem Windows PC (mit Docker Desktop):
cd c:\Apps\AIO-Hub

# Backend bauen
docker build -t aiohub-backend:latest ./backend

# Frontend bauen
docker build -t aiohub-frontend:latest ./frontend

# Als .tar exportieren
docker save aiohub-backend:latest > backend.tar
docker save aiohub-frontend:latest > frontend.tar

# Mit SCP auf NAS kopieren
scp backend.tar nasadmin@<nas-ip>:/volume1/docker/
scp frontend.tar nasadmin@<nas-ip>:/volume1/docker/

# Auf dem NAS importieren
cd /volume1/docker
sudo docker load < backend.tar
sudo docker load < frontend.tar

# Tags anpassen
sudo docker tag aiohub-backend:latest aio-hub-backend:latest
sudo docker tag aiohub-frontend:latest aio-hub-frontend:latest

# Starten
cd /volume1/docker/AIO-Hub
sudo docker compose up -d
```

---

## 📊 **Build-Zeiten Vergleich:**

| Methode | Zeit | Vorteil |
|---------|------|---------|
| NAS: Build from scratch | ~200s | Immer aktuell |
| NAS: Mit Cache | ~60s | Schnell wenn Pakete gleich |
| PC: Build + Transfer | ~90s | Nutzt schnelle PC-CPU |
| Docker Hub: Pull | ~30s | Schnellste Methode |

---

## 🚀 **Meine Empfehlung:**

**Baue auf deinem Windows PC und exportiere!** Das ist am einfachsten:

```powershell
# Auf PC (PowerShell)
cd c:\Apps\AIO-Hub
docker build -t aiohub-backend ./backend
docker build -t aiohub-frontend ./frontend
docker save aiohub-backend aiohub-frontend -o aiohub-images.tar

# Upload (via FileZilla oder SCP)
scp aiohub-images.tar nasadmin@<nas-ip>:/volume1/docker/
```

Dann auf NAS:
```bash
sudo docker load -i /volume1/docker/aiohub-images.tar
cd /volume1/docker/AIO-Hub
sudo docker compose up -d
```

**Fertig in 2 Minuten!** ⚡
