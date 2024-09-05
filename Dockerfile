FROM node:22-slim

WORKDIR /usr/src/app

COPY package*.json ./
COPY tmp/db.sqlite3 ./tmp/db.sqlite3

RUN npm install -g pnpm
RUN pnpm install

#COPY .env ./

COPY . .

EXPOSE 3333

ENV PORT=3333
ENV HOST=0.0.0.0

# Commande pour démarrer l'application
CMD [ "node", "server.js" ]
