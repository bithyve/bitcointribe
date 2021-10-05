import { v4 as uuid } from 'uuid'
import {
  AccountType,
  Balances,
  TransactionDetails,
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

export default class TestSubAccountInfo implements HexaSubAccountDescribing {
  id: string;
  isUsable = true
  xPub: string;
  accountShellID: string | null;
  instanceNumber: number;

  kind: SubAccountKind = SubAccountKind.TEST_ACCOUNT;
  sourceKind: SourceAccountKind = SourceAccountKind.TEST_ACCOUNT;
  type: AccountType = AccountType.TEST_ACCOUNT

  balances: Balances;
  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultSubTitle: string;
  defaultDescription = 'Preloaded Testnet wallet';
  customDisplayName: string | null;
  customDescription: string | null;

  transactions: TransactionDetails[];
  utxoCompatibilityGroup: UTXOCompatibilityGroup =
    UTXOCompatibilityGroup.TESTNET;

  constructor( {
    id = uuid(),
    xPub = null,
    isUsable,
    accountShellID = null,
    instanceNumber = null,
    defaultTitle = 'Test Account',
    balances = {
      confirmed: 0, unconfirmed: 0
    },
    customDisplayName = null,
    customDescription = null,
    visibility = AccountVisibility.DEFAULT,
    isTFAEnabled = false,
    transactions = [],
  }: ConstructorProps ) {
    this.id = id
    this.xPub = xPub
    this.isUsable = isUsable
    this.accountShellID = accountShellID
    this.instanceNumber = instanceNumber
    this.defaultTitle = defaultTitle
    this.balances = balances
    this.customDisplayName = customDisplayName
    this.customDescription = customDescription
    this.visibility = visibility
    this.isTFAEnabled = isTFAEnabled
    this.transactions = transactions
  }
}
