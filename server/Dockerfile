FROM node:18-alpine
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN node index.js

EXPOSE 8000

