import * as bitcoinJS from 'bitcoinjs-lib';
import BaseAccount from '../../utilities/accounts/BaseAccount';
import { Transactions, DerivativeAccounts } from '../../utilities/Interface';

export default class TestAccount extends BaseAccount {
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
      receivingAddress: string;
      transactions: Transactions;
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
    } = hdWallet;

    return new TestAccount(mnemonic, passphrase, purpose, {
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
    const network: bitcoinJS.Network = bitcoinJS.networks.testnet;
    super(mnemonic, passphrase, dPathPurpose, stateVars, network);
  }
}
