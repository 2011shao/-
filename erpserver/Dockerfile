FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm run build

EXPOSE 3000
CMD ["sh", "-c", "npx prisma generate && node dist/main.js"]
