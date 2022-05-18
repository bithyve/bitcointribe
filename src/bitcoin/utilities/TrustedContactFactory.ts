import idx from 'idx'
import crypto from 'crypto'
import { ContactDetails, TrustedContact, UnecryptedStreamData } from './Interface'

export function generateTrustedContact(
  {
    contactDetails,
    channelKey,
    secondaryChannelKey,
    contactsSecondaryChannelKey,
    unEncryptedOutstreamUpdates,
  }: {
    contactDetails: ContactDetails,
    channelKey: string,
    secondaryChannelKey?: string,
    unEncryptedOutstreamUpdates: UnecryptedStreamData,
    contactsSecondaryChannelKey?: string,
 }
): TrustedContact {
  const newContact: TrustedContact = {
    contactDetails,
    channelKey,
    permanentChannelAddress: crypto
      .createHash( 'sha256' )
      .update( channelKey )
      .digest( 'hex' ),
    relationType: idx(
      unEncryptedOutstreamUpdates,
      ( _ ) => _.primaryData.relationType
    ),
    secondaryChannelKey,
    contactsSecondaryChannelKey,
    isActive: true,
    hasNewData: true,
    timestamps: {
      created: Date.now(),
    }
  }

  return newContact
}
