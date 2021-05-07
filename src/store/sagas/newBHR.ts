import { call, delay, put, select } from 'redux-saga/effects'
import { SECURE_ACCOUNT } from '../../common/constants/wallet-service-types'
import LevelStatus from '../../common/data/enums/LevelStatus'
import { generateMetaShare, generateSMMetaShares } from '../actions/health'
import { navigateToHistoryPage, ON_PRESS_KEEPER, setIsKeeperTypeBottomSheetOpen, setLevelCompletionError } from '../actions/newBHR'
import { createWatcher } from '../utils/utilities'



function* onPressKeeperChannelWorker( { payload } ) {
  try {
    const { value, number } = payload
    console.log( 'value, number', value, number )
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    const isLevelThreeMetaShareCreated = yield select( ( state ) => state.health.isLevelThreeMetaShareCreated )
    const isLevel3Initialized = yield select( ( state ) => state.health.isLevel3Initialized )
    const isLevelTwoMetaShareCreated = yield select( ( state ) => state.health.isLevelTwoMetaShareCreated )
    const isLevel2Initialized = yield select( ( state ) => state.health.isLevel2Initialized )
    const secureAccount = yield select( ( state ) => state.accounts[ SECURE_ACCOUNT ].service )
    const metaSharesKeeper = yield select( ( state ) => state.health.service.levelhealth.metaSharesKeeper )
    const isSmMetaSharesCreatedFlag = yield select( ( state ) => state.health.isSmMetaSharesCreatedFlag )
    console.log( 'currentLevel', currentLevel )

    if( currentLevel === 0 && ( value.id === 2 || value.id === 3 ) ){
      yield put( setLevelCompletionError( 'Please complete Level 1', 'It seems you have not backed up your wallet on the cloud. Please complete Level 1 to proceed', LevelStatus.FAILED ) )
      return
    } else if (
      currentLevel == 1 &&
      number == 2 &&
      value.id == 2 &&
      !isLevelTwoMetaShareCreated &&
      !isLevel2Initialized
    ) {
      yield put( setLevelCompletionError( 'Please complete Personal Device Setup', 'It seems you have not completed Personal Device setup, please complete Personal Device setup to proceed', LevelStatus.FAILED ) )
      return
    } else if (
      ( currentLevel == 1 &&
      value.id == 3 &&
      !isLevelThreeMetaShareCreated &&
      !isLevel3Initialized )
    ){
      yield put( setLevelCompletionError( 'Please complete Level 2', 'It seems you have not completed Level 2. Please complete Level 2 to proceed', LevelStatus.FAILED ) )
      return
    }
    const keeper = number == 1 ? value.keeper1 : value.keeper2

    const obj = {
      id: value.id,
      selectedKeeper: {
        ...keeper,
        name: value.id === 2 && number == 1 ? 'Secondary Device1' : keeper.name,
        shareType: value.id === 2 && number == 1 ? 'device' : keeper.shareType,
        shareId: keeper.shareId ? keeper.shareId : value.id == 2 ? metaSharesKeeper[ 1 ] ? metaSharesKeeper[ 1 ].shareId: '' : metaSharesKeeper[ 4 ] ? metaSharesKeeper[ 4 ].shareId : ''
      },
      isSetup: keeper.updatedAt ? false : true,
      isPrimaryKeeper: number === 1 && value.id == 2 ? true : false,
      isChangeKeeperAllow: currentLevel == 1 && value.id == 2 ? false : currentLevel == 2 && metaSharesKeeper.length === 5 ? false : true
    }
    if ( keeper.updatedAt > 0 ) {
      yield put( navigateToHistoryPage( obj ) )
    } else {
      if ( value.id === 2 && number === 1 && currentLevel === 1 ) {
        if ( !isLevel2Initialized && !isLevelTwoMetaShareCreated &&
          value.id == 2 && metaSharesKeeper.length != 3
        ) {
          yield put( generateMetaShare( value.id ) )
        } else {
          yield put( navigateToHistoryPage( obj ) )
        }
        if( !isSmMetaSharesCreatedFlag ){
          yield put( generateSMMetaShares() )
        }
      } else {
        // if ( ( value.id === 2 && number === 2 && isLevelTwoMetaShareCreated &&
        //   isLevel2Initialized ) || ( value.id === 3 && isLevelThreeMetaShareCreated &&
        //     isLevel3Initialized ) )
        yield put( setIsKeeperTypeBottomSheetOpen( true ) )
      }
    }
  } catch ( error ) {
    console.log( error )
  }
}


export const onPressKeeperChannelWatcher = createWatcher(
  onPressKeeperChannelWorker,
  ON_PRESS_KEEPER
)
