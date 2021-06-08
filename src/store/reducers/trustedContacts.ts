import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { SERVICES_ENRICHED } from '../actions/storage'
import { TRUSTED_CONTACTS } from '../../common/constants/wallet-service-types'
import {
  SYNC_PERMANENT_CHANNELS,
  EXISTING_PERMANENT_CHANNELS_SYNCHED,
  PermanentChannelsSyncKind
} from '../actions/trustedContacts'
import {
  TrustedContact,
  TrustedContactRelationTypes,
  Trusted_Contacts,
} from '../../bitcoin/utilities/Interface'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import RecipientKind from '../../common/data/enums/RecipientKind'
import idx from 'idx'
import TrustedContacts from '../../bitcoin/utilities/TrustedContacts'

export type TrustedContactsState = {
  service: TrustedContactsService;
  loading: {
    existingPermanentChannelsSynching: boolean;
  };
  trustedContactRecipients: ContactRecipientDescribing[];
};


const initialState: TrustedContactsState = {
  service: null,
  loading: {
    existingPermanentChannelsSynching: false,
  },
  trustedContactRecipients: [],
}


export default ( state: TrustedContactsState = initialState, action ): TrustedContactsState => {
  switch ( action.type ) {
      case SERVICES_ENRICHED:
        return {
          ...state,
          service: action.payload.services[ TRUSTED_CONTACTS ],
          trustedContactRecipients: reduceTCInfoIntoRecipientDescriptions( {
            trustedContacts: action.payload.services[ TRUSTED_CONTACTS ].tc.trustedContacts,
          } ),
        }

      case SYNC_PERMANENT_CHANNELS:
        const permanentChannelsSyncKind = action.payload.permanentChannelsSyncKind
        if( [ PermanentChannelsSyncKind.EXISTING_CONTACTS, PermanentChannelsSyncKind.NON_FINALIZED_CONTACTS ].includes( permanentChannelsSyncKind ) )
          return {
            ...state,
            loading: {
              ...state.loading,
              existingPermanentChannelsSynching: true,
            },
          }

      case EXISTING_PERMANENT_CHANNELS_SYNCHED:
        return {
          ...state,
          loading: {
            ...state.loading,
            existingPermanentChannelsSynching: false,
          },
        }
  }

  return state
}

export const SKIPPED_CONTACT_NAME = 'F&F request awaiting'

function reduceTCInfoIntoRecipientDescriptions( { trustedContacts, }: {
  trustedContacts: Trusted_Contacts;
} ): ContactRecipientDescribing[] {
  if( trustedContacts && Object.keys( trustedContacts ).length ){
    return Object.values( trustedContacts ).reduce( (
      accumulatedRecipients: ContactRecipientDescribing[],
      currentContact: TrustedContact | null,
    ): ContactRecipientDescribing[] => {
      if ( !currentContact ) { return accumulatedRecipients }

      const { contactDetails, relationType } = currentContact
      const contactName = contactDetails.contactName
      const isGuardian = [ TrustedContactRelationTypes.KEEPER, TrustedContactRelationTypes.KEEPER_WARD ].includes( relationType ) ? true : false
      const isWard: boolean = [ TrustedContactRelationTypes.WARD, TrustedContactRelationTypes.KEEPER_WARD ].includes( relationType )? true : false

      let trustKind: ContactTrustKind
      if ( isWard ) {
        trustKind = ContactTrustKind.KEEPER_OF_USER
      } else if ( isGuardian ) {
        trustKind = ContactTrustKind.USER_IS_KEEPING
      } else {
        trustKind = ContactTrustKind.OTHER
      }

      const contactsWalletId = currentContact.walletID
      let walletName, lastSeenActive, paymentAddresses
      if( contactsWalletId ) {
        const instreamId = TrustedContacts.getStreamId( contactsWalletId )
        const instream = idx( currentContact, ( _ ) => _.unencryptedPermanentChannel[ instreamId ] )
        walletName = idx( instream, ( _ ) => _.primaryData.walletName )
        lastSeenActive = idx( instream, ( _ ) => _.metaData.flags.lastSeen )
        paymentAddresses = idx( instream, ( _ ) => _.primaryData.paymentAddresses )
      }

      let displayedName
      if ( contactName.startsWith( SKIPPED_CONTACT_NAME )  && walletName ) {
        displayedName = walletName
      } else {
        displayedName = contactName
      }

      let recipientKind = RecipientKind.CONTACT
      // If name information still can't be found, assume it's an address (https://bithyve-workspace.slack.com/archives/CEBLWDEKH/p1605726329349400?thread_ts=1605725360.348800&cid=CEBLWDEKH)
      if ( !displayedName ) {
        recipientKind = RecipientKind.ADDRESS
        displayedName = `${contactDetails.id || '@'}`
      }

      const avatarImageSource = contactDetails.image
      const contactRecipient: ContactRecipientDescribing = {
        id: contactDetails.id,
        kind: recipientKind,
        trustKind,
        displayedName,
        walletName,
        avatarImageSource,
        lastSeenActive,
        paymentAddresses,
      }

      return [
        ...accumulatedRecipients,
        contactRecipient,
      ]
    }, [] )
  }
  return []
}
