FROM node:8.10

RUN npm install --global yarn http-server

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . ./

RUN yarn build:openshift

RUN mv /usr/src/app/public /app && find /usr/src/app -delete

EXPOSE 8080
WORKDIR /app

CMD ["http-server", "/app"]
