import AccountKind from "../../enums/AccountKind";
import BitcoinUnit from '../../enums/BitcoinUnit';
import ServiceAccountKind from "../../enums/ServiceAccountKind";
import AccountVisibility from "../../enums/AccountVisibility";


interface BaseAccountPayload {
  /**
   * Unique Identifier
   */
  uuid: string;

  kind: AccountKind;

  /**
   * Default displayable title of the account.
   */
  title: string;

  /**
   * Default displayable short description of the account.
   */
  shortDescription: string;

  accountNumber: number;

  /**
   * The order in which this account should be displayed to the user within
   * a list of accounts.
   */
  displayOrder: number | null;

  /**
   * Balance in Satoshis.
   */
  balance: number;

  /**
   * The unit to be used for displaying the account's balance to the user.
   */
  unit: BitcoinUnit;

  /**
   * A display name set by the user
   */
  customDisplayName: string | null;

  /**
   * A description set by the user.
   */
  customDescription: string | null;

  visibility: AccountVisibility;

  imageSource: NodeRequire;
}


interface MultiXPubAccountPayload extends BaseAccountPayload {
  /**
   * If an account has several internal XPUBs, accounts related to the non-primary XPUB
   * can be looked-up by storing their UUIDs here.
   */
  secondaryAccountUUIDs: string[];

  /**
   * Is this account's xPub the primary.
   */
  isPrimaryAccount: boolean;
}

export interface HexaAccountPayload extends MultiXPubAccountPayload {}

export interface DonationReceivingAccountPayload extends MultiXPubAccountPayload {
  doneeName: string;
  causeName: string;
}

export interface ExternalServiceAccountPayload extends
  HexaAccountPayload,
  MultiXPubAccountPayload
{
  serviceAccountKind: ServiceAccountKind;
}

export interface ImportedWalletAccountPayload extends MultiXPubAccountPayload {}


type AccountPayload =
  HexaAccountPayload |
  ExternalServiceAccountPayload |
  DonationReceivingAccountPayload |
  ImportedWalletAccountPayload;


export default AccountPayload;
