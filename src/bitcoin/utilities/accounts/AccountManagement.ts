import { v4 as uuidv4 } from 'uuid';
import * as bitcoinJS from 'bitcoinjs-lib';
import { xAccount } from '../Interface';
import { generateExtendedKeys } from './AccountUtils';
import { config } from 'process';

export const createAccount = (
  accountInfo: xAccount['accountInfo'],
  mnemonic: string,
  path: string,
  network?: bitcoinJS.Network,
): xAccount => {
  const { xpriv, xpub } = generateExtendedKeys(
    mnemonic,
    network ? network : bitcoinJS.networks.bitcoin,
    path,
  );

  const account: xAccount = {
    accountId: uuidv4(),
    accountInfo,
    primary_xpriv: xpriv,
    primary_xpub: xpub,
    path,
    gapLimit: 5, // export to config file (conditional gap-limit)
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
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    confirmedUTXOs: [],
  };
  return account;
};
