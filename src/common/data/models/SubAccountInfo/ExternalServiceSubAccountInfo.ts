import { v4 as uuid } from 'uuid'
import AccountVisibility from '../../enums/AccountVisibility'
import ServiceAccountKind from '../../enums/ServiceAccountKind'
import SubAccountKind from '../../enums/SubAccountKind'
import UTXOCompatibilityGroup from '../../enums/UTXOCompatibilityGroup'
import {
  ExternalServiceSubAccountDescribing,
  SubAccountDescribingConstructorProps,
} from './Interfaces'
import {
  AccountType,
  Balances,
  TransactionDetails,
} from '../../../../bitcoin/utilities/Interface'
import SourceAccountKind from '../../enums/SourceAccountKind'
import { ImageSourcePropType } from 'react-native'

type ConstructorProps = SubAccountDescribingConstructorProps & {
  defaultDescription?: string;
  serviceAccountKind: ServiceAccountKind;
  type: AccountType
};
export default class ExternalServiceSubAccountInfo implements ExternalServiceSubAccountDescribing {
  id: string;
  xPub: string;
  isUsable: boolean;
  accountShellID: string | null;
  instanceNumber: number;

  kind: SubAccountKind = SubAccountKind.SERVICE;
  type: AccountType;
  sourceKind: SourceAccountKind;

  serviceAccountKind: ServiceAccountKind;
  balances: Balances;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultDescription: string;
  defaultSubTitle: string;
  customDisplayName: string | null;
  customDescription: string | null;

  transactions: TransactionDetails[];
  utxoCompatibilityGroup: UTXOCompatibilityGroup;

  constructor( {
    id = uuid(),
    xPub = null,
    isUsable,
    accountShellID = null,
    instanceNumber = null,
    type,
    defaultTitle,
    defaultDescription,
    serviceAccountKind,
    balances = {
      confirmed: 0, unconfirmed: 0
    },
    customDisplayName = null,
    customDescription = null,
    transactions = [],
    visibility = AccountVisibility.DEFAULT,
    isTFAEnabled = false,
    utxoCompatibilityGroup = UTXOCompatibilityGroup.SINGLE_SIG_PUBLIC,
  }: ConstructorProps ) {
    this.id = id
    this.xPub = xPub
    this.isUsable = isUsable
    this.accountShellID = accountShellID
    this.instanceNumber = instanceNumber
    this.type = type
    this.defaultTitle = defaultTitle
    this.defaultDescription = defaultDescription
    this.serviceAccountKind = serviceAccountKind
    this.balances = balances
    this.customDisplayName = customDisplayName
    this.customDescription = customDescription
    this.isTFAEnabled = isTFAEnabled
    this.sourceKind = isTFAEnabled
      ? SourceAccountKind.SECURE_ACCOUNT
      : SourceAccountKind.REGULAR_ACCOUNT
    this.visibility = visibility
    this.transactions = transactions
    this.utxoCompatibilityGroup = utxoCompatibilityGroup
  }
  avatarImageSource: ImageSourcePropType;
}
