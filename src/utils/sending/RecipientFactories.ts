import { AccountRecipientDescribing, ContactRecipientDescribing, AddressRecipientDescribing } from "../../common/data/models/interfaces/RecipientDescribing";
import RecipientKind from "../../common/data/enums/RecipientKind";
import getAvatarForSubAccountKind from "../accounts/GetAvatarForSubAccountKind";
import AccountShell from "../../common/data/models/AccountShell";
import ContactTrustKind from "../../common/data/enums/ContactTrustKind";

type AddressRecipientFactoryProps = {
  address: string;
  donationID?: string | null;
};

export function makeAddressRecipientDescription({
  address,
  donationID = null,
}: AddressRecipientFactoryProps): AddressRecipientDescribing {
  return {
    id: address,
    kind: RecipientKind.ADDRESS,
    displayedName: '@',
    avatarImageSource: null,
    donationID,
    donationNote: null,
  };
}

export function makeAccountRecipientDescriptionFromUnknownData(
  data: unknown,
  accountKind: string,
): AccountRecipientDescribing {
  return {
    id: data.id,
    kind: RecipientKind.ACCOUNT_SHELL,
    displayedName: data.account_name || data.id,
    avatarImageSource: getAvatarForSubAccountKind(accountKind),
    currentBalance: data.bitcoinAmount || data.amount || 0,
  };
}

export function makeAccountRecipientDescription(
  accountShell: AccountShell,
): AccountRecipientDescribing {
  const { primarySubAccount } = accountShell;
  const currentBalance = AccountShell.getTotalBalance(accountShell);

  return {
    id: accountShell.id,
    kind: RecipientKind.ACCOUNT_SHELL,
    displayedName: primarySubAccount.customDisplayName || primarySubAccount.defaultTitle,
    avatarImageSource: primarySubAccount.avatarImageSource,
    currentBalance,
  };
}


export function makeContactRecipientDescription(
  data: unknown,
  trustKind: ContactTrustKind = ContactTrustKind.OTHER,
): ContactRecipientDescribing {
  let recipientKind = RecipientKind.CONTACT;

  // 📝 Attempt at being more robust for the issue noted here: https://github.com/bithyve/hexa/issues/2004#issuecomment-728635654
  let displayedName = data.contactName || data.displayedName;

  if (
    displayedName &&
    [
      'f&f request',
      'f&f request awaiting',
      'f & f request',
      'f & f request awaiting',
    ].some((placeholder) => displayedName.startsWith(placeholder))
  ) {
    displayedName = null;
  }

  displayedName = displayedName || data.contactsWalletName || data.walletName;

  // If name information still can't be found, assume it's an address (https://bithyve-workspace.slack.com/archives/CEBLWDEKH/p1605726329349400?thread_ts=1605725360.348800&cid=CEBLWDEKH)
  if (!displayedName) {
    recipientKind = RecipientKind.ADDRESS;
    displayedName = data.id;
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
    hasTrustedChannelWithUser:
      data.hasTrustedChannel || data.hasTrustedChannelWithUser,
  };
}
