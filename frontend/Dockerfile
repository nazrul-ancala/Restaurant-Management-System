FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV HOST=0.0.0.0
ENV WDS_SOCKET_PORT=0
EXPOSE 3000

CMD ["npm", "start"]
