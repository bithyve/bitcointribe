import { put, select, call } from 'redux-saga/effects'
import LevelStatus from '../../common/data/enums/LevelStatus'
import { generateMetaShare } from '../actions/health'
import { navigateToHistoryPage, ON_PRESS_KEEPER, setIsKeeperTypeBottomSheetOpen, setLevelCompletionError } from '../actions/newBHR'
import { createWatcher } from '../utils/utilities'
import { LevelHealthInterface, MetaShare } from '../../bitcoin/utilities/Interface'
import dbManager from '../../storage/realm/dbManager'

function* onPressKeeperChannelWorker( { payload } ) {
  try {
    const { value, number } = payload
    console.log( 'value, number', value, number )
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const isLevelThreeMetaShareCreated = yield select( ( state ) => state.health.isLevelThreeMetaShareCreated )
    const isLevel3Initialized = yield select( ( state ) => state.health.isLevel3Initialized )
    const isLevelTwoMetaShareCreated = yield select( ( state ) => state.health.isLevelTwoMetaShareCreated )
    const isLevel2Initialized = yield select( ( state ) => state.health.isLevel2Initialized )
    // const s3 = yield call( dbManager.getS3Services )
    // console.log( 's3', s3 )
    const metaSharesKeeper: MetaShare[] = []//[ ...s3.metaSharesKeeper ]
    console.log( 'currentLevel', currentLevel )

    if( currentLevel === 0 && value.id === 1 && levelHealth[ 0 ].levelInfo[ 0 ].status=='notSetup' ){
      yield put( setLevelCompletionError( 'Please complete Level 1', 'It seems you have not backed up your wallet on the cloud. Please complete Level 1 to proceed', LevelStatus.FAILED ) )
      return
    }
    else if( currentLevel === 0 && ( value.id === 2 || value.id === 3 ) ){
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
        name: keeper.name,
        shareType: keeper.shareType,
        shareId: keeper.shareId ? keeper.shareId : value.id == 2 ? metaSharesKeeper[ 1 ] ? metaSharesKeeper[ 1 ].shareId: '' : metaSharesKeeper[ 4 ] ? metaSharesKeeper[ 4 ].shareId : ''
      },
      isSetup: keeper.status == 'notSetup' ? true : false,
      isPrimaryKeeper: false,
      isChangeKeeperAllow: currentLevel == 1 && value.id == 2 ? false : currentLevel == 2 && metaSharesKeeper.length === 5 ? false : true
    }
    if ( keeper.status != 'notSetup' ) {
      yield put( navigateToHistoryPage( obj ) )
    } else {
      if ( value.id === 2 && number === 1 && currentLevel === 1 ) {
        if ( !isLevel2Initialized && !isLevelTwoMetaShareCreated &&
          value.id == 2 && metaSharesKeeper.length != 3
        ) {
          yield put( generateMetaShare( value.id ) )
        } else if( keeper.shareType == '' || keeper.status == 'notSetup' ){
          yield put( setIsKeeperTypeBottomSheetOpen( true ) )
        } else {
          yield put( navigateToHistoryPage( obj ) )
        }
      } else {
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
