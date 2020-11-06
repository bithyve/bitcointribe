import { ImageSourcePropType } from "react-native";
import RecipientKind from "../../enums/RecipientKind";
import { Satoshis } from "../../typealiases/UnitAliases";
import ContactTrustKind from "../../enums/ContactTrustKind";

export interface RecipientDescribing {
  id: string;
  kind: RecipientKind;
  displayedName: string;

  /**
   * Available balance in Satoshis
   */
  availableBalance: Satoshis;

  avatarImageSource: ImageSourcePropType | null;

  /**
   * Initiation Unix timestamp.
   */
  initiatedAt: number;
}


export interface ContactRecipientDescribing extends RecipientDescribing {
  lastSeenActive: number | null;
  walletName: string | null;
  trustKind: ContactTrustKind;
  hasXPub: boolean;
  hasTrustedAddress: boolean;

  /**
   * Whether or not a symmetric key exists between this user and the contact.
   */
  hasTrustedChannelWithUser: boolean;
}

export interface AccountRecipientDescribing extends RecipientDescribing {

}
