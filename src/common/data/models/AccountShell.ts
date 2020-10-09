import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from "../enums/AccountVisibility";
import BitcoinUnit from "../enums/BitcoinUnit";
import TransactionGroup from "../enums/TransactionGroup";
import SubAccountDescribing from "./SubAccountInfo/Interfaces";

type ConstructorProps = {
  displayOrder?: number | null;
  unit: BitcoinUnit;
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
   * The unit to be used for displaying the account's balance to the user.
   */
  unit: BitcoinUnit;

  primarySubAccount: SubAccountDescribing;
  secondarySubAccounts: SubAccountDescribing[];

  constructor({
    displayOrder = null,
    unit = BitcoinUnit.BTC,
    primarySubAccount,
    secondarySubAccounts = [],
  }: ConstructorProps) {
    this.id = uuidV4();

    this.primarySubAccount = primarySubAccount;
    primarySubAccount.accountShellID = this.id;

    this.secondarySubAccounts = secondarySubAccounts;

    this.displayOrder = displayOrder;
    this.unit = unit;
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

  /**
   * Total balance of all sub-accounts in Satoshis.
  */
  get totalBalance(): number {
    return this
      .subAccounts
      .reduce((accumulated, current) => accumulated + current.balance, 0);
  }

  get visiblity(): AccountVisibility {
    return this.primarySubAccount.visibility;
  }

  setPrimarySubAccount(subAccount: SubAccountDescribing) {
    subAccount.accountShellID = this.id;
    subAccount.isPrimarySubAccount = true;

    this.primarySubAccount = subAccount;
  }


}
