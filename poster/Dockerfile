FROM node:13.12.0-alpine3.11

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
