export type TokenConfig = {
  // The address of the Compound Token
  cToken: string;
  // The number of smallest units of measurement in a single whole unit.
  baseUnit: string;
  // Address to Chainlink feed used for asset price
  priceFeed: string;
};

const parameters: TokenConfig[] = [
  {
    // "NAME": "ETH",
    cToken: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
    baseUnit: "1000000000000000000",
    priceFeed: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
  },
  {
    // "NAME": "DAI",
    cToken: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
    baseUnit: "1000000000000000000",
    priceFeed: "0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9",
  },
  {
    // "NAME": "USDC",
    cToken: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
    baseUnit: "1000000",
    priceFeed: "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6",
  },
  {
    // "NAME": "USDT",
    cToken: "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9",
    baseUnit: "1000000",
    priceFeed: "0x3e7d1eab13ad0104d2750b8863b489d65364e32d",
  },
  {
    // "NAME": "WBTCv2",
    cToken: "0xccf4429db6322d5c611ee964527d42e5d685dd6a",
    baseUnit: "100000000",
    priceFeed: "0x45939657d1CA34A8FA39A924B71D28Fe8431e581", // Custom Compound Feed
  },
  {
    // "NAME": "BAT",
    cToken: "0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E",
    baseUnit: "1000000000000000000",
    priceFeed: "0x9441D7556e7820B5ca42082cfa99487D56AcA958",
  },
  {
    // "NAME": "ZRX",
    cToken: "0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407",
    baseUnit: "1000000000000000000",
    priceFeed: "0x2885d15b8af22648b98b122b22fdf4d2a56c6023",
  },
  {
    // "NAME": "UNI",
    cToken: "0x35A18000230DA775CAc24873d00Ff85BccdeD550",
    baseUnit: "1000000000000000000",
    priceFeed: "0x553303d460ee0afb37edff9be42922d8ff63220e",
  },
  {
    // "NAME": "COMP",
    cToken: "0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4",
    baseUnit: "1000000000000000000",
    priceFeed: "0xdbd020caef83efd542f4de03e3cf0c28a4428bd5",
  },
  {
    // "NAME": "LINK",
    cToken: "0xFAce851a4921ce59e912d19329929CE6da6EB0c7",
    baseUnit: "1000000000000000000",
    priceFeed: "0x2c1d072e956affc0d435cb7ac38ef18d24d9127c",
  },
  {
    // "NAME": "TUSD",
    cToken: "0x12392F67bdf24faE0AF363c24aC620a2f67DAd86",
    baseUnit: "1000000000000000000",
    priceFeed: "0xec746ecf986e2927abd291a2a1716c940100f8ba",
  },
  {
    // "NAME": "AAVE",
    cToken: "0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c",
    baseUnit: "1000000000000000000",
    priceFeed: "0x547a514d5e3769680ce22b2361c10ea13619e8a9",
  },
  {
    // "NAME": "SUSHI",
    cToken: "0x4B0181102A0112A2ef11AbEE5563bb4a3176c9d7",
    baseUnit: "1000000000000000000",
    priceFeed: "0xcc70f09a6cc17553b2e31954cd36e4a2d89501f7",
  },
  {
    // "NAME": "MKR",
    cToken: "0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b",
    baseUnit: "1000000000000000000",
    priceFeed: "0xec1d1b3b0443256cc3860e24a46f108e699484aa",
  },
  {
    // "NAME": "YFI",
    cToken: "0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946",
    baseUnit: "1000000000000000000",
    priceFeed: "0xa027702dbb89fbd58938e4324ac03b58d812b0e1",
  },
  {
    // "NAME": "USDP",
    cToken: "0x041171993284df560249B57358F931D9eB7b925D",
    baseUnit: "1000000000000000000",
    priceFeed: "0x09023c0da49aaf8fc3fa3adf34c6a7016d38d5e3",
  },
  {
    // "NAME": "MATIC",
    cToken: "0x944dd1c7ce133b75880cee913d513f8c07312393",
    baseUnit: "1000000000000000000",
    priceFeed: "0x7bac85a8a13a4bcd8abb3eb7d6b4d632c5a57676",
  },
];

export default parameters;
