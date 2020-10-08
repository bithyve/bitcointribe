import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from "../enums/AccountVisibility";
import BitcoinUnit from "../enums/BitcoinUnit";
import TransactionGroup from "../enums/TransactionGroup";
import SubAccountDescribing from "./SubAccountInfo/Interfaces";

type ConstructorProps = {
  displayOrder?: number | null;
  balance?: number;
  unit: BitcoinUnit;
  visibility?: AccountVisibility;
  primarySubAccount: SubAccountDescribing;
  secondarySubAccounts?: SubAccountDescribing[];
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
   * Balance in Satoshis.
   */
  balance: number;

  /**
   * The unit to be used for displaying the account's balance to the user.
   */
  unit: BitcoinUnit;

  visibility: AccountVisibility;

  primarySubAccount: SubAccountDescribing;
  secondarySubAccounts: SubAccountDescribing[];

  constructor({
    displayOrder = null,
    balance = 0,
    unit = BitcoinUnit.BTC,
    visibility = AccountVisibility.DEFAULT,
    primarySubAccount,
    secondarySubAccounts = [],
  }: ConstructorProps) {
    this.id = uuidV4();

    this.primarySubAccount = primarySubAccount;
    primarySubAccount.accountShellID = this.id;

    this.secondarySubAccounts = secondarySubAccounts;

    this.displayOrder = displayOrder;
    this.balance = balance;
    this.unit = unit;
    this.visibility = visibility;
  }

  get transactionGroup(): TransactionGroup {
    return this.primarySubAccount.transactionGroup;
  }

  get subAccounts(): SubAccountDescribing[] {
    return [
      this.primarySubAccount,
      ...this.secondarySubAccounts,
    ];
  }

  setPrimarySubAccount(subAccount: SubAccountDescribing) {
    subAccount.accountShellID = this.id;
    subAccount.isPrimarySubAccount = true;

    this.primarySubAccount = subAccount;
  }


}
