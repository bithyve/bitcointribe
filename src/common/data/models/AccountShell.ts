import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from '../enums/AccountVisibility';
import BitcoinUnit from '../enums/BitcoinUnit';
import UTXOCompatibilityGroup from '../enums/UTXOCompatibilityGroup';
import SubAccountDescribing from './SubAccountInfo/Interfaces';
import { Satoshis } from '../typealiases/UnitAliases';
import TransactionDescribing from './Transactions/Interfaces';
import { Balances } from '../../../bitcoin/utilities/Interface';

type ConstructorProps = {
  displayOrder?: number | null;
  unit: BitcoinUnit;
  primarySubAccount: SubAccountDescribing;
  secondarySubAccounts?: { [id: string]: SubAccountDescribing };
};

export default class AccountShell {
  /**
   * Unique Identifier
   */
  id: string;

  /**
   * The order in which this account should be displayed to the user within
   * a list of accounts.
   */
  displayOrder: number | null;

  /**
   * The unit to be used for displaying the account's balance to the user.
   */
  unit: BitcoinUnit;

  primarySubAccount: SubAccountDescribing;
  secondarySubAccounts: { [id: string]: SubAccountDescribing };

  constructor({
    displayOrder = null,
    unit = BitcoinUnit.BTC,
    primarySubAccount,
    secondarySubAccounts = {},
  }: ConstructorProps) {
    this.id = uuidV4();

    this.primarySubAccount = primarySubAccount;
    this.primarySubAccount.accountShellID = this.id;

    this.secondarySubAccounts = secondarySubAccounts;
    Object.values(this.secondarySubAccounts).forEach(
      (s) => (s.accountShellID = this.id),
    );

    this.displayOrder = displayOrder;
    this.unit = unit;
  }

  static getUTXOCompatibilityGroup(
    shell: AccountShell,
  ): UTXOCompatibilityGroup {
    return shell.primarySubAccount.utxoCompatibilityGroup;
  }

  static getSubAccounts(shell: AccountShell): SubAccountDescribing[] {
    return [
      shell.primarySubAccount,
      ...Object.values(shell.secondarySubAccounts),
    ];
  }

  /**
   * Total balance of all sub-accounts in Satoshis.
   */
  static getTotalBalance = (shell: AccountShell): Satoshis => {
    return AccountShell.getSubAccounts(shell).reduce(
      (accumulated, current) =>
        accumulated +
        (current.balances.confirmed + current.balances.unconfirmed),
      0,
    );
  };

  /**
   * Spendable balance of all sub-accounts in Satoshis.
   */
  static getSpendableBalance = (shell: AccountShell): Satoshis => {
    return AccountShell.getSubAccounts(shell).reduce(
      (accumulated, current) => accumulated + current.balances.confirmed,
      0,
    );
  };

  /**
   * Transactions of all sub-accounts.
   */
  static getAllTransactions = (
    shell: AccountShell,
  ): TransactionDescribing[] => {
    const transactions: TransactionDescribing[] = [];
    AccountShell.getSubAccounts(shell).forEach(
      (subAccount: SubAccountDescribing) => {
        if (subAccount.transactions)
          transactions.push(...subAccount.transactions);
      },
    );
    return transactions;
  };

  static getVisibility(shell: AccountShell): AccountVisibility {
    return shell.primarySubAccount.visibility;
  }

  static setPrimarySubAccount(
    shell: AccountShell,
    subAccount: SubAccountDescribing,
  ) {
    subAccount.accountShellID = shell.id;
    shell.primarySubAccount = subAccount;
  }

  /**
   * Updates primary sub-account w/ latest balance and transactions
   */
  static updatePrimarySubAccountBalanceTx(
    shell: AccountShell,
    newbalance: Balances,
    newTransactions: TransactionDescribing[],
  ) {
    shell.primarySubAccount = {
      ...shell.primarySubAccount,
      balances: newbalance,
      transactions: newTransactions,
    };
  }

  static addSecondarySubAccount(
    shell: AccountShell,
    subAccId: string,
    subAccount: SubAccountDescribing,
  ) {
    shell.secondarySubAccounts[subAccId] = subAccount;
  }

  /**
   * Updates secondary sub-account w/ latest balance and transactions
   */
  static updateSecondarySubAccountBalanceTx(
    shell: AccountShell,
    subAccId: string,
    newbalance: Balances,
    newTransactions: TransactionDescribing[],
  ) {
    let secondarySub = shell.secondarySubAccounts[subAccId];
    if (secondarySub) {
      secondarySub = {
        ...secondarySub,
        balances: newbalance,
        transactions: newTransactions,
      };
      shell.secondarySubAccounts[subAccId] = secondarySub;
    }
  }
}
