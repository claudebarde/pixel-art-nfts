const NFTContract = artifacts.require("NFT_contract");
const { MichelsonMap } = require("@taquito/taquito");
const { alice } = require("../scripts/sandbox/accounts");
const faucet = require("../faucet");

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
  ledger: MichelsonMap.fromLiteral({
    QmdKXDDq7YG9QG8nVHep6pW4ZXEXk8kLtZz9oirv7sj4n8:
      "tz1hFciGufScRQ69smtfoRRZh5QHmv1QdnEg",
    QmayaQ8xiprjyK7TbLQdkeaqAWo4RwYJt3fe9uwTsLcDkh:
      "tz1PkRD7XSUztwMWAcsHcMybGaShvVkTaoEb"
  }),
  operators: new MichelsonMap(),
  token_metadata: MichelsonMap.fromLiteral({
    QmdKXDDq7YG9QG8nVHep6pW4ZXEXk8kLtZz9oirv7sj4n8: makeTokenMetadata(
      "QmdKXDDq7YG9QG8nVHep6pW4ZXEXk8kLtZz9oirv7sj4n8",
      "bear?",
      50000000,
      true,
      "cdaab47f095b36f0a01540abfd63643e5ab2eb1fa1cbe98d4a5861f656b60ac4",
      "tz1hFciGufScRQ69smtfoRRZh5QHmv1QdnEg",
      "1599728287968"
    ),
    QmayaQ8xiprjyK7TbLQdkeaqAWo4RwYJt3fe9uwTsLcDkh: makeTokenMetadata(
      "QmayaQ8xiprjyK7TbLQdkeaqAWo4RwYJt3fe9uwTsLcDkh",
      "Floralie",
      0,
      true,
      "762bbf7796d83dcc4ae9cf5c21608680a1f24495da1502f3271d918b3d25bf0c",
      "tz1PkRD7XSUztwMWAcsHcMybGaShvVkTaoEb",
      "1599678350931"
    )
  }),
  revenues: new MichelsonMap(),
  market_fee: 0,
  admin: faucet.pkh,
  revenue_from_fee: 0,
  token_format_checker: { check: true, initial: "Qm", length: 46 },
  pause: false
};

/*const initialStorage = {
  ledger: new MichelsonMap(),
  operators: new MichelsonMap(),
  token_metadata: new MichelsonMap(),
  revenues: new MichelsonMap(),
  market_fee: 100000,
  admin: alice.pkh,
  revenue_from_fee: 0,
  token_format_checker: { check: true, initial: "Qm", length: 46 },
  pause: false
};*/

module.exports = async (deployer, _network, accounts) => {
  deployer.deploy(NFTContract, initialStorage);
};
