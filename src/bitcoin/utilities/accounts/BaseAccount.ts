import * as bip39 from 'bip39'
import { Network } from 'bitcoinjs-lib'
import config from '../../HexaConfig'
import { ErrMap } from '../ErrMap'
import HDSegwitWallet from './HDSegwitWallet'
import {
  Transactions,
  DerivativeAccounts,
  TransactionDetails,
  TransactionPrerequisite,
  ScannedAddressKind,
  AverageTxFees,
  TransactionPrerequisiteElements,
} from '../Interface'

export default class BaseAccount {
  public hdWallet: HDSegwitWallet;

  constructor(
    mnemonic?: string,
    passphrase?: string,
    dPathPurpose?: number,
    stateVars?: {
      accountName: string;
      accountDescription: string;
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      txIdMap: {[txid: string]: string[]};
      confirmedUTXOs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
        status?: any;
      }>;
      unconfirmedUTXOs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
        status?: any;
      }>;
      addressQueryList: {external: {[address: string]: boolean}, internal: {[address: string]: boolean} };
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
      trustedContactToDA: { [contactName: string]: number };
      feeRates: any;
    },
    network?: Network,
  ) {
    if ( mnemonic ) {
      if ( !bip39.validateMnemonic( mnemonic ) ) {
        throw new Error( 'Invalid Mnemonic' )
      }
    }
    this.hdWallet = new HDSegwitWallet(
      mnemonic,
      passphrase,
      dPathPurpose,
      stateVars,
      network,
    )
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
      }
    } catch ( err ) {
      return {
        status: 101, err: err.message, message: ErrMap[ 101 ]
      }
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
      }
    } catch ( err ) {
      return {
        status: 102, err: err.message, message: ErrMap[ 102 ]
      }
    }
  };

  public getAccountId = (): string => this.hdWallet.getAccountId();

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
  } => this.hdWallet.generatePaymentURI( address, options );

  public decodePaymentURI = (
    paymentURI: string,
  ): {
    address: string;
    options: {
      amount?: number;
      label?: string;
      message?: string;
    };
  } => this.hdWallet.decodePaymentURI( paymentURI );

  public addressDiff = (
    scannedStr: string,
  ): {
      type: ScannedAddressKind | null;
  } => this.hdWallet.addressDiff( scannedStr );

  public getReceivingAddress = (
    derivativeAccountType?: string,
    accountNumber?: number,
  ) => this.hdWallet.getReceivingAddress( derivativeAccountType, accountNumber );

  public getDerivativeAccAddress = async (
    accountType: string,
    accountNumber?: number,
    contactName?: string,
    accountName?: string,
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
          accountName,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to generate derivative account\'s address',
      }
    }
  };

  public getDerivativeAccBalanceTransactions = async (
    accountInfo: {
      accountType: string,
      accountNumber: number,
      contactName?: string,
    }[],
    hardRefresh?: boolean,
    blindRefresh?: boolean,
  ): Promise<
    | {
        status: number;
        data: {
          synched: boolean;
          txsFound: TransactionDetails[];
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
          accountInfo,
          hardRefresh,
          blindRefresh,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message:
          'Failed to generate derivative account\'s balance and transactions',
      }
    }
  };

  public syncDerivativeAccountsBalanceTxs = async (
    accountTypes: string[],
    hardRefresh?: boolean,
    blindRefresh?: boolean,
  ): Promise<
    | {
        status: number;
        data: {
          synched: boolean;
          txsFound: TransactionDetails[];
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
          hardRefresh,
          blindRefresh
        ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to sync derivative account\'s balance and transactions',
      }
    }
  };

  public syncViaXpubAgent = async (
    accountType: string,
    accountNumber: number,
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
        data: await this.hdWallet.syncViaXpubAgent( accountType, accountNumber ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to sync xpub via xpub agent',
      }
    }
  };

  public setupDerivativeAccount = (
    accountType: string,
    accountDetails?: { accountName?: string; accountDescription?: string },
    contactName?: string
  ):
    | {
        status: number;
        data: {
          accountId: string;
          accountNumber: number;
          accountXpub: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.setupDerivativeAccount( accountType, accountDetails, contactName ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to setup derivative acccount',
      }
    }
  };


  public updateAccountDetails = (
    account: {
      kind: string,
      instanceNumber: number,
      customDescription: string,
      customDisplayName: string
    }
  ): {
    status: number;
    data: {
        updateSuccessful: boolean;
    };
    err?: undefined;
    message?: undefined;
  } | {
    status: number;
    err: any;
    message: string;
    data?: undefined;
  }  => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.hdWallet.updateAccountDetails(
          account
        ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to update account',
      }
    }
  };


  public setupDonationAccount = async (
    donee: string,
    subject: string,
    description: string,
    configuration: {
      displayBalance: boolean;
    },
    disableAccount?: boolean,
  ): Promise<
    | {
        status: number;
        data: {
          setupSuccessful: boolean;
          accountId: string;
          accountNumber: number;
          accountXpub: string;
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
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to setup donation account',
      }
    }
  };

  public updateDonationPreferences = async (
    accountNumber: number,
    preferences: {
      disableAccount?: boolean;
      configuration?: {
        displayBalance: boolean;
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
          updated: boolean;
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
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to update donation account preferences',
      }
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
        data: await this.hdWallet.deriveReceivingAddress( xpub ),
      }
    } catch ( err ) {
      return {
        status: 0o1, err: err.message, message: ErrMap[ 0o1 ]
      }
    }
  };

  public isValidAddress = ( recipientAddress: string ): boolean =>
    this.hdWallet.isValidAddress( recipientAddress );

  public getBalanceTransactions = async ( hardRefresh?: boolean, blindRefresh?: boolean ): Promise<
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
            transactionDetails: TransactionDetails[]
          };
          txsFound: TransactionDetails[];
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
        data: await this.hdWallet.fetchBalanceTransaction( hardRefresh, blindRefresh ),
      }
    } catch ( err ) {
      return {
        status: 0o3, err: err.message, message: ErrMap[ 0o3 ]
      }
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
      return {
        status: config.STATUS.SUCCESS,
        data: await this.hdWallet.testnetFaucet(),
      }
    } catch ( err ) {
      return {
        status: 0o5, err: err.message, message: ErrMap[ 0o5 ]
      }
    }
  };

  public calculateSendMaxFee = (
    numberOfRecipients: number,
    feePerByte: number,
    derivativeAccountDetails?: { type: string; number: number },
  ) =>
    this.hdWallet.calculateSendMaxFee(
      numberOfRecipients,
      feePerByte,
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
    averageTxFees: AverageTxFees,
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
      recipients = recipients.map( ( recipient ) => {
        recipient.amount = Math.round( recipient.amount )
        return recipient
      } )

      let netAmount = 0
      recipients.forEach( ( recipient ) => {
        netAmount += recipient.amount
      } )

      let {
        fee,
        balance,
        txPrerequisites,
      } = this.hdWallet.transactionPrerequisites(
        recipients,
        averageTxFees,
        derivativeAccountDetails,
      )

      if ( balance < netAmount + fee ) {
        // check w/ the lowest fee possible for this transaction
        const minTxFeePerByte = 1 // default minimum relay fee
        const minAvgTxFee = {
          ...averageTxFees
        }
        minAvgTxFee[ 'low' ].feePerByte = minTxFeePerByte

        const minTxPrerequisites  = this.hdWallet.transactionPrerequisites(
          recipients,
          minAvgTxFee,
          derivativeAccountDetails,
        )

        if( minTxPrerequisites.balance < netAmount + minTxPrerequisites.fee )
          return {
            status: 0o6,
            err: 'Insufficient balance',
            fee,
            netAmount,
            message: ErrMap[ 0o6 ],
          }
        else txPrerequisites = minTxPrerequisites.txPrerequisites
      }

      if ( Object.keys( txPrerequisites ).length ) {
        return {
          status: config.STATUS.SUCCESS,
          data: {
            txPrerequisites
          },
        }
      } else {
        throw new Error(
          'Unable to create transaction: inputs failed at coinselect',
        )
      }

      // } else {
      //   throw new Error('Recipient address is wrong');
      // }
    } catch ( err ) {
      return {
        status: 106, err: err.message, message: ErrMap[ 106 ]
      }
    }
  };

  public transferST2 = async (
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: TransactionPrerequisiteElements,
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
    let executed = 'tx-init'
    try {
      txnPriority = txnPriority.toLowerCase()
      const { txb } = await this.hdWallet.createHDTransaction(
        txPrerequisites,
        txnPriority,
        customTxPrerequisites,
        derivativeAccountDetails,
        nSequence,
      )
      executed = 'tx-creation'

      let inputs
      if ( txnPriority === 'custom' && customTxPrerequisites ) {
        inputs = customTxPrerequisites.inputs
      } else {
        inputs = txPrerequisites[ txnPriority.toLowerCase() ].inputs
      }
      const signedTxb = this.hdWallet.signHDTransaction( inputs, txb )
      // console.log('---- Transaction Signed ----');
      executed = 'tx-signing'

      const txHex = signedTxb.build().toHex()
      // console.log({ txHex });
      const { txid } = await this.hdWallet.broadcastTransaction( txHex )
      if( txid.includes( 'sendrawtransaction RPC error' ) ){
        let err
        try{
          err = ( txid.split( ':' )[ 3 ] ).split( '"' )[ 1 ]
        } catch( err ){
          console.log( {
            err
          } )
        }
        throw new Error( err )
      }
      if( txid ){
        // chip consumed utxos
        this.hdWallet.removeConsumedUTXOs( inputs, derivativeAccountDetails )
      }
      executed = 'tx-broadcast'
      // console.log('---- Transaction Broadcasted ----');
      // console.log({ txid });
      return {
        status: config.STATUS.SUCCESS, data: {
          txid
        }
      }
    } catch ( err ) {
      return {
        status: 107,
        err: err.message + `(failed post: ${executed})`,
        message: ErrMap[ 107 ],
      }
    }
  };
}
