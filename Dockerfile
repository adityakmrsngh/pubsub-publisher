# Etapa de build
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime mínimo
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
ENV NODE_ENV=production

# Copiar archivos de la aplicación
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Variables de entorno requeridas (deben ser proporcionadas en runtime)
ENV GOOGLE_CLOUD_PROJECT="keen-airlock-469010-i0"
ENV TOPIC_ID="message-processing-inbound-queue"

# Para autenticación con service account key file (opcional)
# ENV GOOGLE_APPLICATION_CREDENTIALS=""

# Para autenticación con JSON en variable de entorno (opcional)
# ENV GOOGLE_CREDENTIALS=""

USER nonroot
CMD ["dist/index.js"]
