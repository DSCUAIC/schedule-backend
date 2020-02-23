FROM node:13 AS base
WORKDIR /app

COPY . /app

RUN npm install
RUN npm run lint
RUN npm run depcheck
RUN npm run test --if-present

EXPOSE 3000
CMD [ "npm", "start" ]