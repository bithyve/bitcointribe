import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from '../../../enums/AccountVisibility';
import SubAccountKind from '../../../enums/SubAccountKind';
import TransactionGroup from '../../../enums/TransactionGroup';
import { HexaSubAccountDescribing, SubAccountDescribingConstructorProps } from "../Interfaces";

type ConstructorProps = SubAccountDescribingConstructorProps & {};


export default class SavingsSubAccountInfo implements HexaSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string | null;
  kind: SubAccountKind = SubAccountKind.SECURE;
  balance: number;
  visibility: AccountVisibility;
  isTFAEnabled: boolean = true;

  defaultTitle: string;
  defaultDescription: string = "Multi-factor security";
  customDisplayName: string | null;
  customDescription: string | null;

  avatarImageSource = require('../../../../../assets/images/icons/icon_secureaccount.png');

  transactionIDs: string[];
  transactionGroup: TransactionGroup = TransactionGroup.MULTI_SIG_PUBLIC;

  constructor({
    accountShellID = null,
    defaultTitle = "Savings Account",
    balance = 0,
    customDisplayName = null,
    customDescription = null,
    visibility = AccountVisibility.DEFAULT,
    transactionIDs = [],
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.balance = balance;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.visibility = visibility;
    this.transactionIDs = transactionIDs;
  }
}
