import { v4 as uuidV4 } from 'uuid';
import SubAccountKind from '../../../enums/SubAccountKind';
import TransactionGroup from '../../../enums/TransactionGroup';
import { ImportedWalletSubAccountDescribing, SubAccountDescribingConstructorProps } from "../Interfaces";

type ConstructorProps = SubAccountDescribingConstructorProps & {};


export default class WatchOnlyImportedWalletSubAccountInfo implements ImportedWalletSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string;
  kind: SubAccountKind = SubAccountKind.WATCH_ONLY_IMPORTED_WALLET;
  isPrimarySubAccount: boolean;

  defaultTitle: string;
  defaultDescription: string = "View a non-Hexa wallet as an account.";
  customDisplayName: string | null;
  customDescription: string | null;

  transactionIDs: string[];
  transactionGroup: TransactionGroup = TransactionGroup.SINGLE_SIG_PUBLIC;

  constructor({
    accountShellID,
    defaultTitle = "Watch-Only",
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
