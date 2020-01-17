import { TransactionBuilder } from 'bitcoinjs-lib';
import config from '../../Config';
import SecureHDWallet from '../../utilities/accounts/SecureHDWallet';
import { ErrMap } from '../../utilities/ErrMap';
import { Transactions } from '../../utilities/Interface';

export default class SecureAccount {
  public static fromJSON = (json: string) => {
    const { secureHDWallet } = JSON.parse(json);
    const {
      primaryMnemonic,
      secondaryMnemonic,
      consumedAddresses,
      nextFreeChildIndex,
      multiSigCache,
      signingEssentialsCache,
      primaryXpriv,
      xpubs,
      gapLimit,
      balances,
      receivingAddress,
      transactions,
      twoFASetup,
    }: {
      primaryMnemonic: string;
      secondaryMnemonic: string;
      consumedAddresses: string[];
      nextFreeChildIndex: number;
      multiSigCache: {};
      signingEssentialsCache: {};
      primaryXpriv: string;
      xpubs: {
        primary: string;
        secondary: string;
        bh: string;
      };
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      twoFASetup: {
        qrData: string;
        secret: string;
      };
    } = secureHDWallet;

    return new SecureAccount(primaryMnemonic, {
      secondaryMnemonic,
      consumedAddresses,
      nextFreeChildIndex,
      multiSigCache,
      signingEssentialsCache,
      primaryXpriv,
      xpubs,
      gapLimit,
      balances,
      receivingAddress,
      transactions,
      twoFASetup,
    });
  };

  public secureHDWallet: SecureHDWallet;

  constructor(
    primaryMnemonic: string,
    stateVars?: {
      secondaryMnemonic: string;
      consumedAddresses: string[];
      nextFreeChildIndex: number;
      multiSigCache: {};
      signingEssentialsCache: {};
      primaryXpriv: string;
      xpubs: {
        primary: string;
        secondary: string;
        bh: string;
      };
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      twoFASetup: {
        qrData: string;
        secret: string;
      };
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
    token: number,
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
        data: await this.secureHDWallet.resetTwoFA(token),
      };
    } catch (err) {
      return { status: 306, err: err.message, message: ErrMap[306] };
    }
  };

  public getSecondaryMnemonic = ():
    | {
        status: number;
        data: {
          secondaryMnemonic: string;
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
        data: this.secureHDWallet.getSecondaryMnemonic(),
      };
    } catch (err) {
      return { status: 307, err: err.message, message: ErrMap[307] };
    }
  };

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
        data: await this.secureHDWallet.getReceivingAddress(),
      };
    } catch (err) {
      return { status: 0o1, err: err.message, message: ErrMap[0o1] };
    }
  };

  public getBalance = async (): Promise<
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
        data: await this.secureHDWallet.fetchBalance(),
      };
    } catch (err) {
      return { status: 0o2, err: err.message, message: ErrMap[0o2] };
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
        data: await this.secureHDWallet.fetchTransactions(),
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
        data: await this.secureHDWallet.fetchTransactionDetails(txHash),
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
      const { address } = await this.secureHDWallet.getReceivingAddress();
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.testnetFaucet(address),
      };
    } catch (err) {
      return { status: 0o5, err: err.message, message: ErrMap[0o5] };
    }
  };

  public transferST1 = async (
    recipientAddress: string,
    amount: number,
    priority?: string,
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
      if (this.secureHDWallet.isValidAddress(recipientAddress)) {
        // amount = Math.round(amount * 1e8); // converting into sats
        amount = Math.round(amount);

        console.log('---- Creating Transaction ----');
        const {
          inputs,
          txb,
          fee,
          balance,
          estimatedBlocks,
        } = await this.secureHDWallet.createHDTransaction(
          recipientAddress,
          amount,
          priority,
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
      return { status: 309, err: err.message, message: ErrMap[309] };
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
}
