const { MichelsonMap, Tezos } = require("@taquito/taquito");
const { alice, bob } = require("../scripts/sandbox/accounts");
const setup = require("./setup");

contract("Pixel Art NFT Contract", () => {
  let storage;
  let fa2_address;
  let fa2_instance;
  let signerFactory;
  const tokenId = "Qma1dAWvTkmqgffVwqaUaPKcwUCDZ2MYnnqbSNRNTqeU2j";
  let tokenId2 = "Alice2ndToken";
  const tokenPrice = 10000000;

  before(async () => {
    const config = await setup();
    storage = config.storage;
    fa2_address = config.fa2_address;
    fa2_instance = config.fa2_instance;
    signerFactory = config.signerFactory;
    Tezos.setRpcProvider("http://localhost:8732");
  });

  it("Alice should be the admin", async () => {
    assert.equal(alice.pkh, storage.admin);
  });

  it("should mint 1 token for Alice", async () => {
    const tokenMetadata = {
      token_id: tokenId,
      symbol: "TQT",
      name: "Taquito",
      decimals: 0,
      price: tokenPrice,
      market: false,
      extras: new MichelsonMap()
    };

    try {
      const op = await fa2_instance.methods
        .mint_token(alice.pkh, ...Object.values(tokenMetadata))
        .send({ amount: storage.market_fee.toNumber(), mutez: true });
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    storage = await fa2_instance.storage();
    // checks if the token belongs to Alice
    const user = await storage.ledger.get(tokenMetadata.token_id);
    assert.equal(user, alice.pkh);
  });

  it("should prevent Bob from buying the token", async () => {
    await signerFactory(bob.sk);

    let err;

    try {
      const op = await fa2_instance.methods
        .buy_tokens([tokenId])
        .send({ amount: tokenPrice, mutez: true });
      await op.confirmation();
    } catch (error) {
      err = error.message;
    }

    assert.isDefined(err);
    assert.equal(err, "UNAVAILABLE_TO_PURCHASE");
  });

  it("should let Alice make the token available on the market", async () => {
    await signerFactory(alice.sk);

    let token = await storage.token_metadata.get(tokenId);
    assert.isFalse(token.market);

    try {
      const op = await fa2_instance.methods
        .update_token_status(tokenId, true)
        .send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    token = await storage.token_metadata.get(tokenId);
    assert.isTrue(token.market);
  });

  it("should let Bob buy Alice's token now", async () => {
    await signerFactory(bob.sk);

    try {
      const op = await fa2_instance.methods
        .buy_tokens([tokenId])
        .send({ amount: tokenPrice, mutez: true });
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    storage = await fa2_instance.storage();
    // asserts token's owner has changed
    const owner = await storage.ledger.get(tokenId);
    assert.equal(owner, bob.pkh);
    // asserts token's owner has been credited for the token price
    const credit = await storage.revenues.get(alice.pkh);
    assert.equal(credit, tokenPrice);
    // asserts token has been removed from market
    const token = await storage.token_metadata.get(tokenId);
    assert.isFalse(token.market);
  });

  it("should let Bob update the token status", async () => {
    // token status should be "false" after purchase
    let token = await storage.token_metadata.get(tokenId);
    assert.isFalse(token.market);

    try {
      const op = await fa2_instance.methods
        .update_token_status(tokenId, true)
        .send();
      await op.confirmation();
    } catch (error) {
      console.log();
    }

    storage = await fa2_instance.storage();
    token = await storage.token_metadata.get(tokenId);
    assert.isTrue(token.market);
  });

  it("should let Bob update token price", async () => {
    // checks if token price is still the original one
    let token = await storage.token_metadata.get(tokenId);
    assert.equal(token.price, tokenPrice);

    try {
      const op = await fa2_instance.methods
        .update_token_price(tokenId, tokenPrice * 2)
        .send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    storage = await fa2_instance.storage();
    token = await storage.token_metadata.get(tokenId);
    assert.equal(token.price, tokenPrice * 2);
  });

  it("should prevent Alice from updating the price of the token she owned", async () => {
    await signerFactory(alice.sk);
    let err;

    try {
      const op = await fa2_instance.methods
        .update_token_price(tokenId, tokenPrice * 3)
        .send();
      await op.confirmation();
    } catch (error) {
      err = error.message;
    }

    assert.isDefined(err);
    assert.equal(err, "FORBIDDEN_UPDATE");
  });

  it("should let Bob transfer manually the token to Alice", async () => {
    await signerFactory(bob.sk);

    try {
      const op = await fa2_instance.methods
        .transfer([
          {
            from_: bob.pkh,
            txs: [{ to_: alice.pkh, token_id: tokenId, amount: 1 }]
          }
        ])
        .send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    storage = await fa2_instance.storage();
    const owner = await storage.ledger.get(tokenId);
    assert.equal(owner, alice.pkh);
  });

  it("should mint another token for Alice and let Bob buy 2 tokens in 1 tx", async () => {
    // mints the token
    const tokenMetadata = {
      token_id: tokenId2,
      symbol: "TQT",
      name: "Taquito",
      decimals: 0,
      price: tokenPrice,
      market: true,
      extras: new MichelsonMap()
    };

    // should fail first because of wrong token format
    let err;

    try {
      const op = await fa2_instance.methods
        .mint_token(alice.pkh, ...Object.values(tokenMetadata))
        .send({ amount: storage.market_fee.toNumber(), mutez: true });
      await op.confirmation();
    } catch (error) {
      err = error.message;
    }

    assert.equal(err, "WRONG_TOKEN_FORMAT");

    tokenId2 = "QmPhiDWkwNpuJs3i8FjA4GV9vwnrZfm6g1isghavNBqZvy";
    tokenMetadata.token_id = tokenId2;

    try {
      const op = await fa2_instance.methods
        .mint_token(alice.pkh, ...Object.values(tokenMetadata))
        .send({ amount: storage.market_fee.toNumber(), mutez: true });
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    storage = await fa2_instance.storage();
    // checks if the token belongs to Alice
    const user = await storage.ledger.get(tokenMetadata.token_id);
    assert.equal(user, alice.pkh);

    await signerFactory(bob.sk);

    // Bob buys the 2 tokens in 1 transaction
    try {
      const op = await fa2_instance.methods
        .buy_tokens([tokenId, tokenId2])
        .send({ amount: tokenPrice + tokenPrice * 2, mutez: true });
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    storage = await fa2_instance.storage();
    const token1owner = await storage.ledger.get(tokenId);
    const token2owner = await storage.ledger.get(tokenId2);

    assert.equal(token1owner, bob.pkh);
    assert.equal(token2owner, bob.pkh);
  });

  it("should prevent Bob from burning Alice's token", async () => {
    // we transfer one of Bob's token to Alice
    await signerFactory(bob.sk);

    try {
      const op = await fa2_instance.methods
        .transfer([
          {
            from_: bob.pkh,
            txs: [{ to_: alice.pkh, token_id: tokenId, amount: 1 }]
          }
        ])
        .send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }
    storage = await fa2_instance.storage();
    // we test the burning function

    let err;

    try {
      const op = await fa2_instance.methods.burn_token(tokenId).send();
      await op.confirmation();
    } catch (error) {
      err = error.message;
    }

    assert.isDefined(err);
    assert.equal(err, "UNAUTHORIZED OPERATION");
  });

  it("should let Bob burn his own token", async () => {
    await signerFactory(bob.sk);

    // verifies the token is in the ledger
    const account = await storage.ledger.get(tokenId2);
    assert.equal(account, bob.pkh);

    try {
      const op = await fa2_instance.methods.burn_token(tokenId2).send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    storage = await fa2_instance.storage();
    let token;
    token = await storage.ledger.get(tokenId2);

    assert.isUndefined(token);
  });

  it("should let Alice withdraw her revenues from contract", async () => {
    await signerFactory(alice.sk);

    const contractBalance = await Tezos.tz.getBalance(fa2_address);
    const revenues = await storage.revenues.get(alice.pkh);

    try {
      const op = await fa2_instance.methods.withdraw_revenue([["unit"]]).send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    storage = await fa2_instance.storage();
    const newRevenues = await storage.revenues.get(alice.pkh);
    const newContractBalance = await Tezos.tz.getBalance(fa2_address);

    // Alice's revenues must be set to zero
    assert.equal(newRevenues.toNumber(), 0);
    // contract balance should be decreased by Alice's revenues
    assert.equal(
      newContractBalance.toNumber(),
      contractBalance.toNumber() - revenues.toNumber()
    );
  });

  it("should prevent Bob from withdrawing revenue from fees and let Alice", async () => {
    await signerFactory(bob.sk);

    assert.isAbove(storage.revenue_from_fee.toNumber(), 0);
    const aliceBalance = await Tezos.tz.getBalance(alice.pkh);

    let err;

    try {
      const op = await fa2_instance.methods
        .withdraw_revenue_from_fee([["unit"]])
        .send();
      await op.confirmation();
    } catch (error) {
      err = error.message;
    }

    assert.isDefined(err);
    assert.equal(err, "UNAUTHORIZED_OPERATION");

    await signerFactory(alice.sk);

    try {
      const op = await fa2_instance.methods
        .withdraw_revenue_from_fee([["unit"]])
        .send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    storage = await fa2_instance.storage();
    const aliceNewBalance = await Tezos.tz.getBalance(alice.pkh);

    assert.equal(storage.revenue_from_fee.toNumber(), 0);
    assert.isAbove(aliceNewBalance.toNumber(), aliceBalance.toNumber());
  });
});
