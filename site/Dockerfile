# Contêiner que constrói o site: roda o build (Vite + prerender do React) lendo a API e refaz quando a API pede.
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
CMD ["sh", "/app/docker/construir.sh"]
