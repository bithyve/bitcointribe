import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { SERVICES_ENRICHED } from '../actions/storage'
import { TRUSTED_CONTACTS } from '../../common/constants/wallet-service-types'
import {
  TRUSTED_CONTACT_APPROVED,
  EPHEMERAL_CHANNEL_FETCHED,
  EPHEMERAL_CHANNEL_UPDATED,
  TRUSTED_CHANNEL_UPDATED,
  TRUSTED_CHANNEL_FETCHED,
  SWITCH_TC_LOADING,
  APPROVE_TRUSTED_CONTACT,
  CLEAR_TRUSTED_CONTACTS_CACHE,
  UPGRADE_REDUCER,
  SYNC_EXISTING_PERMANENT_CHANNELS,
  EXISTING_PERMANENT_CHANNELS_SYNCHED,
} from '../actions/trustedContacts'
import {
  EphemeralDataElements,
  TrustedContact,
  TrustedContactRelationTypes,
  Trusted_Contacts,
} from '../../bitcoin/utilities/Interface'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import RecipientKind from '../../common/data/enums/RecipientKind'
import idx from 'idx'

export type TrustedContactsState = {
  service: TrustedContactsService;

  approvedTrustedContacts: {
    [contactName: string]: {
      approved: boolean;
    };
  };

  ephemeralChannel: {
    [contactName: string]: { updated: boolean; data?: EphemeralDataElements };
  };

  trustedChannel: { [contactName: string]: { updated: boolean; data?: unknown } };

  // paymentDetails: {
  //   address?: string;
  //   paymentURI?: string;
  // };

  loading: {
    updateEphemeralChannel: boolean;
    updateTrustedChannel: boolean;
    existingPermanentChannelsSynching: boolean;
    approvingTrustedContact: boolean;
    walletCheckIn: boolean;
  };
  trustedContactRecipients: ContactRecipientDescribing[];
};


const initialState: TrustedContactsState = {
  service: null,
  approvedTrustedContacts: null,
  ephemeralChannel: null,
  trustedChannel: null,
  // paymentDetails: null,
  loading: {
    updateEphemeralChannel: false,
    updateTrustedChannel: false,
    existingPermanentChannelsSynching: false,
    approvingTrustedContact: false,
    walletCheckIn: false,
  },
  trustedContactRecipients: [],
}


export default ( state: TrustedContactsState = initialState, action ): TrustedContactsState => {
  switch ( action.type ) {
      case CLEAR_TRUSTED_CONTACTS_CACHE:
        return {
          ...state,
          loading: {
            ...state.loading,
            approvingTrustedContact: false,
          },
        }
      case SERVICES_ENRICHED:
        return {
          ...state,
          service: action.payload.services[ TRUSTED_CONTACTS ],
          trustedContactRecipients: reduceTCInfoIntoRecipientDescriptions( {
            trustedContacts: action.payload.services[ TRUSTED_CONTACTS ].tc.trustedContacts,
          } ),
        }

      case APPROVE_TRUSTED_CONTACT:
        return {
          ...state,
          loading: {
            ...state.loading,
            approvingTrustedContact: true,
          },
        }

      case SYNC_EXISTING_PERMANENT_CHANNELS:
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

      case TRUSTED_CONTACT_APPROVED:
        return {
          ...state,
          approvedTrustedContacts: {
            ...state.approvedTrustedContacts,
            [ action.payload.contactName ]: {
              approved: action.payload.approved,
            },
          },
          loading: {
            ...state.loading,
            approvingTrustedContact: false,
          },
        }

      case EPHEMERAL_CHANNEL_UPDATED:
        return {
          ...state,
          ephemeralChannel: {
            ...state.ephemeralChannel,
            [ action.payload.contactName ]: {
              updated: action.payload.updated,
              data: action.payload.data,
            },
          },
        }

      case EPHEMERAL_CHANNEL_FETCHED:
        return {
          ...state,
          ephemeralChannel: {
            ...state.ephemeralChannel,
            [ action.payload.contactName ]: {
              data: action.payload.data,
            },
          },
        }

      case TRUSTED_CHANNEL_UPDATED:
        return {
          ...state,
          trustedChannel: {
            ...state.trustedChannel,
            [ action.payload.contactName ]: {
              updated: action.payload.updated,
              data: action.payload.data,
            },
          },
        }

      case TRUSTED_CHANNEL_FETCHED:
        return {
          ...state,
          trustedChannel: {
            ...state.trustedChannel,
            [ action.payload.contactName ]: {
              data: action.payload.data,
            },
          },
        }

        // case PAYMENT_DETAILS_FETCHED:
        //   return {
        //     ...state,
        //     paymentDetails: action.payload.paymentDetails,
        //   }

        // case CLEAR_PAYMENT_DETAILS:
        //   return {
        //     ...state,
        //     paymentDetails: null,
        //   }

      case SWITCH_TC_LOADING:
        return {
          ...state,
          loading: {
            ...state.loading,
            [ action.payload.beingLoaded ]: !state.loading[
              action.payload.beingLoaded
            ],
          },
        }

      case UPGRADE_REDUCER:
        return {
          ...state,
          trustedContactRecipients: reduceTCInfoIntoRecipientDescriptions( {
            trustedContacts: action.payload.services[ TRUSTED_CONTACTS ].tc.trustedContacts,
          } ),
        }

  }

  return state
}


function reduceTCInfoIntoRecipientDescriptions( { trustedContacts, }: {
  trustedContacts: Trusted_Contacts;
} ): ContactRecipientDescribing[] {
  if( trustedContacts && Object.keys( trustedContacts ).length ){
    return Object.values( trustedContacts ).reduce( (
      accumulatedRecipients: ContactRecipientDescribing[],
      currentTCObject: TrustedContact | null,
    ): ContactRecipientDescribing[] => {
      if ( !currentTCObject ) { return accumulatedRecipients }

      const { contactDetails, relationType } = currentTCObject
      const contactName = contactDetails.contactName
      const isGuardian = relationType === TrustedContactRelationTypes.KEEPER ? true : false
      const isWard: boolean = relationType === TrustedContactRelationTypes.WARD? true : false
      const walletName: string | null = idx( currentTCObject, ( _ ) => _.unencryptedPermanentChannel[ '' ].primaryData.walletName )
      const lastSeenActive: number | null = idx( currentTCObject, ( _ ) => _.unencryptedPermanentChannel[ '' ].metaData.flags.lastSeen )

      let trustKind: ContactTrustKind

      // TODO: Figure out the meaning of these properties and whether or not this is
      // actually the correct logic.
      if ( isWard ) {
        trustKind = ContactTrustKind.KEEPER_OF_USER
      } else if ( isGuardian ) {
        trustKind = ContactTrustKind.USER_IS_KEEPING
      } else {
        trustKind = ContactTrustKind.OTHER
      }


      let displayedName = contactName || walletName

      // 📝 Attempt at being more robust for the issue noted here: https://github.com/bithyve/hexa/issues/2004#issuecomment-728635654
      if ( displayedName &&
      [
        'f&f request',
        'f&f request awaiting',
        'f & f request',
        'f & f request awaiting',
      ].some( ( placeholder ) => displayedName.includes( placeholder ) )
      ) {
        displayedName = walletName
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
      }

      return [
        ...accumulatedRecipients,
        contactRecipient,
      ]
    }, [] )
  }
  return []
}
