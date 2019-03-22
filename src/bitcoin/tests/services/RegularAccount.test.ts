import regularAccount from "../../services/RegularAccount";

describe("Regular Account", async () => {
  beforeAll(() => {
    jest.setTimeout(50000);
  });

  test("generates an HD Wallet", async () => {
    const { mnemonic, address, keyPair } = await regularAccount.createWallet();
    expect(mnemonic).toBeDefined();
    expect(address).toBeDefined();
    expect(keyPair).toBeDefined();
  });

  test("imports an HD Wallet", async () => {
    const dummyMnemonic =
      "spray danger ostrich volume soldier scare shed excess jeans scheme hammer exist";

    const { mnemonic, address, keyPair } = await regularAccount.importWallet(
      dummyMnemonic
    );

    expect(mnemonic).toEqual(dummyMnemonic);
    expect(address).toBeDefined();
    expect(keyPair).toBeDefined();
  });

  test("reflects the balance of a given address", async () => {
    const address = "2N9XSYkDMCu4q3gCuPFZUtaDceiK2sWziik";
    const { balanceData } = await regularAccount.getBalance(address);
    expect(balanceData.final_balance).toBeTruthy();
  });

  test("provides transaction details against a supplied transaction hash", async () => {
    const txHash =
      "5076328b4d87ce3c1036af1171a8755db0dd9ad9929f388b3327ef89c2bd6652";
    const {
      block_hash,
      block_height,
      hash,
      confirmations
    } = await regularAccount.getTransactionDetails(txHash);
    expect(block_hash).toBeDefined();
    expect(block_height).toBeDefined();
    expect(confirmations).toBeGreaterThan(6);
    expect(hash).toEqual(txHash);
  });

  test("fetches transctions corresponding to a given address", async () => {
    const dummyAddress = "2N4qBb5f1KyfbpHxtLM86QgbZ7qcxsFf9AL";
    const {
      totalTransactions,
      confirmedTransactions,
      transactionDetails,
      address
    } = await regularAccount.getTransactions(dummyAddress);
    expect(totalTransactions).toBeDefined();
    expect(confirmedTransactions).toBeDefined();
    expect(transactionDetails).toBeDefined();
    expect(address).toEqual(dummyAddress);
  });

  test("transacts from one btc address to another", async () => {
    const transfer = {
      senderAdderess: "2NAwqcZHo2DW9c8Qs9Jxaat3jHW3aqsBpFs",
      recipientAddress: "2N4qBb5f1KyfbpHxtLM86QgbZ7qcxsFf9AL",
      amount: 3500,
      privateKey: "cR5PcKVDDXHotM8zexjr5wLkxWf7zkL2pAsPc9yaCbPgwjGrK3pc"
    };

    const res = await regularAccount.transfer(
      transfer.senderAdderess,
      transfer.recipientAddress,
      transfer.amount,
      transfer.privateKey
    );
    //console.log(res);
    // expect(statusCode).toBe(200);
    expect(res.data.txid).toBeDefined();
  });
});
