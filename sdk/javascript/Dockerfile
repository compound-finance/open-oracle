FROM node:current-alpine

WORKDIR /open-oracle-reporter
ADD package.json /open-oracle-reporter/package.json
RUN yarn install

ADD . /open-oracle-reporter
RUN npx tsc

CMD yarn start
