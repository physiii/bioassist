FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci

COPY . .

RUN npm run build -w apps/api

EXPOSE 4000

CMD ["npm", "run", "start", "-w", "apps/api"]
