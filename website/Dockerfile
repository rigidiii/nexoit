# syntax=docker/dockerfile:1
# Nexo IT Website – Next.js 15 (Node-Runtime, better-sqlite3, nodemailer)
#
# Bauen:
#   docker build --build-arg SITE_URL=https://www.nexoit.de -t nexoit-website .
# Starten:
#   docker run -d -p 3100:3100 \
#     -e APP_SECRET=<mindestens-32-zeichen> \
#     -e ADMIN_USERNAME=admin -e ADMIN_INITIAL_PASSWORD=<mindestens-12-zeichen> \
#     -v nexoit-data:/app/data \
#     nexoit-website
#
# APP_SECRET beim BUILD ist nur ein Dummy: src/lib/crypto.ts wirft sonst beim
# statischen Prerender. Zur LAUFZEIT muss der echte Wert per -e gesetzt werden.

# --- Abhängigkeiten (volles Debian-Image: Build-Tools für native Module) ----
FROM node:22-bookworm AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# --- Build ------------------------------------------------------------------
FROM node:22-bookworm AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG APP_SECRET=docker-build-dummy-mindestens-32-zeichen
ARG SITE_URL=https://www.nexoit.de
ENV APP_SECRET=$APP_SECRET \
    SITE_URL=$SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Laufzeit ---------------------------------------------------------------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./
# SQLite-Datenverzeichnis (DATABASE_PATH=./data/nexo.db) für den node-User.
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
EXPOSE 3100
# Bindet bewusst an 0.0.0.0 (das npm-start-Skript nutzt 127.0.0.1 für PM2).
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3100"]
