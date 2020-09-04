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
  ledger: MichelsonMap.fromLiteral({
    QmWsZdTAaj7CVzk5uKta5wyrsGZ1ESEmt3s2FdrrfkquKH:
      "tz1NT6pWBL7VKaR6B46Ugo9jmcU4rXdJxb5f",
    QmWYnKXwy1HYAjbgsSvViyRonZ1kSddoghYRTpiWqykKix:
      "tz1NT6pWBL7VKaR6B46Ugo9jmcU4rXdJxb5f",
    QmYa3yiDkvWGCJzAo7raYUe5M4hihH6PAyrz9nHo4hvxGA:
      "tz1NT6pWBL7VKaR6B46Ugo9jmcU4rXdJxb5f",
    QmQ59NtzgW5x3gUvhoGc8TZb8Q9j41EVQZFdpXixjqxkce:
      "tz1NhNv9g7rtcjyNsH8Zqu79giY5aTqDDrzB",
    QmT3o46MhGfA7DQKFipkbkBw4UTc2M4E63V9B2F7WkJbGp:
      "tz1NhNv9g7rtcjyNsH8Zqu79giY5aTqDDrzB",
    QmbEqeRYYWMnTrdvb1ezk3N1M3Kjn7QXEazTkMde1D4jpo:
      "tz1Me1MGhK7taay748h4gPnX2cXvbgL6xsYL",
    QmSQmzZGY85wKmakPUWHoTquTNMudvmLAjeh3kE7kk31MW:
      "tz1NhNv9g7rtcjyNsH8Zqu79giY5aTqDDrzB"
  }),
  operators: new MichelsonMap(),
  token_metadata: MichelsonMap.fromLiteral({
    QmWsZdTAaj7CVzk5uKta5wyrsGZ1ESEmt3s2FdrrfkquKH: makeTokenMetadata(
      "QmWsZdTAaj7CVzk5uKta5wyrsGZ1ESEmt3s2FdrrfkquKH",
      "NotMario",
      20000000,
      true,
      "690087cc74fa5266369a8c85785812830c42093a2ed72d9a656f1cf4332694b0",
      "tz1NT6pWBL7VKaR6B46Ugo9jmcU4rXdJxb5f",
      "1599168687910"
    ),
    QmWYnKXwy1HYAjbgsSvViyRonZ1kSddoghYRTpiWqykKix: makeTokenMetadata(
      "QmWsZdTAaj7CVzk5uKta5wyrsGZ1ESEmt3s2FdrrfkquKH",
      "NotMario",
      20000000,
      true,
      "690087cc74fa5266369a8c85785812830c42093a2ed72d9a656f1cf4332694b0",
      "tz1NT6pWBL7VKaR6B46Ugo9jmcU4rXdJxb5f",
      "1599168574453"
    ),
    QmYa3yiDkvWGCJzAo7raYUe5M4hihH6PAyrz9nHo4hvxGA: makeTokenMetadata(
      "QmYa3yiDkvWGCJzAo7raYUe5M4hihH6PAyrz9nHo4hvxGA",
      "Goober Gus",
      3000000,
      true,
      "2a2b56205b9c491e43d78b84cb804a1d1247218c568c50a2ecf0c8cf9cc116de",
      "tz1i1XHHr2J85FRs15g2Sax81WSuuiJTFXj4",
      "1598979144719"
    ),
    QmQ59NtzgW5x3gUvhoGc8TZb8Q9j41EVQZFdpXixjqxkce: makeTokenMetadata(
      "QmQ59NtzgW5x3gUvhoGc8TZb8Q9j41EVQZFdpXixjqxkce",
      "Pixel Taco",
      6000000,
      true,
      "0288bbe5caa1992afd0bc13e25cb9571d660e4542a12c76fdb2c4679eb7edb5d",
      "",
      "tz1NhNv9g7rtcjyNsH8Zqu79giY5aTqDDrzB",
      "1599127932974"
    ),
    QmT3o46MhGfA7DQKFipkbkBw4UTc2M4E63V9B2F7WkJbGp: makeTokenMetadata(
      "QmT3o46MhGfA7DQKFipkbkBw4UTc2M4E63V9B2F7WkJbGp",
      "firt artwork",
      5000000,
      true,
      "19cea4883b9b920d2caa9362bf4ce483c3f049bb7b17e015616cb48eac9d36fc",
      "tz1NhNv9g7rtcjyNsH8Zqu79giY5aTqDDrzB",
      "1598691785317"
    ),
    QmbEqeRYYWMnTrdvb1ezk3N1M3Kjn7QXEazTkMde1D4jpo: makeTokenMetadata(
      "QmbEqeRYYWMnTrdvb1ezk3N1M3Kjn7QXEazTkMde1D4jpo",
      "smiley face",
      2000000,
      false,
      "d9b042a9c8d234ab339fdd25245458ccbefbc21ab123bb1b14552ea6ab57031c",
      "tz1Me1MGhK7taay748h4gPnX2cXvbgL6xsYL",
      "1598877885345"
    ),
    QmSQmzZGY85wKmakPUWHoTquTNMudvmLAjeh3kE7kk31MW: makeTokenMetadata(
      "QmSQmzZGY85wKmakPUWHoTquTNMudvmLAjeh3kE7kk31MW",
      "Taquito",
      3000000,
      true,
      "581ab36f1572e3bdda279083059d2cb8ddade804dadf5dad582ee3e2f8c2c1c6",
      "tz1NhNv9g7rtcjyNsH8Zqu79giY5aTqDDrzB",
      "1598776065825"
    )
  }),
  revenues: MichelsonMap.fromLiteral({
    tz1i1XHHr2J85FRs15g2Sax81WSuuiJTFXj4: 3000000,
    tz1Me1MGhK7taay748h4gPnX2cXvbgL6xsYL: 5000000,
    tz1NhNv9g7rtcjyNsH8Zqu79giY5aTqDDrzB: 5000000
  }),
  market_fee: 0,
  admin: alice.pkh,
  revenue_from_fee: 0
};

module.exports = async (deployer, _network, accounts) => {
  deployer.deploy(NFTContract, initialStorage);
};
