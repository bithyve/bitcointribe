import { ImageSourcePropType } from 'react-native'
import RecipientKind from '../../enums/RecipientKind'
import { Satoshis } from '../../typealiases/UnitAliases'
import ContactTrustKind from '../../enums/ContactTrustKind'
import getAvatarForDeprecatedSubAccountKind from '../../../../utils/accounts/GetAvatarForDeprecatedSubAccountKind'

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
  isPendingRequestAcceptance: boolean;
}

export type AccountRecipientDescribing = RecipientDescribing

export function makeSubAccountRecipientDescription(
  data: unknown,
  accountKind: string,
): AccountRecipientDescribing {
  return {
    id: data.id,
    kind: RecipientKind.SUB_ACCOUNT,
    displayedName: data.account_name || data.id,
    avatarImageSource: getAvatarForDeprecatedSubAccountKind( accountKind ),
    availableBalance: data.bitcoinAmount || data.amount || 0,
    initiatedAt: data.initiatedAt,
  }
}

export function makeContactRecipientDescription(
  data: unknown,
  trustKind: ContactTrustKind = ContactTrustKind.OTHER,
): ContactRecipientDescribing {
  let recipientKind = RecipientKind.CONTACT

  // 📝 Attempt at being more robust for the issue noted here: https://github.com/bithyve/hexa/issues/2004#issuecomment-728635654
  let displayedName = data.contactName || data.displayedName

  if (
    displayedName &&
    [
      'f&f request',
      'f&f request awaiting',
      'f & f request',
      'f & f request awaiting',
    ].some( ( placeholder ) => displayedName.startsWith( placeholder ) )
  ) {
    displayedName = null
  }

  displayedName = displayedName || data.contactsWalletName || data.walletName

  // If name information still can't be found, assume it's an address (https://bithyve-workspace.slack.com/archives/CEBLWDEKH/p1605726329349400?thread_ts=1605725360.348800&cid=CEBLWDEKH)
  if ( !displayedName ) {
    recipientKind = RecipientKind.ADDRESS
    displayedName = data.id
  }

  return {
    id: data.id,
    kind: recipientKind,
    displayedName: displayedName,
    walletName: data.contactsWalletName || data.walletName,
    avatarImageSource: data.avatarImageSource || data.image,
    availableBalance: data.bitcoinAmount || data.amount || 0,
    initiatedAt: data.initiatedAt,
    lastSeenActive: data.lastSeen || data.lastSeenActive,
    trustKind,
    hasXPub: data.hasXpub,
    hasTrustedAddress: data.hasTrustedAddress,
    isPendingRequestAcceptance: !data.hasTrustedChannel
  }
}
