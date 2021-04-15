import {
  UPGRADE_LOADING,
  SET_UPGRADE_PROCESS_STATUS,
  SET_AVAILABLE_KEEPER_DATA,
  UPDATE_LEVEL_TO_SETUP
} from '../actions/upgradeToNewBhr'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'

const initialState: {
    loading: {
      initLevel2: Boolean;
      initLevels: boolean;
      cloudDataForLevel: boolean;
      secondarySetupAutoShare: boolean;
      contactSetupAutoShare: boolean;
      updateAvailKeeperDataStatus: boolean;
    };
    upgradeProcessStatus: KeeperProcessStatus;
    availableKeeperData: {shareId: string; type: string; status?: boolean}[];
    levelToSetup: number;
  } = {
    loading: {
      initLevel2: false,
      initLevels: false,
      cloudDataForLevel: false,
      secondarySetupAutoShare: false,
      contactSetupAutoShare: false,
      updateAvailKeeperDataStatus: false,
    },
    upgradeProcessStatus: KeeperProcessStatus.PENDING,
    availableKeeperData: [],
    levelToSetup: 0
  }

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case UPGRADE_LOADING:
        return {
          ...state,
          loading: {
            ...state.loading,
            [ action.payload.beingLoaded ]: !state.loading[
              action.payload.beingLoaded
            ],
          },
        }

      case SET_UPGRADE_PROCESS_STATUS:
        return {
          ...state,
          upgradeProcessStatus: action.payload.status,
        }

      case SET_AVAILABLE_KEEPER_DATA:
        return {
          ...state,
          availableKeeperData: action.payload.availableKeeperData,
        }

      case UPDATE_LEVEL_TO_SETUP:
        return {
          ...state,
          levelToSetup: action.payload.level,
        }

  }
  return state
}

