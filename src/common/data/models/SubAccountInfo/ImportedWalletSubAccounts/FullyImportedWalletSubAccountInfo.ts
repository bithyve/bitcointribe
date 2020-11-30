import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from '../../../enums/AccountVisibility';
import SubAccountKind from '../../../enums/SubAccountKind';
import UTXOCompatibilityGroup from '../../../enums/UTXOCompatibilityGroup';
import { AccountBalance } from '../../../types/Account';
import {
  ImportedWalletSubAccountDescribing,
  SubAccountDescribingConstructorProps,
} from '../Interfaces';

type ConstructorProps = SubAccountDescribingConstructorProps & {};

export default class FullyImportedWalletSubAccountInfo
  implements ImportedWalletSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string | null;
  kind: SubAccountKind = SubAccountKind.FULLY_IMPORTED_WALLET;
  balances: AccountBalance;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultDescription: string = 'Fully import and manage a non-Hexa wallet.';
  customDisplayName: string | null;
  customDescription: string | null;

  avatarImageSource = require('../../../../../assets/images/icons/icon_wallet.png');

  transactionIDs: string[];
  utxoCompatibilityGroup: UTXOCompatibilityGroup = UTXOCompatibilityGroup.SINGLE_SIG_PUBLIC;

  constructor({
    accountShellID = null,
    defaultTitle = 'Full Import',
    balances = { confirmed: 0, unconfirmed: 0 },
    customDisplayName = null,
    customDescription = null,
    visibility = AccountVisibility.DEFAULT,
    isTFAEnabled = false,
    transactionIDs = [],
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.balances = balances;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.visibility = visibility;
    this.isTFAEnabled = isTFAEnabled;
    this.transactionIDs = transactionIDs;
  }
}
