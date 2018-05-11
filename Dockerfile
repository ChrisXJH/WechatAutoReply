FROM node:alpine

WORKDIR /usr/src/wechat_auto_reply

COPY package*.json ./

RUN npm install

COPY src src

EXPOSE 4000

CMD ["npm", "start"]
