import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import { SERVICES_ENRICHED } from '../actions/storage';
import { TRUSTED_CONTACTS } from '../../common/constants/serviceTypes';
import {
  INITIALIZE_TRUSTED_CONTACT,
  TRUSTED_CONTACT_INITIALIZED,
} from '../actions/trustedContacts';

const initialState: {
  service: TrustedContactsService;
  serviceEnriched: Boolean;
  shareablePubKey: string;
} = {
  service: null,
  serviceEnriched: false,
  shareablePubKey: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SERVICES_ENRICHED:
      return {
        ...state,
        service: action.payload.services[TRUSTED_CONTACTS],
        serviceEnriched: true,
      };

    case INITIALIZE_TRUSTED_CONTACT:
      return {
        ...state,
        shareablePubKey: null,
      };

    case TRUSTED_CONTACT_INITIALIZED:
      return {
        ...state,
        shareablePubKey: action.payload.publicKey,
      };
  }

  return state;
};
