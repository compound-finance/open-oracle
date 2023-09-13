FROM node:20.6.0-bookworm-slim

RUN apk update && apk add --no-cache --virtual .gyp \
    python \
    make \
    g++ \
    yarn \
    nodejs \
    git

WORKDIR /open-oracle-poster
RUN yarn global add node-gyp npx
ADD yarn.lock package.json /open-oracle-poster/
ADD . /open-oracle-poster
RUN yarn install --frozen-lockfile

CMD yarn start
