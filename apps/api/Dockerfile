FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci

COPY apps/api apps/api

RUN npm run build -w apps/api

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci --omit=dev --workspace apps/api --include-workspace-root=false && npm cache clean --force

COPY --from=build /app/apps/api/dist apps/api/dist
COPY docs/atlas docs/atlas
COPY docs/Health_Atlas_Research_Suite_Complete_2026 docs/Health_Atlas_Research_Suite_Complete_2026
COPY docs/*.pdf docs/
COPY skills skills

EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]
