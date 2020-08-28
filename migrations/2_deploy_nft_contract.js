const NFTContract = artifacts.require("NFT_contract");
const { MichelsonMap } = require("@taquito/taquito");
const { alice } = require("../scripts/sandbox/accounts");

const initialStorage = {
  ledger: new MichelsonMap(),
  operators: new MichelsonMap(),
  token_metadata: new MichelsonMap(),
  revenues: new MichelsonMap(),
  market_fee: 0,
  admin: alice.pkh
};

module.exports = async (deployer, _network, accounts) => {
  deployer.deploy(NFTContract, initialStorage);
};
