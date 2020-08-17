import BaseAccount from '../../utilities/accounts/BaseAccount';
import {
  Transactions,
  DerivativeAccounts,
  TransactionDetails,
} from '../../utilities/Interface';

export default class RegularAccount extends BaseAccount {
  public static fromJSON = (json: string) => {
    const { hdWallet } = JSON.parse(json);
    const {
      mnemonic,
      passphrase,
      purpose,
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      gapLimit,
      balances,
      receivingAddress,
      transactions,
      confirmedUTXOs,
      derivativeAccounts,
      lastBalTxSync,
      newTransactions,
      trustedContactToDA,
      feeRates,
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
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress;
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
    } = hdWallet;

    return new RegularAccount(mnemonic, passphrase, purpose, {
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      gapLimit,
      balances,
      receivingAddress,
      transactions,
      confirmedUTXOs,
      derivativeAccounts,
      lastBalTxSync,
      newTransactions,
      trustedContactToDA,
      feeRates,
    });
  };

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
  ) {
    super(mnemonic, passphrase, dPathPurpose, stateVars);
  }
}
