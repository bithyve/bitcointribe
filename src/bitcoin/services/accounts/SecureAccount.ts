import { TransactionBuilder } from 'bitcoinjs-lib';
import config from '../../HexaConfig';
import SecureHDWallet from '../../utilities/accounts/SecureHDWallet';
import { ErrMap } from '../../utilities/ErrMap';
import {
  Transactions,
  DerivativeAccounts,
  TransactionDetails,
  TransactionPrerequisite,
} from '../../utilities/Interface';

export default class SecureAccount {
  public static fromJSON = (json: string) => {
    const { secureHDWallet } = JSON.parse(json);
    const {
      primaryMnemonic,
      secondaryMnemonic,
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      primaryXpriv,
      secondaryXpriv,
      xpubs,
      gapLimit,
      balances,
      receivingAddress,
      transactions,
      confirmedUTXOs,
      twoFASetup,
      derivativeAccounts,
      lastBalTxSync,
      newTransactions,
      feeRates,
    }: {
      primaryMnemonic: string;
      secondaryMnemonic: string;
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      primaryXpriv: string;
      secondaryXpriv?: string;
      xpubs: {
        primary: string;
        secondary: string;
        bh: string;
      };
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
      twoFASetup: {
        qrData: string;
        secret: string;
      };
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
      feeRates: any;
    } = secureHDWallet;

    return new SecureAccount(primaryMnemonic, {
      secondaryMnemonic,
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      primaryXpriv,
      secondaryXpriv,
      xpubs,
      gapLimit,
      balances,
      receivingAddress,
      transactions,
      confirmedUTXOs,
      twoFASetup,
      derivativeAccounts,
      lastBalTxSync,
      newTransactions,
      feeRates,
    });
  };

  public secureHDWallet: SecureHDWallet;

  constructor(
    primaryMnemonic: string,
    stateVars?: {
      secondaryMnemonic: string;
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      primaryXpriv: string;
      secondaryXpriv?: string;
      xpubs: {
        primary: string;
        secondary: string;
        bh: string;
      };
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
      twoFASetup: {
        qrData: string;
        secret: string;
      };
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
      feeRates: any;
    },
  ) {
    this.secureHDWallet = new SecureHDWallet(primaryMnemonic, stateVars);
  }

  public setupSecureAccount = async (): Promise<
    | {
        status: number;
        data: {
          setupData: {
            qrData: string;
            secret: string;
            bhXpub: string;
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
        data: await this.secureHDWallet.setupSecureAccount(),
      };
    } catch (err) {
      return { status: 301, err: err.message, message: ErrMap[301] };
    }
  };

  public importSecureAccount = async (
    secondaryXpub: string,
    bhXpub?: string,
    token?: number,
  ): Promise<
    | {
        status: number;
        data: {
          imported: boolean;
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
      if (!bhXpub) {
        if (!token) {
          throw new Error('Neither a bhXpub nor a token is provided');
        }
        const res = await this.secureHDWallet.importBHXpub(token);
        bhXpub = res.bhXpub;
      }
      const { prepared } = this.secureHDWallet.prepareSecureAccount(
        bhXpub,
        secondaryXpub,
      );

      if (!prepared) {
        throw new Error('Import failed: unable to prepare secure account.');
      }
      return { status: config.STATUS.SUCCESS, data: { imported: true } };
    } catch (err) {
      return { status: 302, err: err.message, message: ErrMap[302] };
    }
  };

