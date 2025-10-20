# Frontend Dockerfile für AIO Hub
FROM node:18-alpine

# libc6-compat für bessere Kompatibilität installieren
RUN apk add --no-cache libc6-compat

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Package Files kopieren
COPY package*.json ./

# Dependencies installieren mit legacy-peer-deps für bessere Kompatibilität
RUN npm install --legacy-peer-deps

# Quellcode kopieren
COPY . .

# Next.js bauen für Production
RUN npm run build

# Port freigeben
EXPOSE 3000

# Production Server starten
CMD ["npm", "start"]
