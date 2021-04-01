import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { SERVICES_ENRICHED } from '../actions/storage'
import { TRUSTED_CONTACTS } from '../../common/constants/wallet-service-types'
import {
  TRUSTED_CONTACT_APPROVED,
  EPHEMERAL_CHANNEL_FETCHED,
  EPHEMERAL_CHANNEL_UPDATED,
  TRUSTED_CHANNEL_UPDATED,
  TRUSTED_CHANNEL_FETCHED,
  PAYMENT_DETAILS_FETCHED,
  CLEAR_PAYMENT_DETAILS,
  SWITCH_TC_LOADING,
  APPROVE_TRUSTED_CONTACT,
  CLEAR_TRUSTED_CONTACTS_CACHE,
  UPDATE_ADDRESS_BOOK_LOCALLY,
  UPDATE_TRUSTED_CONTACTS_INFO,
  UPGRADE_REDUCER,
} from '../actions/trustedContacts'
import {
  ContactElements,
  Contacts,
  EphemeralDataElements,
} from '../../bitcoin/utilities/Interface'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import RecipientKind from '../../common/data/enums/RecipientKind'
import { ImageSourcePropType } from 'react-native'


// TODO: Fill this out and eventually move it to a more sensible place.
type TrustedContactInfo = {
  id: string;
  firstName: string;
  lastName: string | null | undefined;
  imageAvailable: boolean;
  image?: ImageSourcePropType;
} & Record<string, unknown>;


export type AddressBook = {
  myKeepers: ContactRecipientDescribing[];
  contactsKeptByUser: ContactRecipientDescribing[];
  otherTrustedContacts: ContactRecipientDescribing[];
  trustedContacts: ContactRecipientDescribing[];
};


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

  paymentDetails: {
    address?: string;
    paymentURI?: string;
  };

  loading: {
    updateEphemeralChannel: boolean;
    updateTrustedChannel: boolean;
    trustedChannelsSetupSync: boolean;
    approvingTrustedContact: boolean;
    walletCheckIn: boolean;
  };

  addressBook: AddressBook;
  trustedContactsInfo: TrustedContactInfo[];

  trustedContactRecipients: ContactRecipientDescribing[];
};


const initialState: TrustedContactsState = {
  service: null,
  approvedTrustedContacts: null,
  ephemeralChannel: null,
  trustedChannel: null,
  paymentDetails: null,
  loading: {
    updateEphemeralChannel: false,
    updateTrustedChannel: false,
    trustedChannelsSetupSync: false,
    approvingTrustedContact: false,
    walletCheckIn: false,
  },
  addressBook: null,
  trustedContactsInfo: [],
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
            trustedContactsInfo: state.trustedContactsInfo,
            backendTrustedContactsData: action.payload.services[ TRUSTED_CONTACTS ].tc.trustedContacts,
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

      case PAYMENT_DETAILS_FETCHED:
        return {
          ...state,
          paymentDetails: action.payload.paymentDetails,
        }

      case CLEAR_PAYMENT_DETAILS:
        return {
          ...state,
          paymentDetails: null,
        }

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

      case UPDATE_ADDRESS_BOOK_LOCALLY:
        return {
          ...state,
          addressBook: action.payload,
        }

      case UPDATE_TRUSTED_CONTACTS_INFO:
        return {
          ...state,
          trustedContactsInfo: action.payload.trustedContactsInfo,
          trustedContactRecipients: reduceTCInfoIntoRecipientDescriptions( {
            trustedContactsInfo: action.payload.trustedContactsInfo,
            backendTrustedContactsData: state.service.tc.trustedContacts,
          } ),
        }
      case UPGRADE_REDUCER:
        return {
          ...state,
          service: action.payload.legacyTrustedContactData.service ? action.payload.legacyTrustedContactData.service : null,
          approvedTrustedContacts: action.payload.legacyTrustedContactData.approvedTrustedContacts ? action.payload.legacyTrustedContactData.approvedTrustedContacts : null,
          ephemeralChannel: action.payload.legacyTrustedContactData.ephemeralChannel ? action.payload.legacyTrustedContactData.ephemeralChannel :null,
          trustedChannel: action.payload.legacyTrustedContactData.trustedChannel ? action.payload.legacyTrustedContactData.trustedChannel : null,
          paymentDetails: action.payload.legacyTrustedContactData.paymentDetails ? action.payload.legacyTrustedContactData.paymentDetails : null,
          loading: {
            updateEphemeralChannel: action.payload.legacyTrustedContactData.updateEphemeralChannel ? action.payload.legacyTrustedContactData.updateEphemeralChannel : false,
            updateTrustedChannel: action.payload.legacyTrustedContactData.updateTrustedChannel ? action.payload.legacyTrustedContactData.updateTrustedChannel : false,
            trustedChannelsSetupSync: action.payload.legacyTrustedContactData.trustedChannelsSetupSync ? action.payload.legacyTrustedContactData.trustedChannelsSetupSync :false,
            approvingTrustedContact: action.payload.legacyTrustedContactData.approvingTrustedContact ? action.payload.legacyTrustedContactData.approvingTrustedContact : false,
            walletCheckIn: action.payload.legacyTrustedContactData.walletCheckIn ? action.payload.legacyTrustedContactData.walletCheckIn : false,
          },
          addressBook: action.payload.legacyTrustedContactData.addressBook ? action.payload.legacyTrustedContactData.addressBook : null,
          trustedContactsInfo: action.payload.legacyTrustedContactData.trustedContactsInfo ? action.payload.legacyTrustedContactData.trustedContactsInfo : [],
          trustedContactRecipients: action.payload.legacyTrustedContactData.trustedContactRecipients ? action.payload.legacyTrustedContactData.trustedContactRecipients : [],
        }

  }

  return state
}


