import * as bitcoinJS from 'bitcoinjs-lib'
import BaseAccount from '../../utilities/accounts/BaseAccount'
import {
  Transactions,
  DerivativeAccounts,
  TransactionDetails,
} from '../../utilities/Interface'

export default class TestAccount extends BaseAccount {
  public static fromJSON = ( json: string ) => {
    const { hdWallet } = JSON.parse( json )
    const {
      mnemonic,
      passphrase,
      purpose,
      accountName,
      accountDescription,
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      internalAddresssesCache,
      externalAddressesCache,
      addressToWIFCache,
      gapLimit,
      balances,
      receivingAddress,
      transactions,
      txIdMap,
      confirmedUTXOs,
      unconfirmedUTXOs,
      addressQueryList,
      derivativeAccounts,
      lastBalTxSync,
      newTransactions,
      trustedContactToDA,
      feeRates,
    }: {
      mnemonic: string;
      passphrase: string;
      purpose: number;
      accountName: string;
      accountDescription: string;
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
      txIdMap: {[txid: string]: boolean};
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
      addressQueryList:{external: {[address: string]: boolean}, internal: {[address: string]: boolean} };
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
      trustedContactToDA: { [contactName: string]: number };
      feeRates: any;
    } = hdWallet

    return new TestAccount( mnemonic, passphrase, purpose, {
      accountName,
      accountDescription,
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      internalAddresssesCache,
      externalAddressesCache,
      addressToWIFCache,
      gapLimit,
      balances,
      receivingAddress,
      transactions,
      txIdMap,
      confirmedUTXOs,
      unconfirmedUTXOs,
      addressQueryList,
      derivativeAccounts,
      lastBalTxSync,
      newTransactions,
      trustedContactToDA,
      feeRates,
    } )
  };

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
      internalAddresssesCache: {};
      externalAddressesCache: {};
      addressToWIFCache: {};
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      txIdMap: {[txid: string]: boolean};
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
  ) {
    const network: bitcoinJS.Network = bitcoinJS.networks.testnet
    super( mnemonic, passphrase, dPathPurpose, stateVars, network )
  }
}
