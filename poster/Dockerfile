FROM node:current-alpine

RUN apk update && apk add --no-cache --virtual .gyp \
    python \
    make \
    g++ \
    yarn \
    nodejs \
    git

WORKDIR /open-oracle-poster
RUN yarn global add node-gyp npx
ADD package.json /open-oracle-poster/package.json
RUN yarn install

ADD . /open-oracle-poster
RUN npx tsc

CMD yarn start
