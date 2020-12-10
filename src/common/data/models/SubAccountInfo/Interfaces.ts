import { v4 as uuid } from 'uuid';
import SubAccountKind from '../../enums/SubAccountKind';
import ServiceAccountKind from '../../enums/ServiceAccountKind';
import UTXOCompatibilityGroup from '../../enums/UTXOCompatibilityGroup';
import AccountVisibility from '../../enums/AccountVisibility';
import { ImageSourcePropType } from 'react-native';
import {
  Balances,
  TransactionDetails,
} from '../../../../bitcoin/utilities/Interface';
import SourceAccountKind from '../../enums/SourceAccountKind';

interface SubAccountDescribing {
  doneeName: any;
  id: string;
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
   * Balances in Satoshis.
   */
  balances: Balances;

  /**
   * Default displayable title.
   */
  defaultTitle: string;

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

  avatarImageSource: ImageSourcePropType;

  utxoCompatibilityGroup: UTXOCompatibilityGroup;
  // transactionIDs: string[];
  transactions: TransactionDetails[];
}

export interface HexaSubAccountDescribing extends SubAccountDescribing {}

export interface DonationSubAccountDescribing extends HexaSubAccountDescribing {
  doneeName: string;
  causeName: string;
}

export interface ExternalServiceSubAccountDescribing
  extends SubAccountDescribing {
  readonly serviceAccountKind: ServiceAccountKind;
}

export interface ImportedWalletSubAccountDescribing
  extends SubAccountDescribing {}

export type SubAccountDescribingConstructorProps = {
  id?: string;
  accountShellID?: string | null;
  instanceNumber?: number | null;
  defaultTitle?: string;
  customDisplayName?: string | null;
  customDescription?: string | null;
  balances?: Balances;
  visibility?: AccountVisibility;
  isTFAEnabled?: boolean;
  avatarImageSource?: ImageSourcePropType;
  secondaryAccountUUIDs?: string[];
  utxoCompatibilityGroup?: UTXOCompatibilityGroup;
  transactions?: TransactionDetails[];
};

export default SubAccountDescribing;
