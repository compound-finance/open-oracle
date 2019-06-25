
ganache-cli
saddle deploy OpenOraclePriceData
saddle deploy 

npx open-oracle-reporter 

# Run ganache
docker run ganache-core

# Deploy the open oracle
docker run -f .
docker exec -- npx saddle deploy OpenOraclePriceData
docker exec -- npx saddle deploy OpenOracleView

# Run a pricer node
docker run -f sdk/javascript -e private_key=blah

# Run a poster node
docker run -f poster

# Read from