  public decryptSecondaryXpub = (
    encryptedSecXpub: string,
  ):
    | {
        status: number;
        data: {
          secondaryXpub: string;
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
        data: this.secureHDWallet.decryptSecondaryXpub(encryptedSecXpub),
      };
    } catch (err) {
      return { status: 303, err: err.message, message: ErrMap[303] };
    }
  };

  public checkHealth = async (
    chunk: string,
    pos: number,
  ): Promise<
    | {
        status: number;
        data: {
          isValid: boolean;
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
        data: await this.secureHDWallet.checkHealth(chunk, pos),
      };
    } catch (err) {
      return { status: 304, err: err.message, message: ErrMap[304] };
    }
  };

  public isActive = async (): Promise<
    | {
        status: number;
        data: {
          isActive: boolean;
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
        data: await this.secureHDWallet.isActive(),
      };
    } catch (err) {
      return { status: 305, err: err.message, message: ErrMap[305] };
    }
  };

  public resetTwoFA = async (
    secondaryMnemonic: string,
  ): Promise<
    | {
        status: number;
        data: {
          qrData: any;
          secret: any;
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
        data: await this.secureHDWallet.resetTwoFA(secondaryMnemonic),
      };
    } catch (err) {
      return { status: 306, err: err.message, message: ErrMap[306] };
    }
  };

  public removeSecondaryMnemonic = (): { removed: Boolean } =>
    this.secureHDWallet.removeSecondaryMnemonic();

  public removeTwoFADetails = (): { removed: Boolean } =>
    this.secureHDWallet.removeTwoFADetails();

  public isSecondaryMnemonic = (secondaryMnemonic: string) =>
    this.secureHDWallet.isSecondaryMnemonic(secondaryMnemonic);

  public restoreSecondaryMnemonic = (
    secondaryMnemonic: string,
  ): {
    restored: boolean;
  } => this.secureHDWallet.restoreSecondaryMnemonic(secondaryMnemonic);

  public getSecondaryXpub = ():
    | {
        status: number;
        data: {
          secondaryXpub: string;
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
        data: this.secureHDWallet.getSecondaryXpub(),
      };
    } catch (err) {
      return { status: 308, err: err.message, message: ErrMap[308] };
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
        data: this.secureHDWallet.getAccountId(),
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
  ): {
    paymentURI: string;
  } => this.secureHDWallet.generatePaymentURI(address, options);

  public addressDiff = (
    scannedStr: string,
  ): {
    type: string;
  } => this.secureHDWallet.addressDiff(scannedStr);

  public decodePaymentURI = (
    paymentURI: string,
  ): {
    address: string;
    options: {
      amount?: number;
      label?: string;
      message?: string;
    };
  } => this.secureHDWallet.decodePaymentURI(paymentURI);

  public isValidAddress = (recipientAddress: string): Boolean =>
    this.secureHDWallet.isValidAddress(recipientAddress);

  public getReceivingAddress = (
    derivativeAccountType?: string,
    accountNumber?: number,
  ) =>
    this.secureHDWallet.getReceivingAddress(
      derivativeAccountType,
      accountNumber,
    );

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
        data: await this.secureHDWallet.fetchBalanceTransaction(options),
      };
    } catch (err) {
      return { status: 0o3, err: err.message, message: ErrMap[0o3] };
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
        data: await this.secureHDWallet.syncDerivativeAccountsBalanceTxs(
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
        data: await this.secureHDWallet.syncViaXpubAgent(
          accountType,
          accountNumber,
        ),
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
        data: await this.secureHDWallet.setupDonationAccount(
          donee,
          subject,
          description,
          configuration,
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
    configuration: {
      displayBalance: boolean;
      displayTransactions: boolean;
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
        data: await this.secureHDWallet.updateDonationPreferences(
          accountNumber,
          configuration,
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
        data: await this.secureHDWallet.fetchTransactionDetails(txHash),
      };
    } catch (err) {
      return { status: 0o4, err: err.message, message: ErrMap[0o4] };
    }
  };

  public generateSecondaryXpriv = (
    secondaryMnemonic: string,
  ): { generated: Boolean } => {
    try {
      const generated = this.secureHDWallet.generateSecondaryXpriv(
        secondaryMnemonic,
      );
      return { generated };
    } catch (err) {
      console.log({ err });
      return { generated: false };
    }
  };

  public calculateSendMaxFee = (
    numberOfRecipients,
    averageTxFees,
    derivativeAccountDetails?: { type: string; number: number },
  ) =>
    this.secureHDWallet.calculateSendMaxFee(
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
    this.secureHDWallet.calculateCustomFee(
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
      } = await this.secureHDWallet.transactionPrerequisites(
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
    nSequence?: number,
  ): Promise<
    | {
        status: number;
        data: {
          txHex: string;
          childIndexArray: Array<{
            childIndex: number;
            inputIdentifier: {
              txId: string;
              vout: number;
            };
          }>;
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
      const { txb } = await this.secureHDWallet.createHDTransaction(
        txPrerequisites,
        txnPriority.toLowerCase(),
        customTxPrerequisites,
        nSequence,
      );

      let inputs;
      if (txnPriority === 'custom' && customTxPrerequisites) {
        inputs = customTxPrerequisites.inputs;
      } else {
        inputs = txPrerequisites[txnPriority.toLowerCase()].inputs;
      }

      const {
        signedTxb,
        childIndexArray,
      } = await this.secureHDWallet.signHDTransaction(inputs, txb);

      const txHex = signedTxb.buildIncomplete().toHex();

      console.log(
        '---- Transaction signed by the user (1st sig for 2/3 MultiSig)----',
      );

      return {
        status: config.STATUS.SUCCESS,
        data: { txHex, childIndexArray },
      };
    } catch (err) {
      return { status: 310, err: err.message, message: ErrMap[310] };
    }
  };

  public transferST3 = async (
    token: number,
    txHex: string,
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }>,
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
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.serverSigningAndBroadcast(
          token,
          txHex,
          childIndexArray,
        ),
      };
    } catch (err) {
      return { status: 311, err: err.message, message: ErrMap[311] };
    }
  };

  public alternateTransferST2 = async (
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customFee?: number,
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
      const { txb } = await this.secureHDWallet.createHDTransaction(
        txPrerequisites,
        txnPriority.toLowerCase(),
        customFee,
        nSequence,
      );
      const { inputs } = txPrerequisites[txnPriority.toLowerCase()];

      const { signedTxb } = this.secureHDWallet.dualSignHDTransaction(
        inputs,
        txb,
      );
      console.log('---- Transaction Signed ----');

      const txHex = signedTxb.build().toHex();
      console.log({ txHex });
      const { txid } = await this.secureHDWallet.broadcastTransaction(txHex);
      console.log('---- Transaction Broadcasted ----');
      console.log({ txid });

      this.secureHDWallet.removeSecondaryXpriv();
      return { status: config.STATUS.SUCCESS, data: { txid } };
    } catch (err) {
      return { status: 107, err: err.message, message: ErrMap[107] };
    }
  };

  public getDerivativeAccAddress = async (
    accountType: string,
    accountNumber?: number,
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
        data: await this.secureHDWallet.getDerivativeAccReceivingAddress(
          accountType,
          accountNumber,
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
        data: await this.secureHDWallet.fetchDerivativeAccBalanceTxs(
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
}
