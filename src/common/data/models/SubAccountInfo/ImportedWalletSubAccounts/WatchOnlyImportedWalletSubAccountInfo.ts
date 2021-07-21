import { v4 as uuid } from 'uuid'
import {
  Balances,
  TransactionDetails,
} from '../../../../../bitcoin/utilities/Interface'
import AccountVisibility from '../../../enums/AccountVisibility'
import SourceAccountKind from '../../../enums/SourceAccountKind'
import SubAccountKind from '../../../enums/SubAccountKind'
import UTXOCompatibilityGroup from '../../../enums/UTXOCompatibilityGroup'
import {
  ImportedWalletSubAccountDescribing,
  SubAccountDescribingConstructorProps,
} from '../Interfaces'

type ConstructorProps = SubAccountDescribingConstructorProps & {};

export default class WatchOnlyImportedWalletSubAccountInfo
implements ImportedWalletSubAccountDescribing {
  id: string;
  xPub: string;
  accountShellID: string | null;
  instanceNumber: number;

  kind: SubAccountKind = SubAccountKind.WATCH_ONLY_IMPORTED_WALLET;
  sourceKind: SourceAccountKind;

  balances: Balances;

  visibility: AccountVisibility;
  isTFAEnabled: boolean;

  defaultTitle: string;
  defaultDescription = 'View a non-Hexa wallet as an account';
  defaultSubTitle: string;
  customDisplayName: string | null;
  customDescription: string | null;

  transactions: TransactionDetails[];
  utxoCompatibilityGroup: UTXOCompatibilityGroup =
    UTXOCompatibilityGroup.SINGLE_SIG_PUBLIC;

  constructor( {
    id = uuid(),
    xPub = null,
    accountShellID = null,
    instanceNumber = null,
    defaultTitle = 'View Only Account',
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
