import BaseAccount from '../../utilities/accounts/BaseAccount';
import { Transactions, DerivativeAccounts } from '../../utilities/Interface';

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
      internalAddresssesCache,
      externalAddressesCache,
      addressToWIFCache,
      gapLimit,
      balances,
      receivingAddress,
      transactions,
      derivativeAccounts,
      lastBalTxSync,
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
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
    } = hdWallet;

    return new RegularAccount(mnemonic, passphrase, purpose, {
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
      derivativeAccounts,
      lastBalTxSync,
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
      internalAddresssesCache: {};
      externalAddressesCache: {};
      addressToWIFCache: {};
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
    },
  ) {
    super(mnemonic, passphrase, dPathPurpose, stateVars);
  }
}
