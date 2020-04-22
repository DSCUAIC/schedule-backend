FROM node:13 AS base
WORKDIR /app

COPY . /app

RUN npm install
RUN npm run lint
RUN npm run depcheck

EXPOSE 3000
CMD [ "npm", "start" ]