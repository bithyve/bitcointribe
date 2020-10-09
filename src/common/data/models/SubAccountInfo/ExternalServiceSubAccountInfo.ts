import { v4 as uuidV4 } from 'uuid';
import ServiceAccountKind from '../../enums/ServiceAccountKind';
import SubAccountKind from '../../enums/SubAccountKind';
import TransactionGroup from '../../enums/TransactionGroup';
import { ExternalServiceSubAccountDescribing, SubAccountDescribingConstructorProps } from './Interfaces';

type ConstructorProps = SubAccountDescribingConstructorProps & {
  defaultTitle: string;
  defaultDescription: string;
  serviceAccountKind: ServiceAccountKind;
};


export default class ExternalServiceSubAccountInfo implements ExternalServiceSubAccountDescribing {
  id: string = uuidV4();
  accountShellID: string;
  kind: SubAccountKind = SubAccountKind.TRUSTED_CONTACTS;
  serviceAccountKind: ServiceAccountKind;
  isPrimarySubAccount: boolean;
  balance: number;

  defaultTitle: string;
  defaultDescription: string = "Account with Trusted Contacts";
  customDisplayName: string | null;
  customDescription: string | null;

  avatarImageSource: NodeRequire;

  transactionIDs: string[];
  transactionGroup: TransactionGroup;

  constructor({
    accountShellID,
    defaultTitle,
    defaultDescription,
    serviceAccountKind,
    balance = 0,
    customDisplayName = null,
    customDescription = null,
    transactionIDs = [],
    isPrimarySubAccount = false,
    transactionGroup = TransactionGroup.SINGLE_SIG_PUBLIC,
  }: ConstructorProps) {
    this.accountShellID = accountShellID;
    this.defaultTitle = defaultTitle;
    this.defaultDescription = defaultDescription;
    this.serviceAccountKind = serviceAccountKind;
    this.balance = balance;
    this.customDisplayName = customDisplayName;
    this.customDescription = customDescription;
    this.transactionIDs = transactionIDs;
    this.isPrimarySubAccount = isPrimarySubAccount;
    this.transactionGroup = transactionGroup;

    // TODO: Generate this dynamically based upon the `serviceAccountKind`.
    this.avatarImageSource = require('../../../../assets/images/icons/icon_hexa.png');
  }
}
