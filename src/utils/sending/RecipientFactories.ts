import { AccountRecipientDescribing, ContactRecipientDescribing, AddressRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import RecipientKind from '../../common/data/enums/RecipientKind'
import getAvatarForSubAccountKind from '../accounts/GetAvatarForSubAccountKind'
import AccountShell from '../../common/data/models/AccountShell'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import { ExternalServiceSubAccountDescribing } from '../../common/data/models/SubAccountInfo/Interfaces'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import { SKIPPED_CONTACT_NAME } from '../../store/reducers/trustedContacts'
import { TrustedContact } from '../../bitcoin/utilities/Interface'
import idx from 'idx'

type AddressRecipientFactoryProps = {
  address: string;
};

export function makeAddressRecipientDescription( { address, }: AddressRecipientFactoryProps ): AddressRecipientDescribing {
  return {
    id: address,
    kind: RecipientKind.ADDRESS,
    displayedName: '@',
    avatarImageSource: null,
  }
}

export function makeAccountRecipientDescriptionFromUnknownData(
  data: unknown,
  accountKind: string,
): AccountRecipientDescribing {
  return {
    id: data.id,
    kind: RecipientKind.ACCOUNT_SHELL,
    displayedName: data.account_name || data.id,
    avatarImageSource: getAvatarForSubAccountKind( accountKind ),
    currentBalance: data.bitcoinAmount || data.amount || 0,
    type: data.kind,
    sourceAccount: data.sourceKind,
    instanceNumber: data.instanceNumber || 0,
  }
}

export function makeAccountRecipientDescription(
  accountShell: AccountShell,
): AccountRecipientDescribing {
  const { primarySubAccount } = accountShell
  const currentBalance = AccountShell.getTotalBalance( accountShell )
  let serviceType: ServiceAccountKind
  if( primarySubAccount.kind === SubAccountKind.SERVICE ){
    serviceType = ( primarySubAccount as ExternalServiceSubAccountDescribing ).serviceAccountKind
  }

  return {
    id: accountShell.id,
    kind: RecipientKind.ACCOUNT_SHELL,
    displayedName: primarySubAccount.customDisplayName || primarySubAccount.defaultTitle,
    avatarImageSource: primarySubAccount.avatarImageSource,
    currentBalance,
    type: primarySubAccount.kind,
    serviceType,
    sourceAccount: primarySubAccount.sourceKind,
    instanceNumber: primarySubAccount.instanceNumber,
  }
}


export function makeContactRecipientDescription(
  channelKey: string,
  contact: TrustedContact,
  trustKind: ContactTrustKind = ContactTrustKind.OTHER,
): ContactRecipientDescribing {
  const { contactDetails } = contact
  const contactName = contactDetails.contactName

  const instreamId = contact.streamId
  let walletName, lastSeenActive, walletId
  if( instreamId ) {
    const instream = idx( contact, ( _ ) => _.unencryptedPermanentChannel[ instreamId ] )
    lastSeenActive = idx( instream, ( _ ) => _.metaData.flags.lastSeen )
    walletName = idx( instream, ( _ ) => _.primaryData.walletName )
    walletId = idx( instream, ( _ ) => _.primaryData.walletID )
  }

  let displayedName = contactName
  if ( !displayedName && walletName ) displayedName = walletName
  if ( !displayedName ) displayedName = SKIPPED_CONTACT_NAME

  const avatarImageSource = contactDetails.image
  const contactRecipient: ContactRecipientDescribing = {
    id: contactDetails.id,
    channelKey,
    isActive: contact.isActive,
    kind: RecipientKind.CONTACT,
    trustKind,
    displayedName,
    walletName,
    avatarImageSource,
    lastSeenActive,
    walletId,
    streamId: instreamId,
  }

  return contactRecipient
}
