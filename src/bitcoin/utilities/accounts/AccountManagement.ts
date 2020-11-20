import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import { v4 as uuidv4 } from 'uuid';
import * as bitcoinJS from 'bitcoinjs-lib';

const generateExtendedKeys = (
  mnemonic,
  network,
  derivationPath,
  passphrase?,
): { xpriv: string; xpub: string } => {
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
  const root = bip32.fromSeed(seed, network);

  const xpriv_child = root.derivePath(derivationPath);
  const xpriv = xpriv_child.toBase58();

  const xpub_child = root.derivePath(derivationPath).neutered();
  const xpub = xpub_child.toBase58();

  return { xpriv, xpub };
};

export const createAccount = (
  accountDetails: {
    accountName: string;
    accountType: string;
    description: string;
    order: number;
    visibility: string;
  },
  mnemonic: string,
  path: string,
  network?: bitcoinJS.Network,
) => {
  const { xpriv, xpub } = generateExtendedKeys(
    mnemonic,
    network ? network : bitcoinJS.networks.bitcoin,
    path,
  );

  const account = {
    accountId: uuidv4(),
    ...accountDetails,
    primary_xpriv: xpriv,
    primary_xpub: xpub,
    path,
    associatedXprivs: [],
    balances: {
      balance: 0,
      unconfirmedBalance: 0,
    },
    transactions: {
      totalTransactions: 0,
      confirmedTransactions: 0,
      unconfirmedTransactions: 0,
      transactionDetails: [],
    },
  };
  return account;
};
