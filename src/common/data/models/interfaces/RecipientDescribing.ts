import { ImageSourcePropType } from "react-native";
import RecipientKind from "../../enums/RecipientKind";
import { Satoshis } from "../../typealiases/UnitAliases";
import ContactTrustKind from "../../enums/ContactTrustKind";
import getAvatarForSubAccountKind from "../../../../utils/accounts/GetAvatarForSubAccountKind";

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

export function makeSubAccountRecipientDescription(
  data: unknown,
  accountKind: string
): AccountRecipientDescribing {
  return {
    id: data.id,
    kind: RecipientKind.SUB_ACCOUNT,
    displayedName: data.account_name,
    avatarImageSource: getAvatarForSubAccountKind(accountKind),
    availableBalance: data.bitcoinAmount || data.amount || 0,
    initiatedAt: data.initiatedAt,
  };
}



export function makeContactRecipientDescription(
  data: unknown,
  trustKind: ContactTrustKind = ContactTrustKind.OTHER,
): ContactRecipientDescribing {
  return {
    id: data.id,
    kind: RecipientKind.CONTACT,
    displayedName: data.contactName || data.displayedName || data.contactsWalletName || data.walletName,
    walletName: data.contactsWalletName || data.walletName,
    avatarImageSource: data.imageAvailable ? data.rawImage : data.avatarImageSource,
    availableBalance: data.bitcoinAmount || data.amount || 0,
    initiatedAt: data.initiatedAt,
    lastSeenActive: data.lastSeen || data.lastSeenActive,
    trustKind,
    hasXPub: data.hasXpub,
    hasTrustedAddress: data.hasTrustedAddress,
    hasTrustedChannelWithUser: data.hasTrustedChannel || data.hasTrustedChannelWithUser,
  };
}
