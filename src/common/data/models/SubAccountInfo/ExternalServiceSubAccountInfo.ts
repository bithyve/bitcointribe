import { v4 as uuidV4 } from 'uuid';
import AccountVisibility from '../../enums/AccountVisibility';
import ServiceAccountKind from '../../enums/ServiceAccountKind';
import SubAccountKind from '../../enums/SubAccountKind';
import TransactionGroup from '../../enums/TransactionGroup';
import { ExternalServiceSubAccountDescribing, SubAccountDescribingConstructorProps } from './Interfaces';
import { ImageSourcePropType } from 'react-native';

type ConstructorProps = SubAccountDescribingConstructorProps & {
  defaultTitle: string;
  defaultDescription: string;
  serviceAccountKind: ServiceAccountKind;
};


export default class ExternalServiceSubAccountInfo implements ExternalServiceSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string | null;
  kind: SubAccountKind = SubAccountKind.SERVICE;
  serviceAccountKind: ServiceAccountKind;
  balance: number;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultDescription: string;
  customDisplayName: string | null;
  customDescription: string | null;

  avatarImageSource: ImageSourcePropType;

  transactionIDs: string[];
  transactionGroup: TransactionGroup;

  constructor({
    accountShellID = null,
    defaultTitle,
    defaultDescription,
    serviceAccountKind,
    balance = 0,
    customDisplayName = null,
    customDescription = null,
    transactionIDs = [],
    visibility = AccountVisibility.DEFAULT,
    isTFAEnabled = false,
    transactionGroup = TransactionGroup.SINGLE_SIG_PUBLIC,
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.defaultDescription = defaultDescription;
    this.serviceAccountKind = serviceAccountKind;
    this.balance = balance;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.isTFAEnabled = isTFAEnabled;
    this.visibility = visibility;
    this.transactionIDs = transactionIDs;
    this.transactionGroup = transactionGroup;

    this.avatarImageSource = getAvatarImageSource(serviceAccountKind);
  }
}


function getAvatarImageSource(serviceAccountKind: ServiceAccountKind): ImageSourcePropType {
  switch (serviceAccountKind) {
    case ServiceAccountKind.FAST_BITCOINS:
      return require('../../../../assets/images/icons/icon_fastbitcoins_hex_dark.png');
    case ServiceAccountKind.SWAN:
      return require('../../../../assets/images/icons/icon_swan.png');
    default:
      return require('../../../../assets/images/icons/icon_hexa.png');
  }
}
