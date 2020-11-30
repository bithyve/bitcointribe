import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from '../../../enums/AccountVisibility';
import SubAccountKind from '../../../enums/SubAccountKind';
import TransactionGroup from '../../../enums/TransactionGroup';
import { ImportedWalletSubAccountDescribing, SubAccountDescribingConstructorProps } from "../Interfaces";

type ConstructorProps = SubAccountDescribingConstructorProps & {};


export default class WatchOnlyImportedWalletSubAccountInfo implements ImportedWalletSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string | null;
  kind: SubAccountKind = SubAccountKind.WATCH_ONLY_IMPORTED_WALLET;
  balance: number;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultDescription: string = "View a non-Hexa wallet as an account.";
  customDisplayName: string | null;
  customDescription: string | null;

  avatarImageSource = require('../../../../../assets/images/icons/icon_import_watch_only_wallet.png');

  transactionIDs: string[];
  transactionGroup: TransactionGroup = TransactionGroup.SINGLE_SIG_PUBLIC;

  constructor({
    accountShellID = null,
    defaultTitle = "Watch-Only",
    balance = 0,
    customDisplayName = null,
    customDescription = null,
    visibility = AccountVisibility.DEFAULT,
    isTFAEnabled = false,
    transactionIDs = [],
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.balance = balance;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.visibility = visibility;
    this.isTFAEnabled = isTFAEnabled;
    this.transactionIDs = transactionIDs;
  }
}
