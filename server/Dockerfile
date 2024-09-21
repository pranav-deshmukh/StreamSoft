FROM node:18-alpine
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["node", "index.js"]
