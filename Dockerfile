FROM ethereum/solc:0.5.9-alpine
WORKDIR /open-oracle
RUN apk update && apk add --no-cache --virtual .gyp \
	python \
	make \
	g++ \
	yarn \
	nodejs \
	git

RUN yarn global add node-gyp npx
COPY package.json package.json

RUN yarn install

ENV PROVIDER PROVIDER
ADD contracts contracts

ENTRYPOINT /bin/sh
CMD sleep 99999999
