import { v4 as uuidV4 } from 'uuid';
import SubAccountKind from '../../../enums/SubAccountKind';
import TransactionGroup from '../../../enums/TransactionGroup';
import { HexaSubAccountDescribing, SubAccountDescribingConstructorProps } from "../Interfaces";

type ConstructorProps = SubAccountDescribingConstructorProps & {};


export default class CheckingSubAccountInfo implements HexaSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string;
  kind: SubAccountKind = SubAccountKind.REGULAR;
  isPrimarySubAccount: boolean;

  defaultTitle: string;
  defaultDescription: string = "Fast and easy";
  customDisplayName: string | null;
  customDescription: string | null;

  transactionIDs: string[];
  transactionGroup: TransactionGroup = TransactionGroup.SINGLE_SIG_PUBLIC;

  constructor({
    accountShellID,
    defaultTitle = "Checking Account",
    customDisplayName = null,
    customDescription = null,
    transactionIDs = [],
    isPrimarySubAccount = false,
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.transactionIDs = transactionIDs;
    this.isPrimarySubAccount = isPrimarySubAccount;
  }
}
