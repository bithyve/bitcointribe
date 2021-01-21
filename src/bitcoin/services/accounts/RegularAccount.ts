import BaseAccount from '../../utilities/accounts/BaseAccount'
import {
  Transactions,
  DerivativeAccounts,
  TransactionDetails,
} from '../../utilities/Interface'

export default class RegularAccount extends BaseAccount {
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
      receivingAddress;
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
    } = hdWallet

    return new RegularAccount( mnemonic, passphrase, purpose, {
      accountName,
      accountDescription,
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
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
    super( mnemonic, passphrase, dPathPurpose, stateVars )
  }
}
