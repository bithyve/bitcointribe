import { SERVICES_ENRICHED } from '../actions/storage';
import { KEEPERS_INFO } from '../../common/constants/serviceTypes';
import KeeperService from '../../bitcoin/services/KeeperService';

const initialState: {
  service: KeeperService;
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
        service: action.payload.services[KEEPERS_INFO],
        serviceEnriched: true,
      };
  }

  return state;
};
