import * as bip39 from 'bip39';
import { Network, TransactionBuilder } from 'bitcoinjs-lib';
import config from '../../Config';
import { ErrMap } from '../ErrMap';
import HDSegwitWallet from './HDSegwitWallet';
import { Transactions, INotification } from '../Interface';

export default class BaseAccount {
  public hdWallet: HDSegwitWallet;

  constructor(
    mnemonic?: string,
    passphrase?: string,
    dPathPurpose?: number,
    stateVars?: {
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      internalAddresssesCache: {};
      externalAddressesCache: {};
      addressToWIFCache: {};
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      derivativeAccount: any;
    },
    network?: Network,
  ) {
    if (mnemonic) {
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid Mnemonic');
      }
    }
    this.hdWallet = new HDSegwitWallet(
      mnemonic,
      passphrase,
      dPathPurpose,
      stateVars,
      network,
    );
  }

  public getMnemonic = ():
    | {
        status: number;
        data: {
          mnemonic: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.getMnemonic(),
      };
    } catch (err) {
      return { status: 101, err: err.message, message: ErrMap[101] };
    }
  };

  public getWalletId = ():
    | {
        status: number;
        data: {
          walletId: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        data?: undefined;
        message: string;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.getWalletId(),
      };
    } catch (err) {
      return { status: 102, err: err.message, message: ErrMap[102] };
    }
  };

  public getAccountId = ():
    | {
        status: number;
        data: {
          accountId: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.getAccountId(),
      };
    } catch (err) {
      return { status: 0o0, err: err.message, message: ErrMap[0o0] };
    }
  };

  public getPaymentURI = (
    address: string,
    options?: {
      amount: number;
      label?: string;
      message?: string;
    },
  ):
    | {
        status: number;
        data: {
          paymentURI: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.generatePaymentURI(address, options),
      };
    } catch (err) {
      return { status: 103, err: err.message, message: ErrMap[103] };
    }
  };

  public decodePaymentURI = (
    paymentURI: string,
  ):
    | {
        status: number;
        data: {
          address: string;
          options: {
            amount?: number;
            label?: string;
            message?: string;
          };
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.decodePaymentURI(paymentURI),
      };
    } catch (err) {
      return { status: 104, err: err.message, message: ErrMap[104] };
    }
  };

  public addressDiff = (
    scannedStr: string,
  ):
    | {
        status: number;
        data: {
          type: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.addressDiff(scannedStr),
      };
    } catch (err) {
      return { status: 105, err: err.message, message: ErrMap[105] };
    }
  };

  public getDerivativeAccXpub = (
    accountType: string,
    accountNumber?: number,
  ):
    | {
        status: number;
        data: string;
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.getDerivativeAccXpub(accountType, accountNumber),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: "Failed to generate derivative account's xpub",
      };
    }
  };

  public getDerivativeAccBalanceTransactions = async (
    accountType: string,
    accountNumber?: number,
  ): Promise<
    | {
        status: number;
        data: {
          balances: {
            balance: number;
            unconfirmedBalance: number;
          };
          transactions: {
            totalTransactions: number;
            confirmedTransactions: number;
            unconfirmedTransactions: number;
            transactionDetails: Array<{
              txid: string;
              status: string;
              confirmations: number;
              fee: string;
              date: string;
              transactionType: string;
              amount: number;
              accountType: string;
              recipientAddresses?: string[];
              senderAddresses?: string[];
            }>;
          };
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.fetchDerivativeAccBalanceTxs(
          accountType,
          accountNumber,
        ),
      };
    } catch (err) {
      return {
        status: 0o3,
        err: err.message,
        message:
          "Failed to generate derivative account's balance and transactions",
      };
    }
  };

  public getAddress = async (): Promise<
    | {
        status: number;
        data: {
          address: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.getReceivingAddress(),
      };
    } catch (err) {
      return { status: 0o1, err: err.message, message: ErrMap[0o1] };
    }
  };

  public isValidAddress = (recipientAddress: string): Boolean =>
    this.hdWallet.isValidAddress(recipientAddress);

  public getBalance = async (options?: {
    restore?;
  }): Promise<
    | {
        status: number;
        data: {
          balance: number;
          unconfirmedBalance: number;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.fetchBalance(options),
      };
    } catch (err) {
      return { status: 0o2, err: err.message, message: ErrMap[0o2] };
    }
  };

  public getBalanceTransactions = async (options?: {
    restore?;
  }): Promise<
    | {
        status: number;
        data: {
          balances: {
            balance: number;
            unconfirmedBalance: number;
          };
          transactions: {
            totalTransactions: number;
            confirmedTransactions: number;
            unconfirmedTransactions: number;
            transactionDetails: Array<{
              txid: string;
              status: string;
              confirmations: number;
              fee: string;
              date: string;
              transactionType: string;
              amount: number;
              accountType: string;
              recipientAddresses?: string[];
              senderAddresses?: string[];
            }>;
          };
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.fetchBalanceTransaction(options),
      };
    } catch (err) {
      return { status: 0o3, err: err.message, message: ErrMap[0o3] };
    }
  };

  public getTransactions = async (): Promise<
    | {
        status: number;
        data: {
          transactions: {
            totalTransactions: number;
            confirmedTransactions: number;
            unconfirmedTransactions: number;
            transactionDetails: Array<{
              txid: string;
              status: string;
              confirmations: number;
              fee: string;
              date: string;
              transactionType: string;
              amount: number;
              accountType: string;
              recipientAddresses?: string[];
              senderAddresses?: string[];
            }>;
          };
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.fetchTransactions(),
      };
    } catch (err) {
      return { status: 0o3, err: err.message, message: ErrMap[0o3] };
    }
  };

  public getTransactionDetails = async (
    txHash: string,
  ): Promise<
    | {
        status: number;
        data: any;
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.fetchTransactionDetails(txHash),
      };
    } catch (err) {
      return { status: 0o4, err: err.message, message: ErrMap[0o4] };
    }
  };

  public getTestcoins = async (): Promise<
    | {
        status: number;
        data: {
          txid: any;
          funded: any;
          balances: any;
          transactions: any;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.testnetFaucet(),
      };
    } catch (err) {
      return { status: 0o5, err: err.message, message: ErrMap[0o5] };
    }
  };

  public transferST1 = async (
    recipientAddress: string,
    amount: number,
    priority: string = 'high',
    feeRates?: any,
  ): Promise<
    | {
        status: number;
        err: string;
        message: string;
        data: {
          fee: number;
          inputs?: undefined;
          txb?: undefined;
          estimatedBlocks?: undefined;
        };
      }
    | {
        status: number;
        data: {
          inputs: Array<{
            txId: string;
            vout: number;
            value: number;
            address: string;
          }>;
          txb: TransactionBuilder;
          fee: number;
          estimatedBlocks: number;
        };
        err?: undefined;
        message?: undefined;
      }
    | { status: number; err: string; message: string; data?: undefined }
  > => {
    try {
      if (this.hdWallet.isValidAddress(recipientAddress)) {
        // amount = Math.round(amount * 1e8); // converting into sats
        amount = Math.round(amount);

        const {
          inputs,
          txb,
          fee,
          balance,
          estimatedBlocks,
        } = await this.hdWallet.createHDTransaction(
          recipientAddress,
          amount,
          priority.toLowerCase(),
          feeRates,
        );

        if (balance < amount + fee) {
          return {
            status: 0o6,
            err:
              'Insufficient balance to compensate for transfer amount and the txn fee',
            message: ErrMap[0o6],
            data: { fee },
          };
        }

        if (inputs && txb) {
          console.log('---- Transaction Created ----');
          return {
            status: config.STATUS.SUCCESS,
            data: { inputs, txb, fee, estimatedBlocks },
          };
        } else {
          throw new Error(
            'Unable to create transaction: inputs failed at coinselect',
          );
        }
      } else {
        throw new Error('Recipient address is wrong');
      }
    } catch (err) {
      return { status: 106, err: err.message, message: ErrMap[106] };
    }
  };

  public transferST2 = async (
    inputs: Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
    }>,
    txb: TransactionBuilder,
  ): Promise<
    | {
        status: number;
        data: {
          txid: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      const signedTxb = this.hdWallet.signHDTransaction(inputs, txb);
      console.log('---- Transaction Signed ----');

      const txHex = signedTxb.build().toHex();
      console.log({ txHex });
      const { txid } = await this.hdWallet.broadcastTransaction(txHex);
      console.log('---- Transaction Broadcasted ----');

      return { status: config.STATUS.SUCCESS, data: { txid } };
    } catch (err) {
      return { status: 107, err: err.message, message: ErrMap[107] };
    }
  };
}
