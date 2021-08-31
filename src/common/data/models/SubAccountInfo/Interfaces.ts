import SubAccountKind from '../../enums/SubAccountKind'
import ServiceAccountKind from '../../enums/ServiceAccountKind'
import UTXOCompatibilityGroup from '../../enums/UTXOCompatibilityGroup'
import AccountVisibility from '../../enums/AccountVisibility'
import {
  AccountType,
  Balances,
  TransactionDetails,
} from '../../../../bitcoin/utilities/Interface'
import SourceAccountKind from '../../enums/SourceAccountKind'

interface SubAccountDescribing {
  id: string;

  isUsable: boolean;

  xPub: string;
  accountShellID: string | null;

  readonly kind: SubAccountKind;

  /**
   * Instance number(backend) for a particular SubAccountKind
   */
  instanceNumber: number;

  /**
   * Parent account(backend) of this sub-account
   */
  sourceKind: SourceAccountKind;

   /**
   * Backend account's type
   */
  type: AccountType;

  /**
   * Balances in Satoshis.
   */
  balances: Balances;

  /**
   * Default displayable title.
   */
  defaultTitle: string;

  /**
   * Default displayable sub title.
   */
   defaultSubTitle: string;

  /**
   * A display name set by the user
   */
  customDisplayName: string | null;

  /**
   * Default displayable short description
   */
  defaultDescription: string;

  /**
   * A description set by the user.
   */
  customDescription: string | null;

  visibility: AccountVisibility;

  /**
   * Whether or not Two-Factor Authentication is enabled for this sub-account.
   */
  isTFAEnabled: boolean;

  utxoCompatibilityGroup: UTXOCompatibilityGroup;
  // transactionIDs: string[];
  transactions: TransactionDetails[];
  // if new txn exists
  hasNewTxn?: boolean
}

export type HexaSubAccountDescribing = SubAccountDescribing

export interface DonationSubAccountDescribing extends HexaSubAccountDescribing {
  doneeName: string;
  causeName: string;
}

export interface ExternalServiceSubAccountDescribing
  extends SubAccountDescribing {
  readonly serviceAccountKind: ServiceAccountKind;
}

export type ImportedWalletSubAccountDescribing = SubAccountDescribing

export type SubAccountDescribingConstructorProps = {
  id?: string;
  xPub?: string;
  isUsable: boolean;
  accountShellID?: string | null;
  instanceNumber?: number | null;
  defaultTitle?: string;
  defaultSubTitle?: string;
  type?: AccountType;
  defaultDescription?: string;
  customDisplayName?: string | null;
  customDescription?: string | null;
  balances?: Balances;
  visibility?: AccountVisibility;
  isTFAEnabled?: boolean;
  secondaryAccountUUIDs?: string[];
  utxoCompatibilityGroup?: UTXOCompatibilityGroup;
  transactions?: TransactionDetails[];
};

export default SubAccountDescribing
