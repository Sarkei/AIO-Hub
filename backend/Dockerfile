# Backend Dockerfile für AIO Hub
FROM node:18-alpine

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Package Files kopieren
COPY package*.json ./
COPY tsconfig.json ./

# Dependencies installieren (npm install statt ci, da package-lock.json möglicherweise fehlt)
RUN npm install

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
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
