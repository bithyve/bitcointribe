import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import { SERVICES_ENRICHED } from '../actions/storage';
import { TRUSTED_CONTACTS } from '../../common/constants/serviceTypes';

const initialState: {
  service: TrustedContactsService;
  serviceEnriched: Boolean;
} = {
  service: null,
  serviceEnriched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SERVICES_ENRICHED:
      return {
        ...state,
        service: action.payload.services[TRUSTED_CONTACTS],
        serviceEnriched: true,
      };
  }

  return state;
};
