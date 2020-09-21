export default {
  ENV: "carthagenet", // dev | carthagenet | mainnet
  NETLIFY_PORT: 58622,
  CONTRACT: {
    dev: "KT19T89LoroCRbNWGDF4XyVeYTX9BUPcAv44",
    carthagenet: "KT1C6fERZuDjYQT5tUuo9hQje9GbW9VsQ3AH",
    // previous address: "KT1EMMC23fiszGUvikWLemrWhLNRBSiYCFD7",
    mainnet: ""
  },
  NETWORK: {
    dev: "http://localhost:8732",
    carthagenet: "https://testnet-tezos.giganode.io",
    mainnet: "https://mainnet-tezos.giganode.io"
  },
  LEDGER_ID: 17140,
  // previous id on CTHG: 16420,
  TOKEN_METADATA_ID: 17143,
  // previous id on CTHG: 16423
  version: "1.10.0"
};
