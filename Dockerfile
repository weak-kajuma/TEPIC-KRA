FROM node:16

WORKDIR /app

COPY ./package.json /app/

RUN npm install --only=production

COPY . .

CMD [ "node", "index.js" ]