import config from "../../Config";
import RegularAccount from "../../services/accounts/RegularAccount";

describe("Regular Account", async () => {
  let importedRegularAccount: RegularAccount;
  beforeAll(() => {
    jest.setTimeout(100000);
  });

  test("generates an HD Segwit Wallet", async () => {
    const regularAccount = new RegularAccount();
    const { data } = regularAccount.getMnemonic();
    expect(data.mnemonic).toBeTruthy();
  });

  test("imports an HD Segwit Wallet (BIP-44) with passphrase", async () => {
    const dummyMnemonic =
      "unique issue slogan party van unfair assault warfare then rubber satisfy snack";
    const dummyPassphrase = "passphrase";
    const purpose = 44;
    const regularAccountImported = new RegularAccount(
      dummyMnemonic,
      dummyPassphrase,
      purpose,
    );
    const res = await regularAccountImported.getMnemonic();
    expect(res.status).toBe(config.STATUS.SUCCESS);
    expect(res.data.mnemonic).toEqual(dummyMnemonic);

    const { data } = await regularAccountImported.getBalance();
    console.log(data);
    const { balance } = data;
    expect(balance).toBe(0);
  });

  test("serialize and deserialize (stringification) regular account obj (state preservation test)", () => {
    const regularAccount = new RegularAccount();
    const initRes = regularAccount.getMnemonic();
    console.log({ mnemonic: initRes.data.mnemonic });
    const serializedObj = JSON.stringify(regularAccount);
    const deserializedRegAc = RegularAccount.fromJSON(serializedObj);
    const finalRes = deserializedRegAc.getMnemonic();
    console.log({ deserializedMnemonic: finalRes.data.mnemonic });
    expect(initRes.data.mnemonic).toEqual(finalRes.data.mnemonic);
  });

  test("imports an HD Segwit Wallet (BIP-49)", async () => {
    const dummyMnemonic =
      "unique issue slogan party van unfair assault warfare then rubber satisfy snack";
    importedRegularAccount = new RegularAccount(dummyMnemonic);
    const res = await importedRegularAccount.getMnemonic();
    expect(res.status).toBe(config.STATUS.SUCCESS);
    expect(res.data.mnemonic).toEqual(dummyMnemonic);
  });

  test("funds the wallet w/ random number of testcoins", async () => {
    const res = await importedRegularAccount.getTestcoins();
    expect(res.status).toBe(config.STATUS.SUCCESS);
    expect(res.data.funded).toBe(true);
    expect(res.data.txid).toBeTruthy();
  });

  test("reflects the balance of the wallet", async () => {
    const res = await importedRegularAccount.getBalance();
    expect(res.status).toBe(config.STATUS.SUCCESS);

    const { balance, unconfirmedBalance } = res.data;
    expect(balance).toBeDefined();
    expect(unconfirmedBalance).toBeDefined();
  });

  test("provides transaction details against a supplied transaction hash", async () => {
    const txHash =
      "5076328b4d87ce3c1036af1171a8755db0dd9ad9929f388b3327ef89c2bd6652";
    const res = await importedRegularAccount.getTransactionDetails(txHash);
    expect(res.status).toBe(config.STATUS.SUCCESS);

    const { status, txid } = res.data;
    expect(status.block_hash).toBeDefined();
    expect(status.block_height).toBeDefined();
    expect(status.confirmed).toBe(true);
    expect(txid).toEqual(txHash);
  });

  test("fetches transctions againts the HD wallet", async () => {
    const res = await importedRegularAccount.getTransactions();
    expect(res.status).toBe(config.STATUS.SUCCESS);

    const {
      totalTransactions,
      confirmedTransactions,
      transactionDetails,
    } = res.data.transactions;
    expect(totalTransactions).toBeGreaterThanOrEqual(confirmedTransactions);
    expect(confirmedTransactions).toBeGreaterThanOrEqual(0);
    expect(transactionDetails).toBeTruthy();
  });

  test("transacts from one btc address to another (multi-stage transfer)", async () => {
    const transfer = {
      recipientAddress: "2N1TSArdd2pt9RoqE3LXY55ixpRE9e5aot8",
      amount: 3500,
      priority: "medium",
    };

    const res = await importedRegularAccount.transferST1(
      transfer.recipientAddress,
      transfer.amount,
      transfer.priority,
    );

    expect(res.status).toBe(config.STATUS.SUCCESS);
    expect(res.data).toBeTruthy();

    const { data } = await importedRegularAccount.transferST2(
      res.data.inputs,
      res.data.txb,
    );

    console.log(data.txid);
    expect(data.txid).toBeTruthy();
  });
});
