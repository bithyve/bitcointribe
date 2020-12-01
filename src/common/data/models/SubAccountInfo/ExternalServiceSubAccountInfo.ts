import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from '../../enums/AccountVisibility';
import ServiceAccountKind from '../../enums/ServiceAccountKind';
import SubAccountKind from '../../enums/SubAccountKind';
import UTXOCompatibilityGroup from '../../enums/UTXOCompatibilityGroup';
import { ExternalServiceSubAccountDescribing, SubAccountDescribingConstructorProps } from './Interfaces';
import { ImageSourcePropType } from 'react-native';
import {
  Balances,
  TransactionDetails,
} from '../../../../bitcoin/utilities/Interface';

type ConstructorProps = SubAccountDescribingConstructorProps & {
  defaultTitle: string;
  defaultDescription: string;
  serviceAccountKind: ServiceAccountKind;
};

export default class ExternalServiceSubAccountInfo
  implements ExternalServiceSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string | null;
  kind: SubAccountKind = SubAccountKind.SERVICE;
  serviceAccountKind: ServiceAccountKind;
  balances: Balances;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultDescription: string;
  customDisplayName: string | null;
  customDescription: string | null;

  avatarImageSource: ImageSourcePropType;

  transactions: TransactionDetails[];
  utxoCompatibilityGroup: UTXOCompatibilityGroup;

  constructor({
    accountShellID = null,
    defaultTitle,
    defaultDescription,
    serviceAccountKind,
    balances = { confirmed: 0, unconfirmed: 0 },
    customDisplayName = null,
    customDescription = null,
    transactions = [],
    visibility = AccountVisibility.DEFAULT,
    isTFAEnabled = false,
    utxoCompatibilityGroup = UTXOCompatibilityGroup.SINGLE_SIG_PUBLIC,
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.defaultDescription = defaultDescription;
    this.serviceAccountKind = serviceAccountKind;
    this.balances = balances;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.isTFAEnabled = isTFAEnabled;
    this.visibility = visibility;
    this.transactions = transactions;
    this.utxoCompatibilityGroup = utxoCompatibilityGroup;

    this.avatarImageSource = getAvatarImageSource(serviceAccountKind);
  }
}

function getAvatarImageSource(
  serviceAccountKind: ServiceAccountKind,
): ImageSourcePropType {
  switch (serviceAccountKind) {
    case ServiceAccountKind.FAST_BITCOINS:
      return require('../../../../assets/images/icons/icon_fastbitcoins_hex_dark.png');
    case ServiceAccountKind.SWAN:
      return require('../../../../assets/images/icons/icon_swan.png');
    default:
      return require('../../../../assets/images/icons/icon_hexa.png');
  }
}
