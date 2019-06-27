FROM node:current-alpine

WORKDIR /open-oracle-poster
ADD package.json /open-oracle-poster/package.json
RUN npm install

ADD . /open-oracle-poster
RUN npx tsc

CMD npm run start
