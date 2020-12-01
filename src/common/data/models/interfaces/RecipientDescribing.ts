import { ImageSourcePropType } from 'react-native'
import RecipientKind from '../../enums/RecipientKind'
import { Satoshis } from '../../typealiases/UnitAliases'
import ContactTrustKind from '../../enums/ContactTrustKind'

export interface RecipientDescribing {
  id: string;
  kind: RecipientKind;
  displayedName: string;

  avatarImageSource: ImageSourcePropType | null;
}

export interface AddressRecipientDescribing extends RecipientDescribing {
  donationID: string | null;
  donationNote: string | null;
}

export interface ContactRecipientDescribing extends RecipientDescribing {
  lastSeenActive: number | null;
  // walletName: string | null;
  trustKind: ContactTrustKind;
  hasTrustedAddress: boolean;

  /**
   * Whether or not a symmetric key exists between this user and the contact.
   */
  hasTrustedChannelWithUser: boolean;

  /**
   * Initiation Unix timestamp.
   */
  initiatedAt: number;
}

export interface AccountRecipientDescribing extends RecipientDescribing {

  /**
  * Current balance of the account in Satoshis.
  */
  currentBalance: Satoshis;
}
