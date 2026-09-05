FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
