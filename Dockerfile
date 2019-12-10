FROM ethereum/solc:0.5.12-alpine
WORKDIR /open-oracle
RUN apk update && apk add --no-cache --virtual .gyp \
    python \
    make \
    g++ \
    yarn \
    nodejs \
    git

RUN yarn global add node-gyp npx
COPY package.json /open-oracle/package.json

RUN yarn install

ENV PROVIDER PROVIDER
ADD contracts contracts
RUN npx saddle compile

ENTRYPOINT []
CMD npx saddle
