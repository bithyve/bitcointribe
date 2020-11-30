import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from '../../../enums/AccountVisibility';
import SubAccountKind from '../../../enums/SubAccountKind';
import UTXOCompatibilityGroup from '../../../enums/UTXOCompatibilityGroup';
import { AccountBalance } from '../../../types/Account';
import {
  HexaSubAccountDescribing,
  SubAccountDescribingConstructorProps,
} from '../Interfaces';

type ConstructorProps = SubAccountDescribingConstructorProps & {};

export default class CheckingSubAccountInfo
  implements HexaSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string | null;
  kind: SubAccountKind = SubAccountKind.REGULAR;
  balances: AccountBalance;
  visibility: AccountVisibility;
  isTFAEnabled: boolean = false;

  defaultTitle: string;
  defaultDescription: string = 'Fast and easy';
  customDisplayName: string | null;
  customDescription: string | null;

  avatarImageSource = require('../../../../../assets/images/icons/icon_regular.png');

  transactionIDs: string[];
  utxoCompatibilityGroup: UTXOCompatibilityGroup = UTXOCompatibilityGroup.SINGLE_SIG_PUBLIC;

  constructor({
    accountShellID = null,
    defaultTitle = 'Checking Account',
    balances = { confirmed: 0, unconfirmed: 0 },
    customDisplayName = null,
    customDescription = null,
    visibility = AccountVisibility.DEFAULT,
    transactionIDs = [],
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.balances = balances;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.visibility = visibility;
    this.transactionIDs = transactionIDs;
  }
}
