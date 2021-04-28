import { v4 as uuid } from 'uuid'
import AccountVisibility from '../../../enums/AccountVisibility'
import SubAccountKind from '../../../enums/SubAccountKind'
import UTXOCompatibilityGroup from '../../../enums/UTXOCompatibilityGroup'
import {
  HexaSubAccountDescribing,
  SubAccountDescribingConstructorProps,
} from '../Interfaces'
import { ImageSourcePropType } from 'react-native'
import {
  Balances,
  TransactionDetails,
} from '../../../../../bitcoin/utilities/Interface'
import SourceAccountKind from '../../../enums/SourceAccountKind'

type ConstructorProps = SubAccountDescribingConstructorProps & {};

export default class TrustedContactsSubAccountInfo
implements HexaSubAccountDescribing {
  id: string;
  xPub: string;
  accountShellID: string | null;
  instanceNumber: number;

  kind: SubAccountKind = SubAccountKind.TRUSTED_CONTACTS;
  sourceKind: SourceAccountKind = SourceAccountKind.REGULAR_ACCOUNT;

  balances: Balances;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultSubTitle: string;
  defaultDescription = 'Account with Trusted Contacts';
  customDisplayName: string | null;
  customDescription: string | null;

  transactions: TransactionDetails[];
  utxoCompatibilityGroup: UTXOCompatibilityGroup;

  constructor( {
    id = uuid(),
    xPub = null,
    accountShellID = null,
    instanceNumber = null,
    defaultTitle = 'Trusted Contacts',
    defaultSubTitle = null,
    balances = {
      confirmed: 0, unconfirmed: 0
    },
    customDisplayName = null,
    customDescription = null,
    visibility = AccountVisibility.DEFAULT,
    isTFAEnabled = false,
    transactions = [],
    utxoCompatibilityGroup = UTXOCompatibilityGroup.SINGLE_SIG_PUBLIC,

  }: ConstructorProps ) {
    this.id = id
    this.xPub = xPub
    this.accountShellID = accountShellID
    this.instanceNumber = instanceNumber
    this.defaultTitle = defaultTitle
    this.defaultSubTitle = defaultSubTitle
    this.balances = balances
    this.customDisplayName = customDisplayName
    this.customDescription = customDescription
    this.visibility = visibility
    this.isTFAEnabled = isTFAEnabled
    this.transactions = transactions
    this.utxoCompatibilityGroup = utxoCompatibilityGroup
  }
}
