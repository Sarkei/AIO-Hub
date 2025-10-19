# Frontend Dockerfile für AIO Hub
FROM node:18-alpine

# libc6-compat für bessere Kompatibilität installieren
RUN apk add --no-cache libc6-compat

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Package Files kopieren
COPY package*.json ./

# Dependencies installieren (npm install statt ci, da package-lock.json möglicherweise fehlt)
RUN npm install

# Quellcode kopieren
COPY . .

# Next.js bauen (nur für Production)
# RUN npm run build

# Port freigeben
EXPOSE 3000

# Development Server starten
CMD ["npm", "run", "dev"]

# Für Production:
# CMD ["npm", "start"]
