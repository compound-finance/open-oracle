FROM node:13.6.0-alpine3.10

WORKDIR /open-oracle-reporter
ADD package.json /open-oracle-reporter/package.json
RUN yarn install

ADD . /open-oracle-reporter
RUN npx tsc

CMD yarn start
