import { v4 as uuid } from 'uuid'
import {
  AccountType,
  Balances,
  TransactionDetails,
  LNNode
} from '../../../../../bitcoin/utilities/Interface'
import AccountVisibility from '../../../enums/AccountVisibility'
import SourceAccountKind from '../../../enums/SourceAccountKind'
import SubAccountKind from '../../../enums/SubAccountKind'
import UTXOCompatibilityGroup from '../../../enums/UTXOCompatibilityGroup'
import {
  HexaSubAccountDescribing,
  SubAccountDescribingConstructorProps,
} from '../Interfaces'

type ConstructorProps = SubAccountDescribingConstructorProps & {};

export default class LightningSubAccountInfo
implements HexaSubAccountDescribing {
  id: string;
  isUsable: boolean;
  xPub: string;
  accountShellID: string | null;
  instanceNumber: number;
  node: LNNode;

  kind: SubAccountKind = SubAccountKind.LIGHTNING_ACCOUNT;
  sourceKind: SourceAccountKind = SourceAccountKind.REGULAR_ACCOUNT;
  type: AccountType = AccountType.LIGHTNING_ACCOUNT

  balances: Balances;
  visibility: AccountVisibility;
  isTFAEnabled = false;

  defaultTitle: string;
  defaultSubTitle: string;
  defaultDescription = 'User Lightning Account';
  customDisplayName: string | null;
  customDescription: string | null;

  transactions: TransactionDetails[];
  utxoCompatibilityGroup: UTXOCompatibilityGroup =
    UTXOCompatibilityGroup.SINGLE_SIG_PUBLIC;

  constructor( {
    id = uuid(),
    xPub = null,
    isUsable,
    accountShellID = null,
    instanceNumber = null,
    defaultTitle = 'Lightning Account',
    defaultSubTitle= 'Lightning account',
    balances = {
      confirmed: 0, unconfirmed: 0
    },
    customDisplayName = null,
    customDescription = null,
    visibility = AccountVisibility.DEFAULT,
    transactions = [],
    node = null
  } ) {
    this.id = id
    this.xPub = xPub
    this.isUsable = isUsable,
    this.accountShellID = accountShellID
    this.instanceNumber = instanceNumber
    this.defaultTitle = defaultTitle
    this.defaultSubTitle = defaultSubTitle
    this.balances = balances
    this.customDisplayName = customDisplayName
    this.customDescription = customDescription
    this.visibility = visibility
    this.transactions = transactions
    this.node = node
  }
}
