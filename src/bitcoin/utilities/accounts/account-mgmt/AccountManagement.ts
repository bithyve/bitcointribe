import { v4 as uuidv4 } from 'uuid';
import * as bitcoinJS from 'bitcoinjs-lib';
import { TransactionPrerequisite, xAccount } from '../../Interface';
import {
  syncBalanceUtxoTx,
  transactionPrerequisites,
} from './AccountPrimitives';
import { generateExtendedKeys, getAddress } from './BitcoinPrimitives';
import config from '../../../HexaConfig';

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
    receivingAddress: getAddress(false, 0, xpub),
  };
  return account;
};

export const syncAccounts = async (
  accounts: xAccount[],
  network?: bitcoinJS.Network,
): Promise<
  | {
      status: number;
      data: {
        synchedAccounts: xAccount[];
      };
      err?: undefined;
    }
  | {
      status: number;
      err: any;
      data?: undefined;
    }
> => {
  try {
    return {
      status: config.STATUS.SUCCESS,
      data: {
        synchedAccounts: await syncBalanceUtxoTx(
          accounts,
          network ? network : bitcoinJS.networks.bitcoin,
        ),
      },
    };
  } catch (err) {
    return { status: 106, err: err.message };
  }
};

export const transferST1 = async (
  recipients: {
    address: string;
    amount: number;
  }[],
  averageTxFees: any,
  confirmedUTXOs: any,
): Promise<
  | {
      status: number;
      data: {
        txPrerequisites: TransactionPrerequisite;
      };
      err?: undefined;
    }
  | {
      status: number;
      err: string;
      fee?: number;
      netAmount?: number;
      data?: undefined;
    }
> => {
  try {
    recipients = recipients.map((recipient) => {
      recipient.amount = Math.round(recipient.amount);
      return recipient;
    });

    const { fee, balance, txPrerequisites } = await transactionPrerequisites(
      recipients,
      averageTxFees,
      confirmedUTXOs,
    );

    let netAmount = 0;
    recipients.forEach((recipient) => {
      netAmount += recipient.amount;
    });

    if (balance < netAmount + fee) {
      return {
        status: 0o6,
        err: `Insufficient balance`,
        fee,
        netAmount,
      };
    }

    if (txPrerequisites) {
      return {
        status: config.STATUS.SUCCESS,
        data: { txPrerequisites },
      };
    } else {
      throw new Error(
        'Unable to create transaction: inputs failed at coinselect',
      );
    }
  } catch (err) {
    return { status: 106, err: err.message };
  }
};
