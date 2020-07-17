import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import { SERVICES_ENRICHED } from '../actions/storage';
import { TRUSTED_CONTACTS } from '../../common/constants/serviceTypes';
import {
  TRUSTED_CONTACT_INITIALIZED,
  TRUSTED_CONTACT_APPROVED,
  EPHEMERAL_CHANNEL_FETCHED,
  EPHEMERAL_CHANNEL_UPDATED,
  TRUSTED_CHANNEL_UPDATED,
  TRUSTED_CHANNEL_FETCHED,
  PAYMENT_DETAILS_FETCHED,
  CLEAR_PAYMENT_DETAILS,
  SWITCH_TC_LOADING,

} from '../actions/trustedContacts';
import { EphemeralData, EphemeralDataElements } from '../../bitcoin/utilities/Interface';
import { UPDATE_ADDRESS_BOOK_LOCALLY, UPDATE_TRUSTED_CONTACT_INFO } from '../constants';
import { chain } from 'icepick'

const initialState: {
  service: TrustedContactsService;
  serviceEnriched: Boolean;
  initializedTrustedContacts: { [contactName: string]: { publicKey: string } }; //contact name to pubkey mapping
  approvedTrustedContacts: {
    [contactName: string]: {
      approved: Boolean;
    };
  };
  ephemeralChannel: {
    [contactName: string]: { updated: Boolean; data?: EphemeralDataElements };
  };
  trustedChannel: { [contactName: string]: { updated: Boolean; data?: any } };
  paymentDetails: {
    address?: string;
    paymentURI?: string;
  };

  loading: {
    updateEphemeralChannel: Boolean;
    trustedChannelsSync: Boolean;
  };
  addressBook: any,
  trustedContactsInfo: any
} = {
  service: null,
  serviceEnriched: false,
  initializedTrustedContacts: null,
  approvedTrustedContacts: null,
  ephemeralChannel: null,
  trustedChannel: null,
  paymentDetails: null,
  loading: {
    updateEphemeralChannel: false,
    trustedChannelsSync: false,
  },
  addressBook: null,
  trustedContactsInfo: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SERVICES_ENRICHED:
      return {
        ...state,
        service: action.payload.services[TRUSTED_CONTACTS],
        serviceEnriched: true,
      };

    case TRUSTED_CONTACT_INITIALIZED:
      return {
        ...state,
        initializedTrustedContacts: {
          ...state.initializedTrustedContacts,
          [action.payload.contactName]: { publicKey: action.payload.publicKey },
        },
      };

    case TRUSTED_CONTACT_APPROVED:
      return {
        ...state,
        approvedTrustedContacts: {
          ...state.approvedTrustedContacts,
          [action.payload.contactName]: {
            approved: action.payload.approved,
          },
        },
      };

    case EPHEMERAL_CHANNEL_UPDATED:
      return {
        ...state,
        ephemeralChannel: {
          ...state.ephemeralChannel,
          [action.payload.contactName]: {
            updated: action.payload.updated,
            data: action.payload.data,
          },
        },
      };

    case EPHEMERAL_CHANNEL_FETCHED:
      return {
        ...state,
        ephemeralChannel: {
          ...state.ephemeralChannel,
          [action.payload.contactName]: {
            data: action.payload.data,
          },
        },
      };

    case TRUSTED_CHANNEL_UPDATED:
      return {
        ...state,
        trustedChannel: {
          ...state.trustedChannel,
          [action.payload.contactName]: {
            updated: action.payload.updated,
            data: action.payload.data,
          },
        },
      };

    case TRUSTED_CHANNEL_FETCHED:
      return {
        ...state,
        trustedChannel: {
          ...state.trustedChannel,
          [action.payload.contactName]: {
            data: action.payload.data,
          },
        },
      };

    case PAYMENT_DETAILS_FETCHED:
      return {
        ...state,
        paymentDetails: action.payload.paymentDetails,
      };

    case CLEAR_PAYMENT_DETAILS:
      return {
        ...state,
        paymentDetails: null,
      };

    case SWITCH_TC_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.beingLoaded]: !state.loading[
            action.payload.beingLoaded
          ],
        },
      };


    case UPDATE_ADDRESS_BOOK_LOCALLY:
      return chain(state)
        .setIn(['addressBook'], action.payload)
        .value()

    case UPDATE_TRUSTED_CONTACT_INFO:
      return chain(state)
        .setIn(['trustedContactsInfo'], action.payload)
        .value()

  }

  return state;
};
