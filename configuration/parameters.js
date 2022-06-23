module.exports = [
  "150000000000000000",
  1800,
  [
    {
      // "NAME": "ETH",
      cToken: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
      underlying: "0x0000000000000000000000000000000000000000",
      symbolHash: "0xaaaebeba3810b1e6b70781f14b2d72c1cb89c0b2b320c43bb67ff79f562f5ff4",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
      reporter: "0x264BDDFD9D93D48d759FBDB0670bE1C6fDd50236",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: true
    },
    {
      // "NAME": "DAI",
      cToken: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
      underlying: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbolHash: "0xa5e92f3efb6826155f1f728e162af9d7cda33a574a1153b58f03ea01cc37e568",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8",
      reporter: "0xb2419f587f497CDd64437f1B367E2e80889631ea",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: false
    },
    {
      // "NAME": "USDC",
      cToken: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
      underlying: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbolHash: "0xd6aca1be9729c13d677335161321649cccae6a591554772516700f986f942eaa",
      baseUnit: "1000000",
      priceSource: "1",
      fixedPrice: "1000000",
      uniswapMarket: "0x0000000000000000000000000000000000000000",
      reporter: "0x0000000000000000000000000000000000000000",
      reporterMultiplier: "1",
      isUniswapReversed: false
    },
    {
      // "NAME": "USDT",
      cToken: "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9",
      underlying: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbolHash: "0x8b1a1d9c2b109e527c9134b25b1a1833b16b6594f92daa9f6d9b7a6024bce9d0",
      baseUnit: "1000000",
      priceSource: "1",
      fixedPrice: "1000000",
      uniswapMarket: "0x0000000000000000000000000000000000000000",
      reporter: "0x0000000000000000000000000000000000000000",
      reporterMultiplier: "1",
      isUniswapReversed: false
    },
    {
      // "NAME": "WBTCv2",
      cToken: "0xccf4429db6322d5c611ee964527d42e5d685dd6a",
      underlying: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbolHash: "0xe98e2830be1a7e4156d656a7505e65d08c67660dc618072422e9c78053c261e9",
      baseUnit: "100000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
      reporter: "0x4846efc15CC725456597044e6267ad0b3B51353E",
      reporterMultiplier: "1000000",
      isUniswapReversed: false
    },
    {
      // "NAME": "BAT",
      cToken: "0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E",
      underlying: "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
      symbolHash: "0x3ec6762bdf44eb044276fec7d12c1bb640cb139cfd533f93eeebba5414f5db55",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0xae614a7a56cb79c04df2aeba6f5dab80a39ca78e",
      reporter: "0xeBa6F33730B9751a8BA0b18d9C256093E82f6bC2",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: false
    },
    {
      // "NAME": "ZRX",
      cToken: "0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407",
      underlying: "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
      symbolHash: "0xb8612e326dd19fc983e73ae3bc23fa1c78a3e01478574fa7ceb5b57e589dcebd",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0x14424eeecbff345b38187d0b8b749e56faa68539",
      reporter: "0x5c5db112c98dbe5977A4c37AD33F8a4c9ebd5575",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: true
    },
    {
      // "NAME": "REP",
      // Warning: as of 2021-09-13, this has very low liquidity ($33.6k)
      cToken: "0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1",
      underlying: "0x1985365e9f78359a9B6AD760e32412f4a445E862",
      symbolHash: "0x91a08135082b0a28b4ad8ecc7749a009e0408743a9d1cdf34dd6a58d60ee9504",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0xb055103b7633b61518cd806d95beeb2d4cd217e7",
      reporter: "0x90655316479383795416B615B61282C72D8382C1",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: false
    },
    {
      // "NAME": "SAI",
      cToken: "0xF5DCe57282A584D2746FaF1593d3121Fcac444dC",
      underlying: "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359",
      symbolHash: "0x4dcbfd8d7239a822743634e138b90febafc5720cec2dbdc6a0e5a2118ba2c532",
      baseUnit: "1000000000000000000",
      priceSource: "0",
      fixedPrice: "5285000000000000",
      uniswapMarket: "0x0000000000000000000000000000000000000000",
      reporter: "0x0000000000000000000000000000000000000000",
      reporterMultiplier: "1",
      isUniswapReversed: false
    },
    {
      // "NAME": "UNI",
      cToken: "0x35A18000230DA775CAc24873d00Ff85BccdeD550",
      underlying: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      symbolHash: "0xfba01d52a7cd84480d0573725899486a0b5e55c20ff45d6628874349375d1650",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801",
      reporter: "0x70f4D236FD678c9DB41a52d28f90E299676d9D90",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: false
    },
    {
      // "NAME": "COMP",
      cToken: "0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4",
      underlying: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
      symbolHash: "0xb6dbcaeee318e11fe1e87d4af04bdd7b4d6a3f13307225dc7ee72f7c085ab454",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0xea4ba4ce14fdd287f380b55419b1c5b6c3f22ab6",
      reporter: "0xE270B8E9d7a7d2A7eE35a45E43d17D56b3e272b1",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: false
    },
    {
      // "NAME": "LINK",
      cToken: "0xFAce851a4921ce59e912d19329929CE6da6EB0c7",
      underlying: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      symbolHash: "0x921a3539bcb764c889432630877414523e7fbca00c211bc787aeae69e2e3a779",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0xa6cc3c2531fdaa6ae1a3ca84c2855806728693e8",
      reporter: "0xBcFd9b1a97cCD0a3942f0408350cdc281cDCa1B1",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: false
    },
    {
      // "NAME": "TUSD",
      cToken: "0x12392F67bdf24faE0AF363c24aC620a2f67DAd86",
      underlying: "0x0000000000085d4780B73119b644AE5ecd22b376",
      symbolHash: "0xa1b8d8f7e538bb573797c963eeeed40d0bcb9f28c56104417d0da1b372ae3051",
      baseUnit: "1000000000000000000",
      priceSource: "1",
      fixedPrice: "1000000",
      uniswapMarket: "0x0000000000000000000000000000000000000000",
      reporter: "0x0000000000000000000000000000000000000000",
      reporterMultiplier: "1",
      isUniswapReversed: false
    },
    {
      // "NAME": "AAVE",
      cToken: "0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c",
      underlying: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      symbolHash: "0xde46fbfa339d54cd65b79d8320a7a53c78177565c2aaf4c8b13eed7865e7cfc8",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0x5ab53ee1d50eef2c1dd3d5402789cd27bb52c1bb",
      reporter: "0x0238247E71AD0aB272203Af13bAEa72e99EE7c3c",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: false
    },
    {
      // "NAME": "SUSHI",
      cToken: "0x4B0181102A0112A2ef11AbEE5563bb4a3176c9d7",
      underlying: "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
      symbolHash: "0xbbf304add43db0a05d104474683215530b076be1dfdf72a4d53a1e443d8e4c21",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0x73a6a761fe483ba19debb8f56ac5bbf14c0cdad1",
      reporter: "0x1A6aA40170118bAf36BAc82214DC5681Af69b0cF",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: false
    },
    {
      // "NAME": "MKR",
      cToken: "0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b",
      underlying: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
      symbolHash: "0xec76ec3a7e5f010a9229e69fa1945af6f0c6cc5b0a625bf03bd6381222192020",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0xe8c6c9227491c0a8156a0106a0204d881bb7e531",
      reporter: "0xbA895504a8E286691E7dacFb47ae8A3A737e2Ce1",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: false
    },
    {
      // "NAME": "YFI",
      cToken: "0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946",
      underlying: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
      symbolHash: "0xec34391362c28ee226b3b8624a699ee507a40fa771fd01d38b03ac7b70998bbe",
      baseUnit: "1000000000000000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0x04916039b1f59d9745bf6e0a21f191d1e0a84287",
      reporter: "0xBa4319741782151D2B1df4799d757892EFda4165",
      reporterMultiplier: "10000000000000000",
      isUniswapReversed: false
    },
    {
      // "NAME": "WBTC",
      cToken: "0xC11b1268C1A384e55C48c2391d8d480264A3A7F4",
      underlying: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbolHash: "0xe98e2830be1a7e4156d656a7505e65d08c67660dc618072422e9c78053c261e9",
      baseUnit: "100000000",
      priceSource: "2",
      fixedPrice: "0",
      uniswapMarket: "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
      reporter: "0x4846efc15CC725456597044e6267ad0b3B51353E",
      reporterMultiplier: "1000000",
      isUniswapReversed: false
    }
  ]
]