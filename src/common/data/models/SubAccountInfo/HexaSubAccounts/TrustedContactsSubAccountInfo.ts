import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from '../../../enums/AccountVisibility';
import SubAccountKind from '../../../enums/SubAccountKind';
import UTXOCompatibilityGroup from '../../../enums/UTXOCompatibilityGroup';
import {
  HexaSubAccountDescribing,
  SubAccountDescribingConstructorProps,
} from '../Interfaces';
import { ImageSourcePropType } from 'react-native';
import {
  Balances,
  TransactionDetails,
} from '../../../../../bitcoin/utilities/Interface';
import SourceAccountKind from '../../../enums/SourceAccountKind';

type ConstructorProps = SubAccountDescribingConstructorProps & {};

export default class TrustedContactsSubAccountInfo
  implements HexaSubAccountDescribing {
  id: string;
  accountShellID: string | null;
  kind: SubAccountKind = SubAccountKind.TRUSTED_CONTACTS;
  sourceKind: SourceAccountKind = SourceAccountKind.REGULAR_ACCOUNT;

  balances: Balances;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultDescription: string = 'Account with Trusted Contacts';
  customDisplayName: string | null;
  customDescription: string | null;

  avatarImageSource: ImageSourcePropType;

  transactions: TransactionDetails[];
  utxoCompatibilityGroup: UTXOCompatibilityGroup;

  constructor({
    id = uuidV4(),
    accountShellID = null,
    defaultTitle = null,
    balances = { confirmed: 0, unconfirmed: 0 },
    customDisplayName = null,
    customDescription = null,
    visibility = AccountVisibility.DEFAULT,
    isTFAEnabled = false,
    transactions = [],
    utxoCompatibilityGroup = UTXOCompatibilityGroup.SINGLE_SIG_PUBLIC,
  }: ConstructorProps) {
    this.id = id;
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.balances = balances;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.visibility = visibility;
    this.isTFAEnabled = isTFAEnabled;
    this.transactions = transactions;
    this.utxoCompatibilityGroup = utxoCompatibilityGroup;

    // TODO: Define some way to generate this from the address book avatar.
    this.avatarImageSource = require('../../../../../assets/images/icons/icon_hexa.png');
  }
}
