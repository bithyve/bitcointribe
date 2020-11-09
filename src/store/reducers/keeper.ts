import { SERVICES_ENRICHED } from '../actions/storage';
import { KEEPERS_INFO } from '../../common/constants/serviceTypes';
import KeeperService from '../../bitcoin/services/KeeperService';
import { KEEPER_LOADING } from '../actions/keeper';

const initialState: {
  service: KeeperService;
  serviceEnriched: Boolean;
  loading: {
    fetchKeeperTC: Boolean;
  }
} = {
  service: null,
  serviceEnriched: false,
  loading: {
    fetchKeeperTC: false,
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SERVICES_ENRICHED:
      return {
        ...state,
        service: action.payload.services[KEEPERS_INFO],
        serviceEnriched: true,
      };

    case KEEPER_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.beingLoaded]: !state.loading[
            action.payload.beingLoaded
          ],
        },
      };
  }

  return state;
};
