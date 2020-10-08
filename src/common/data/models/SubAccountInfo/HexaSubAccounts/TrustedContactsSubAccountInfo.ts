import { v4 as uuidV4 } from 'uuid';
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

  defaultTitle: string;
  defaultDescription: string = "Account with Trusted Contacts";
  customDisplayName: string | null;
  customDescription: string | null;

  transactionIDs: string[];
  transactionGroup: TransactionGroup;

  constructor({
    accountShellID,
    defaultTitle = "Joint Account",
    balance = 0,
    customDisplayName = null,
    customDescription = null,
    transactionIDs = [],
    isPrimarySubAccount = false,
    transactionGroup = TransactionGroup.SINGLE_SIG_PUBLIC,
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.balance = balance;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.transactionIDs = transactionIDs;
    this.isPrimarySubAccount = isPrimarySubAccount;
    this.transactionGroup = transactionGroup;
  }
}
