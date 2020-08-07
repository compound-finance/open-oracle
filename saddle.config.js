
module.exports = {
  // solc: "solc",                                         // Solc command to run
  // solc_args: [],                                        // Extra solc args
  build_dir: process.env['SADDLE_BUILD'] || ".build",      // Directory to place built contracts
  contracts: process.env['SADDLE_CONTRACTS'] || "contracts/*.sol contracts/**/*.sol tests/contracts/*.sol",  // Glob to match contract files
  tests: ['**/tests/*Test.js'],                         // Glob to match test files
  networks: {                                           // Define configuration for each network
    ropsten: {
      providers: [
        {env: "PROVIDER"},
        {file: "~/.ethereum/ropsten-url"},                    // Load from given file with contents as the URL (e.g. https://infura.io/api-key)
      ],
      web3: {
        gas: [
          {env: "GAS"},
          {default: "8000000"}
        ],
        gas_price: [
          {env: "GAS_PRICE"},
          {default: "12000000000"}
        ],
        options: {
          transactionConfirmationBlocks: 1,
          transactionBlockTimeout: 5
        }
      },
      accounts: [
        {env: "ACCOUNT"},
        {file: "~/.ethereum/ropsten"}                         // Load from given file with contents as the private key (e.g. 0x...)
      ]
    },
    development: {
      providers: [                                      // How to load provider (processed in order)
        { env: "PROVIDER" },                              // Try to load Http provider from `PROVIDER` env variable (e.g. env PROVIDER=http://...)
        { http: "http://127.0.0.1:8545" }                 // Fallback to localhost provider
      ],
      web3: {                                           // Web3 options for immediate confirmation in development mode
        gas: [
          { env: "GAS" },
          { default: "4600000" }
        ],
        gas_price: [
          { env: "GAS_PRICE" },
          { default: "12000000000" }
        ],
        options: {
          transactionConfirmationBlocks: 1,
          transactionBlockTimeout: 5
        }
      },
      accounts: [                                       // How to load default account for transactions
        { env: "ACCOUNT" },                               // Load from `ACCOUNT` env variable (e.g. env ACCOUNT=0x...)
        { unlocked: 0 }                                   // Else, try to grab first "unlocked" account from provider
      ]
    },
    test: {
      providers: [
        { env: "PROVIDER" },
        {
          ganache: {
            gasLimit: 80000000
          }
        },                                  // In test mode, connect to a new ganache provider. Any options will be passed to ganache
      ],
      web3: {
        gas: [
          { env: "GAS" },
          { default: "8000000" }
        ],
        gas_price: [
          { env: "GAS_PRICE" },
          { default: "12000000000" }
        ],
        options: {
          transactionConfirmationBlocks: 1,
          transactionBlockTimeout: 5
        }
      },
      accounts: [
        { env: "ACCOUNT" },
        { unlocked: 0 }
      ]
    },
    rinkeby: {
      providers: [
        { env: "PROVIDER" },
        { file: "~/.ethereum/rinkeby-url" },              // Load from given file with contents as the URL (e.g. https://infura.io/api-key)
        { http: "https://rinkeby-eth.compound.finance" }
      ],
      web3: {
        gas: [
          { env: "GAS" },
          { default: "4600000" }
        ],
        gas_price: [
          { env: "GAS_PRICE" },
          { default: "12000000000" }
        ],
        options: {
          transactionConfirmationBlocks: 1,
          transactionBlockTimeout: 5
        }
      },
      accounts: [
        { env: "ACCOUNT" },
        { file: "~/.ethereum/rinkeby" }                   // Load from given file with contents as the private key (e.g. 0x...)
      ]
    },
    mainnet: {
      providers: [
        { env: "PROVIDER" },
        { file: "~/.ethereum/mainnet-url" },              // Load from given file with contents as the URL (e.g. https://infura.io/api-key)
        { http: "https://mainnet-eth.compound.finance" }
      ],
      web3: {
        gas: [
          { env: "GAS" },
          { default: "4600000" }
        ],
        gas_price: [
          { env: "GAS_PRICE" },
          { default: "6000000000" }
        ],
        options: {
          transactionConfirmationBlocks: 1,
          transactionBlockTimeout: 5
        }
      },
      accounts: [
        { env: "ACCOUNT" },
        { file: "~/.ethereum/mainnet" }                   // Load from given file with contents as the private key (e.g. 0x...)
      ]
    }
  }
};
