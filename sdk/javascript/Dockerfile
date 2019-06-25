FROM 10.16.0-alpine

WORKDIR /open-oracle-reporter
ADD ./package.json /open-oracle-reporter/package.json
RUN yarn install

ADD . /open-oracle-reporter
RUN tsc

CMD node ./.tsbuilt/open-oracle-reporter
