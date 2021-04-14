import {
  UPGRADE_LOADING,
} from '../actions/upgradeToNewBhr'

const initialState: {
    loading: {
      initLevel2: Boolean;
      initLevels: boolean;
      cloudDataForLevel: boolean;
      secondarySetupAutoShare: boolean;
    };

  } = {
    loading: {
      initLevel2: false,
      initLevels: false,
      cloudDataForLevel: false,
      secondarySetupAutoShare: false
    },
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
  }
  return state
}

