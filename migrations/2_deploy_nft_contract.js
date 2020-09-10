const NFTContract = artifacts.require("NFT_contract");
const { MichelsonMap } = require("@taquito/taquito");
const { alice } = require("../scripts/sandbox/accounts");

/*const initialStorage = {
  ledger: new MichelsonMap(),
  operators: new MichelsonMap(),
  token_metadata: new MichelsonMap(),
  revenues: new MichelsonMap(),
  market_fee: 1000000,
  admin: alice.pkh,
  revenue_from_fee: 0
};*/

const makeTokenMetadata = (
  token_id,
  name,
  price,
  market,
  canvasHash,
  createdBy,
  createdOn
) => ({
  token_id,
  symbol: "PXNFT",
  name,
  decimals: 0,
  price,
  market,
  extras: MichelsonMap.fromLiteral({
    canvasHash,
    createdBy,
    createdOn
  })
});

const initialStorage = {
  ledger: new MichelsonMap(),
  operators: new MichelsonMap(),
  token_metadata: new MichelsonMap(),
  revenues: new MichelsonMap(),
  market_fee: 100000,
  admin: alice.pkh,
  revenue_from_fee: 0,
  token_format_checker: { check: true, initial: "Qm", length: 46 },
  pause: false
};

module.exports = async (deployer, _network, accounts) => {
  deployer.deploy(NFTContract, initialStorage);
};
