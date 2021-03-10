import { SERVICES_ENRICHED } from '../actions/storage'
import { KEEPERS_INFO } from '../../common/constants/wallet-service-types'
import KeeperService from '../../bitcoin/services/KeeperService'
import { IS_UPDATE_NEW_FCM, KEEPER_LOADING } from '../actions/keeper'

const initialState: {
  service: KeeperService;
  serviceEnriched: Boolean;
  loading: {
    fetchKeeperTC: Boolean;
  },
  isNewFCMUpdated: Boolean;
} = {
  service: null,
  serviceEnriched: false,
  loading: {
    fetchKeeperTC: false,
  },
  isNewFCMUpdated: false
}

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case SERVICES_ENRICHED:
        return {
          ...state,
          service: action.payload.services[ KEEPERS_INFO ],
          serviceEnriched: true,
        }

      case KEEPER_LOADING:
        return {
          ...state,
          loading: {
            ...state.loading,
            [ action.payload.beingLoaded ]: !state.loading[
              action.payload.beingLoaded
            ],
          },
        }

      case IS_UPDATE_NEW_FCM:
        return {
          ...state,
          isNewFCMUpdated: action.payload.flag,
        }
  }



  return state
}
