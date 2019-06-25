FROM ethereum/solc:0.5.9-alpine

WORKDIR /open-oracle
ADD ./package.json /open-oracle/package.json
RUN yarn install

ENV PROVIDER PROVIDER
ADD ./contracts /open-oracle/contracts

RUN saddle deploy OpenOraclePriceData
RUN saddle deploy OpenOracleView

CMD /bin/sh