import { v4 as uuid } from 'uuid';
import AccountVisibility from '../../enums/AccountVisibility';
import ServiceAccountKind from '../../enums/ServiceAccountKind';
import SubAccountKind from '../../enums/SubAccountKind';
import UTXOCompatibilityGroup from '../../enums/UTXOCompatibilityGroup';
import {
  ExternalServiceSubAccountDescribing,
  SubAccountDescribingConstructorProps,
} from './Interfaces';
import { ImageSourcePropType } from 'react-native';
import {
  Balances,
  TransactionDetails,
} from '../../../../bitcoin/utilities/Interface';
import SourceAccountKind from '../../enums/SourceAccountKind';

type ConstructorProps = SubAccountDescribingConstructorProps & {
  defaultDescription?: string;
  serviceAccountKind: ServiceAccountKind;
};
export default class ExternalServiceSubAccountInfo
  implements ExternalServiceSubAccountDescribing {
  id: string;
  accountShellID: string | null;
  instanceNumber: number;

  kind: SubAccountKind = SubAccountKind.SERVICE;
  sourceKind: SourceAccountKind;

  serviceAccountKind: ServiceAccountKind;
  balances: Balances;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultDescription: string;
  customDisplayName: string | null;
  customDescription: string | null;

  transactions: TransactionDetails[];
  utxoCompatibilityGroup: UTXOCompatibilityGroup;

  constructor({
    id = uuid(),
    accountShellID = null,
    instanceNumber = null,
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
    this.id = id;
    this.accountShellID = accountShellID;
    this.instanceNumber = instanceNumber;
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
  }
}
