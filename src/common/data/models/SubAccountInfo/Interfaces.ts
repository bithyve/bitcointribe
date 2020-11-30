import SubAccountKind from "../../enums/SubAccountKind";
import ServiceAccountKind from "../../enums/ServiceAccountKind";
import TransactionGroup from "../../enums/TransactionGroup";
import AccountVisibility from "../../enums/AccountVisibility";
import { ImageSourcePropType } from "react-native";


interface SubAccountDescribing {
  id: string;
  accountShellID: string;

  kind: SubAccountKind;
  isPrimarySubAccount: boolean;

  /**
   * Balance in Satoshis.
   */
  balance: number;

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

  transactionGroup: TransactionGroup;
  transactionIDs: string[];
}


export interface HexaSubAccountDescribing extends SubAccountDescribing {}

export interface DonationSubAccountDescribing extends HexaSubAccountDescribing {
  doneeName: string;
  causeName: string;
}

export interface ExternalServiceSubAccountDescribing extends
  SubAccountDescribing {
  serviceAccountKind: ServiceAccountKind;
}

export interface ImportedWalletSubAccountDescribing extends SubAccountDescribing {}


export type SubAccountDescribingConstructorProps = {
  accountShellID?: string;
  defaultTitle?: string;
  isPrimarySubAccount?: boolean;
  customDisplayName?: string | null;
  customDescription?: string | null;
  balance?: number;
  visibility?: AccountVisibility;
  isTFAEnabled?: boolean;
  avatarImageSource?: ImageSourcePropType;
  secondaryAccountUUIDs?: string[];
  transactionGroup?: TransactionGroup;
  transactionIDs?: string[];
};


export default SubAccountDescribing;


