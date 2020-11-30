import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from '../../../enums/AccountVisibility';
import SubAccountKind from '../../../enums/SubAccountKind';
import TransactionGroup from '../../../enums/TransactionGroup';
import { HexaSubAccountDescribing, SubAccountDescribingConstructorProps } from "../Interfaces";

type ConstructorProps = SubAccountDescribingConstructorProps & {};


export default class TrustedContactsSubAccountInfo implements HexaSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string;
  kind: SubAccountKind = SubAccountKind.TRUSTED_CONTACTS;
  isPrimarySubAccount: boolean;
  balance: number;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultDescription: string = "Account with Trusted Contacts";
  customDisplayName: string | null;
  customDescription: string | null;

  avatarImageSource: NodeRequire;

  transactionIDs: string[];
  transactionGroup: TransactionGroup;

  constructor({
    accountShellID,
    defaultTitle = "Joint Account",
    balance = 0,
    customDisplayName = null,
    customDescription = null,
    visibility = AccountVisibility.DEFAULT,
    isTFAEnabled = false,
    transactionIDs = [],
    isPrimarySubAccount = false,
    transactionGroup = TransactionGroup.SINGLE_SIG_PUBLIC,
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.balance = balance;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.visibility = visibility;
    this.isTFAEnabled = isTFAEnabled;
    this.transactionIDs = transactionIDs;
    this.isPrimarySubAccount = isPrimarySubAccount;
    this.transactionGroup = transactionGroup;

    // TODO: Define some way to generate this from the address book avatar,
    // of fall back to the contact's initials.
    this.avatarImageSource = require('../../../../../assets/images/icons/icon_hexa.png');
  }
}
