import * as bip39 from 'bip39';
import { Network, TransactionBuilder } from 'bitcoinjs-lib';
import config from '../../HexaConfig';
import { ErrMap } from '../ErrMap';
import HDSegwitWallet from './HDSegwitWallet';
import {
  Transactions,
  INotification,
  DerivativeAccounts,
  TransactionDetails,
  TransactionPrerequisite,
} from '../Interface';

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
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      confirmedUTXOs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
        status?: any;
      }>;
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
      trustedContactToDA: { [contactName: string]: number };
      feeRates: any;
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

  public getTestXpub = (): string => this.hdWallet.getTestXPub();

  public getPaymentURI = (
    address: string,
    options?: {
      amount: number;
      label?: string;
      message?: string;
    },
  ): {
    paymentURI: string;
  } => this.hdWallet.generatePaymentURI(address, options);

  public decodePaymentURI = (
    paymentURI: string,
  ): {
    address: string;
    options: {
      amount?: number;
      label?: string;
      message?: string;
    };
  } => this.hdWallet.decodePaymentURI(paymentURI);

  public addressDiff = (
    scannedStr: string,
  ): {
    type: string;
  } => this.hdWallet.addressDiff(scannedStr);

  public getReceivingAddress = (
    derivativeAccountType?: string,
    accountNumber?: number,
  ) => this.hdWallet.getReceivingAddress(derivativeAccountType, accountNumber);

  public getDerivativeAccXpub = (
    accountType: string,
    accountNumber?: number,
    contactName?: string,
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
        data: this.hdWallet.getDerivativeAccXpub(
          accountType,
          accountNumber,
          contactName.toLowerCase().trim(),
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: "Failed to generate derivative account's xpub",
      };
    }
  };

  public getDerivativeAccAddress = async (
    accountType: string,
    accountNumber?: number,
    contactName?: string,
  ): Promise<
    | {
        status: number;
        data: { address: string };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.getDerivativeAccReceivingAddress(
          accountType,
          accountNumber,
          contactName ? contactName.toLowerCase().trim() : null,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: "Failed to generate derivative account's address",
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

  public syncDerivativeAccountsBalanceTxs = async (
    accountTypes: string[],
  ): Promise<
    | {
        status: number;
        data: {
          synched: boolean;
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
        data: await this.hdWallet.syncDerivativeAccountsBalanceTxs(
          accountTypes,
        ),
      };
    } catch (err) {
      return {
        status: 0o3,
        err: err.message,
        message: "Failed to sync derivative account's balance and transactions",
      };
    }
  };

  public syncViaXpubAgent = async (
    accountType: string,
    accountNumber: number,
  ): Promise<
    | {
        status: number;
        data: {
          synched: Boolean;
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
        data: await this.hdWallet.syncViaXpubAgent(accountType, accountNumber),
      };
    } catch (err) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to sync xpub via xpub agent',
      };
    }
  };

  public setupDonationAccount = async (
    donee: string,
    subject: string,
    description: string,
    configuration: {
      displayBalance: boolean;
      displayTransactions: boolean;
    },
    disableAccount?: boolean,
  ): Promise<
    | {
        status: number;
        data: {
          setupSuccessful: Boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.setupDonationAccount(
          donee,
          subject,
          description,
          configuration,
          disableAccount,
        ),
      };
    } catch (err) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to setup donation account',
      };
    }
  };

  public updateDonationPreferences = async (
    accountNumber: number,
    preferences: {
      disableAccount?: boolean;
      configuration?: {
        displayBalance: boolean;
        displayTransactions: boolean;
      };
      accountDetails?: {
        donee: string;
        subject: string;
        description: string;
      };
    },
  ): Promise<
    | {
        status: number;
        data: {
          updated: Boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.updateDonationPreferences(
          accountNumber,
          preferences,
        ),
      };
    } catch (err) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to update donation account preferences',
      };
    }
  };

  public deriveReceivingAddress = async (
    xpub: string,
  ): Promise<
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
        data: await this.hdWallet.deriveReceivingAddress(xpub),
      };
    } catch (err) {
      return { status: 0o1, err: err.message, message: ErrMap[0o1] };
    }
  };

  public isValidAddress = (recipientAddress: string): Boolean =>
    this.hdWallet.isValidAddress(recipientAddress);

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

  public calculateSendMaxFee = (
    numberOfRecipients,
    averageTxFees,
    derivativeAccountDetails?: { type: string; number: number },
  ) =>
    this.hdWallet.calculateSendMaxFee(
      numberOfRecipients,
      averageTxFees,
      derivativeAccountDetails,
    );

  public calculateCustomFee = (
    outputUTXOs: {
      address: string;
      value: number;
    }[],
    customTxFeePerByte: number,
    derivativeAccountDetails?: { type: string; number: number },
  ) =>
    this.hdWallet.calculateCustomFee(
      outputUTXOs,
      customTxFeePerByte,
      derivativeAccountDetails,
    );

  public transferST1 = async (
    recipients: {
      address: string;
      amount: number;
    }[],
    averageTxFees?: any,
    derivativeAccountDetails?: { type: string; number: number },
  ): Promise<
    | {
        status: number;
        data: {
          txPrerequisites: TransactionPrerequisite;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        fee?: number;
        netAmount?: number;
        data?: undefined;
      }
  > => {
    try {
      // if (this.hdWallet.isValidAddress(recipientAddress)) {
      // amount = Math.round(amount * 1e8); // converting into sats
      // amount = Math.round(amount);
      recipients = recipients.map((recipient) => {
        recipient.amount = Math.round(recipient.amount);
        return recipient;
      });

      const {
        fee,
        balance,
        txPrerequisites,
      } = await this.hdWallet.transactionPrerequisites(
        recipients,
        averageTxFees,
        derivativeAccountDetails,
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
          message: ErrMap[0o6],
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

      // } else {
      //   throw new Error('Recipient address is wrong');
      // }
    } catch (err) {
      return { status: 106, err: err.message, message: ErrMap[106] };
    }
  };

  public transferST2 = async (
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: any,
    derivativeAccountDetails?: { type: string; number: number },
    nSequence?: number,
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
      const { txb } = await this.hdWallet.createHDTransaction(
        txPrerequisites,
        txnPriority.toLowerCase(),
        customTxPrerequisites,
        derivativeAccountDetails,
        nSequence,
      );

      let inputs;
      if (txnPriority === 'custom' && customTxPrerequisites) {
        inputs = customTxPrerequisites.inputs;
      } else {
        inputs = txPrerequisites[txnPriority.toLowerCase()].inputs;
      }

      const signedTxb = this.hdWallet.signHDTransaction(inputs, txb);
      console.log('---- Transaction Signed ----');

      const txHex = signedTxb.build().toHex();
      console.log({ txHex });
      const { txid } = await this.hdWallet.broadcastTransaction(txHex);
      console.log('---- Transaction Broadcasted ----');
      console.log({ txid });

      return { status: config.STATUS.SUCCESS, data: { txid } };
    } catch (err) {
      return { status: 107, err: err.message, message: ErrMap[107] };
    }
  };
}
