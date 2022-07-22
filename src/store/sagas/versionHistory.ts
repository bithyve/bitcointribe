import idx from 'idx'
import { call, put, select } from 'redux-saga/effects'
import { VersionHistory } from '../../bitcoin/utilities/Interface'
import { createWatcher } from '../utils/utilities'
import DeviceInfo from 'react-native-device-info'
import moment from 'moment'
import { isEmpty,  buildVersionExists } from '../../common/CommonFunctions'
import { setVersionHistory, SET_VERSION } from '../actions/versionHistory'

function* versionHistoryWorker( { payload } ) {
  let versionHistory = yield select(
    ( ( state ) => idx( state, ( _ ) => _.versionHistory.versions ) )
  )

  let versionType = payload.versionType

  const id = versionHistory && versionHistory.length ? versionHistory.length + 1 : 1

  if( versionType !== 'Restored' ) {
    if( id==1 ) {
      versionType = 'Current'
    } else if( id>1 && !buildVersionExists( versionHistory ) )  {
      versionType = 'Upgraded'
    }
    else {
      return
    }

    // If id is 2 the first installed version needs to be renamed to Initial
    if( id==2 ) {versionHistory[ 0 ].versionName = versionHistory[ 0 ].versionName.replace( 'Current', 'Initial' )}
  }


  const data = {
    'id': id.toString(),
    'version': DeviceInfo.getVersion(),
    'buildNumber': DeviceInfo.getBuildNumber(),
    'versionName': versionType + ` Version ${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`,
    'title': '',
    date: moment( new Date() )
      .utc()
      .local()
      .format( 'DD MMMM YYYY HH:mm' )
  }

  if( typeof versionHistory == 'string' ){
    versionHistory = JSON.parse( versionHistory )
  }

  versionHistory.push( data )

  yield put( setVersionHistory( versionHistory ) )
}

export const versionHistoryWatcher = createWatcher(
  versionHistoryWorker,
  SET_VERSION,
)
