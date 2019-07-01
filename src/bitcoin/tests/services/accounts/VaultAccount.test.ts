import bip65 from "bip65";
import { ECPair } from "bitcoinjs-lib";
import VaultAccount from "../../../services/accounts/VaultAccount";

describe("Vault Account", async () => {
  let vaultAccount: VaultAccount;
  let mnemonic: string;
  let keyPair: ECPair;
  let vaultLockTime: number;
  let recoveryScript: string;
  let vaultAddress: string;

  beforeAll(async () => {
    jest.setTimeout(50000);
    vaultAccount = new VaultAccount();
    const res = await vaultAccount.bitcoin.createHDWallet();
    mnemonic = res.mnemonic;
    keyPair = res.keyPair;
  });

  test("creates a cltv redeem script", () => {
    const lockTime = bip65.encode({ utc: vaultAccount.bitcoin.utcNow() + 60 }); // creating a cltv lock for 60 seconds from now
    const redeemScirpt = vaultAccount.cltvCheckSigOutput(keyPair, lockTime);
    expect(redeemScirpt).toBeDefined();
  });

  test("locks the assigned UTXOs for the specified amount of time", async () => {
    const time: number = 3600; // locked for an hour
    const { lockTime, address, redeemScript } = await vaultAccount.createTLC(
      mnemonic,
      time,
      null,
    );
    vaultLockTime = lockTime;
    vaultAddress = address;
    recoveryScript = redeemScript;
    expect(address).toBeDefined();
    expect(lockTime).toBeGreaterThan(500000000); // locktime variable should be greater than 500m
  });

  test("locks the assigned UTXOs for the supplied number of blocks", async () => {
    const numberOfBlocks: number = 10; // locked for 10 blocks
    const { lockTime, address, privateKey } = await vaultAccount.createTLC(
      mnemonic,
      null,
      numberOfBlocks,
    );
    expect(address).toBeDefined();
    expect(lockTime).toBeLessThan(500000000); // locktime variable should be less than 500m
  });

  test("spends UTXOs from a (pre-funded) vault account once the specified time expires", async () => {
    // const time: number = -3600; // an hour in the past
    // const { address, privateKey, lockTime } = await vaultAccount.createTLC(
    //   mnemonic,
    //   time,
    //   null,
    // );
    const vaultAdd: string = "2N8XJYFFFr3YfrkeuvYa4iKgupuE8yxh6YY";
    const privateKey: string =
      "cNpHxTR2hq5mGUEwGz8QEBJCMkP3CJk4Zta66kGo8qSqBe1B5Y9y";
    const lockTime: number = 1549887477;
    const transfer = {
      senderAddress: vaultAdd,
      recipientAddress: "2N4qBb5f1KyfbpHxtLM86QgbZ7qcxsFf9AL",
      amount: 4500,
      privateKey,
      lockTime,
    };
    const { txid } = await vaultAccount.transfer(
      transfer.senderAddress,
      transfer.recipientAddress,
      transfer.amount,
      transfer.lockTime,
      transfer.privateKey,
    );

    expect(txid).toBeTruthy();
  });

  test("spends UTXOs from a (pre-funded) vault account once the specified number of blocks are mined", async () => {
    // const numberOfBlocks: number = -10;
    // const { address, privateKey, lockTime } = await vaultAccount.createTLC(
    //   mnemonic,
    //   null,
    //   numberOfBlocks,
    // );

    const vaultAdd: string = "2MtGyj6e1EP49crSL7qN8tG9dJwpbTQyhoD";
    const privateKey: string =
      "cNpHxTR2hq5mGUEwGz8QEBJCMkP3CJk4Zta66kGo8qSqBe1B5Y9y";
    const lockTime: number = 1456745;
    const transfer = {
      senderAddress: vaultAdd,
      recipientAddress: "2N4qBb5f1KyfbpHxtLM86QgbZ7qcxsFf9AL",
      amount: 4500,
      privateKey,
      lockTime,
    };
    const { txid } = await vaultAccount.transfer(
      transfer.senderAddress,
      transfer.recipientAddress,
      transfer.amount,
      transfer.lockTime,
      transfer.privateKey,
    );

    expect(txid).toBeDefined();
  });

  test("recovers the vault from a recovery script(redeem)", async () => {
    const { address, lockTime } = await vaultAccount.recoverVault(
      recoveryScript,
    );
    expect(address).toEqual(vaultAddress);
    expect(lockTime).toEqual(vaultLockTime);
  });
});
