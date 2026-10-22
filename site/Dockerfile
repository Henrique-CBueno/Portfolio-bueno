# Contêiner que constrói o site: roda o build do Astro lendo a API e refaz quando a API pede.
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENV ASTRO_TELEMETRY_DISABLED=1
CMD ["sh", "/app/docker/construir.sh"]
