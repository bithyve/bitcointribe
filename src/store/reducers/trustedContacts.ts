import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import { SERVICES_ENRICHED } from '../actions/storage';
import { TRUSTED_CONTACTS } from '../../common/constants/serviceTypes';
import {
  TRUSTED_CONTACT_INITIALIZED,
  TRUSTED_CONTACT_APPROVED,
} from '../actions/trustedContacts';

const initialState: {
  service: TrustedContactsService;
  serviceEnriched: Boolean;
  initializedTrustedContacts: { [contactName: string]: { publicKey: string } }; //contact name to pubkey mapping
  approvedTrustedContacts: {
    [contactName: string]: {
      approved: Boolean;
    };
  };
} = {
  service: null,
  serviceEnriched: false,
  initializedTrustedContacts: null,
  approvedTrustedContacts: null,
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
  }

  return state;
};
