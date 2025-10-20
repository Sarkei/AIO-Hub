# Backend Dockerfile für AIO Hub
FROM node:18.20.8-alpine3.21

# OpenSSL und andere benötigte Pakete installieren
RUN apk add --no-cache openssl libc6-compat

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Package Files kopieren
COPY package*.json ./
COPY tsconfig.json ./

# Dependencies installieren mit legacy-peer-deps für bessere Kompatibilität
RUN npm install --legacy-peer-deps

# Prisma CLI global installieren
RUN npm install -g prisma

# Quellcode kopieren
COPY . .

# Prisma Client generieren
RUN npx prisma generate

# TypeScript kompilieren
RUN npm run build

# Port freigeben
EXPOSE 4000

# Startskript
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
