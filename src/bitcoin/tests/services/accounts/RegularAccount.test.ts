import RegularAccount from "../../../services/accounts/RegularAccount";

describe("Regular Account", async () => {
  let importedRegularAccount: RegularAccount;
  beforeAll(() => {
    jest.setTimeout(100000);
  });

  test("generates an HD Segwit Wallet", async () => {
    const regularAccount = new RegularAccount();
    const mnemonic = regularAccount.hdWallet.getMnemonic();
    console.log({ mnemonic });
    expect(mnemonic).toBeTruthy();
  });

  test("imports an HD Segwit Wallet", async () => {
    const dummyMnemonic =
      "unique issue slogan party van unfair assault warfare then rubber satisfy snack";
    importedRegularAccount = new RegularAccount(dummyMnemonic);
    const mnemonic = await importedRegularAccount.hdWallet.getMnemonic();
    expect(mnemonic).toEqual(dummyMnemonic);
  });

  test("reflects the balance of the wallet", async () => {
    const { data } = await importedRegularAccount.getBalance();
    const { balance, unconfirmedBalance } = data;
    console.log({ balance, unconfirmedBalance });
    expect(balance).toBeDefined();
    expect(unconfirmedBalance).toBeDefined();
  });

  test("provides transaction details against a supplied transaction hash", async () => {
    const txHash =
      "5076328b4d87ce3c1036af1171a8755db0dd9ad9929f388b3327ef89c2bd6652";
    const {
      block_hash,
      block_height,
      hash,
      confirmations
    } = await importedRegularAccount.getTransactionDetails(txHash);
    expect(block_hash).toBeDefined();
    expect(block_height).toBeDefined();
    expect(confirmations).toBeGreaterThan(6);
    expect(hash).toEqual(txHash);
  });

  test("fetches transctions againts the HD wallet", async () => {
    const {
      totalTransactions,
      confirmedTransactions,
      transactionDetails
    } = await importedRegularAccount.getTransactions();
    console.log({ totalTransactions, confirmedTransactions });
    expect(totalTransactions).toBeGreaterThanOrEqual(confirmedTransactions);
    expect(confirmedTransactions).toBeGreaterThanOrEqual(0);
    expect(transactionDetails).toBeTruthy();
  });

  test("transacts from one btc address to another", async () => {
    const transfer = {
      recipientAddress: "2NAwqcZHo2DW9c8Qs9Jxaat3jHW3aqsBpFs",
      amount: 3500
    };

    const res = await importedRegularAccount.transfer(
      transfer.recipientAddress,
      transfer.amount
    );
    console.log({ res });
    expect(res.status).toBe(200);
    expect(res.data.txid).toBeTruthy();
  });
});
