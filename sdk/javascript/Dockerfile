FROM node:13.6.0-alpine3.10

WORKDIR /open-oracle-reporter
ADD package.json /open-oracle-reporter/package.json
RUN yarn install --ignore-scripts

ADD . /open-oracle-reporter
RUN yarn prepare

CMD yarn start
