import bip39 from "bip39";
import { TransactionBuilder } from "bitcoinjs-lib";
import config from "../../Config";
import HDSegwitWallet from "../../utilities/HDSegwitWallet";

export default class RegularAccount {
  public static fromJSON = (json: string) => {
    const { hdWallet } = JSON.parse(json);
    const {
      mnemonic,
      passphrase,
      purpose,
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      internalAddresssesCache,
      externalAddressesCache,
      addressToWIFCache,
      gapLimit,
    }: {
      mnemonic: string;
      passphrase: string;
      purpose: number;
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      internalAddresssesCache: {};
      externalAddressesCache: {};
      addressToWIFCache: {};
      gapLimit: number;
    } = hdWallet;

    return new RegularAccount(mnemonic, passphrase, purpose, {
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      internalAddresssesCache,
      externalAddressesCache,
      addressToWIFCache,
      gapLimit,
    });
  }
  private hdWallet: HDSegwitWallet;

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
    },
  ) {
    if (mnemonic) {
      if (bip39.validateMnemonic(mnemonic)) {
        this.hdWallet = new HDSegwitWallet(
          mnemonic,
          passphrase,
          dPathPurpose,
          stateVars,
        );
      } else {
        throw new Error("Invalid Mnemonic");
      }
    } else {
      this.hdWallet = new HDSegwitWallet();
    }
  }

  public getMnemonic = ():
    | {
        status: number;
        data: {
          mnemonic: string;
        };
        err?: undefined;
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.getMnemonic(),
      };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public getWalletId = ():
    | {
        status: number;
        data: {
          walletId: string;
        };
        err?: undefined;
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.getWalletId(),
      };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public getAccountId = ():
    | {
        status: number;
        data: {
          accountId: string;
        };
        err?: undefined;
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.getAccountId(),
      };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public getAddress = async (): Promise<
    | {
        status: number;
        data: {
          address: string;
        };
        err?: undefined;
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.getReceivingAddress(),
      };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

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
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.generatePaymentURI(address, options),
      };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public addressDiff = (
    scannedStr: string,
  ):
    | {
        status: number;
        data: {
          type: string;
        };
        err?: undefined;
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.addressDiff(scannedStr),
      };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

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
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.decodePaymentURI(paymentURI),
      };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public getBalance = async (): Promise<
    | {
        status: number;
        data: {
          balance: number;
          unconfirmedBalance: number;
        };
        err?: undefined;
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.fetchBalance(),
      };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public getTransactionDetails = async (
    txHash: string,
  ): Promise<
    | {
        status: number;
        data: any;
        err?: undefined;
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.fetchTransactionDetails(txHash),
      };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

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
              transactionType: string;
              amount: number;
              accountType: string;
              recipientAddresses?: string[];
              senderAddresses?: string[];
            }>;
          };
        };
        err?: undefined;
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.fetchTransactions(),
      };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public transferST1 = async (
    recipientAddress: string,
    amount: number,
    priority?: string,
  ): Promise<
    | {
        status: number;
        err: string;
        data: {
          fee: number;
          inputs?: undefined;
          txb?: undefined;
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
        };
        err?: undefined;
      }
    | { status: number; err: string; data?: undefined }
  > => {
    try {
      if (this.hdWallet.isValidAddress(recipientAddress)) {
        amount = Math.round(amount * 1e8); // converting into sats
        const {
          inputs,
          txb,
          fee,
          balance,
        } = await this.hdWallet.createHDTransaction(
          recipientAddress,
          amount,
          priority.toLowerCase(),
        );

        if (balance < amount + fee) {
          return {
            status: config.STATUS.ERROR,
            err:
              "Insufficient balance to compensate for transfer amount and the txn fee",
            data: { fee: fee / 1e8 },
          };
        }

        if (inputs && txb) {
          console.log("---- Transaction Created ----");
          return {
            status: config.STATUS.SUCCESS,
            data: { inputs, txb, fee: fee / 1e8 },
          };
        } else {
          throw new Error(
            "Unable to create transaction: inputs failed at coinselect",
          );
        }
      } else {
        throw new Error("Recipient address is wrong");
      }
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

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
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      }
  > => {
    try {
      const signedTxb = this.hdWallet.signHDTransaction(inputs, txb);
      console.log("---- Transaction Signed ----");

      const txHex = signedTxb.build().toHex();
      console.log({ txHex });
      const { txid } = await this.hdWallet.broadcastTransaction(txHex);
      console.log("---- Transaction Broadcasted ----");

      return { status: config.STATUS.SUCCESS, data: { txid } };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public transfer = async (
    recipientAddress: string,
    amount: number,
  ): Promise<
    | {
        status: number;
        data: {
          txid: string;
        };
        err?: undefined;
      }
    | {
        status: number;
        err: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.transfer(recipientAddress, amount),
      };
    } catch (err) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }
}
