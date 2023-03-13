FROM node:latest

WORKDIR /home/sumer/Documents/Projects/jwt

COPY packege*.json  ./

COPY . .

RUN yarn install

EXPOSE 3000

CMD [ "yarn", "start" ]
