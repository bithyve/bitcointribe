import idx from 'idx'
import { call, put, select } from 'redux-saga/effects'
import { VersionHistory } from '../../bitcoin/utilities/Interface'
import { createWatcher } from '../utils/utilities'
import DeviceInfo from 'react-native-device-info'
import moment from 'moment'
import { isEmpty, isExistBuildVersion } from '../../common/CommonFunctions'
import { setVersionHistory, SET_VERSION } from '../actions/versionHistory'

function* versionHistoryWorker( { payload } ) {
  const versionHistory = yield select(
    ( ( state ) => idx( state, ( _ ) => _.versionHistory.versions ) )
  )
  let versionType = payload.versionType

  let versionData = []
  //console.log("VersionHistory", versionHistory, typeof versionHistory);
  let data = {
    'id': '1',
    'version': DeviceInfo.getVersion(),
    'buildNumber': DeviceInfo.getBuildNumber(),
    'versionName': versionType + ` Version ${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`,
    'title': '',
    date: moment( new Date() )
      .utc()
      .local()
      .format( 'DD MMMM YYYY HH:mm' )
  }
  if ( versionHistory && !isEmpty( versionHistory ) ) {
    versionData = versionHistory
    const id = versionData && versionData.length ? versionData.length + 1 : 1
    // if id is 1 it is the first and only installation so it is named Current
    if ( id==1 ) {versionType = 'Current'}
    // If id is 2 the first install'd version needs to be renamed to Initial
    if( id==2 ) {versionData[ 0 ].versionName = versionData[ 0 ].versionName.replace( 'Current', 'Initial' )}

    data = {
      ...data,
      'versionName': versionType + ` Version ${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`,
    }

    if ( ( versionType && versionType == 'Restored' ) || isExistBuildVersion( versionData ) ) {
      data = {
        ...data,
        'id': id.toString()
      }
    } else{
      return
    }
  }
  versionData.push( data )
  //console.log("versionData", versionData);

  yield put( setVersionHistory( versionData ) )
}

export const versionHistoryWatcher = createWatcher(
  versionHistoryWorker,
  SET_VERSION,
)