function reduceTCInfoIntoRecipientDescriptions( {
  trustedContactsInfo,
  backendTrustedContactsData,
}: {
  trustedContactsInfo: TrustedContactInfo[];
  backendTrustedContactsData: Contacts;
} ): ContactRecipientDescribing[] {
  return trustedContactsInfo && trustedContactsInfo.length && trustedContactsInfo.reduce( (
    accumulatedRecipients: ContactRecipientDescribing[],
    currentTCInfoObject: TrustedContactInfo | null,
    currentIndex: number,
  ): ContactRecipientDescribing[] => {
    if ( !currentTCInfoObject ) { return accumulatedRecipients }

    // TODO: This is probably not a reliable/safe way to determine whether or not
    // someone is a guardian.
    const isGuardian = currentIndex < 3 ? true : false

    const contactName = `${currentTCInfoObject.firstName} ${
      currentTCInfoObject.lastName ? currentTCInfoObject.lastName : ''
    }`
      .toLowerCase()
      .trim()

    const backendTCInfo: ContactElements = backendTrustedContactsData[ contactName ]

    const isWard: boolean = backendTCInfo && backendTCInfo.isWard || false
    const hasTrustedAddress = Boolean( backendTCInfo && backendTCInfo.trustedAddress ) || Boolean( backendTCInfo && backendTCInfo.trustedTestAddress )
    const walletName: string | null = backendTCInfo && backendTCInfo.contactsWalletName || null
    const lastSeenActive: number | null = backendTCInfo && backendTCInfo.lastSeen || null
    const initiatedAt: number | null = backendTCInfo && backendTCInfo?.ephemeralChannel?.initiatedAt || null
    const hasTrustedChannelWithUser = Boolean( backendTCInfo && backendTCInfo.symmetricKey )


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


    let displayedName = `${currentTCInfoObject.firstName} ${currentTCInfoObject.lastName || ''}`
      || walletName

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
      displayedName = `${currentTCInfoObject.id || '@'}`
    }

    const avatarImageSource = currentTCInfoObject.imageAvailable ? currentTCInfoObject.image : null

    const contactRecipient: ContactRecipientDescribing = {
      id: currentTCInfoObject.id,
      kind: recipientKind,
      trustKind,
      displayedName,
      walletName,
      avatarImageSource,
      initiatedAt,
      lastSeenActive,
      hasTrustedAddress,
      hasTrustedChannelWithUser,
    }

    return [
      ...accumulatedRecipients,
      contactRecipient,
    ]
  }, [] )
}
