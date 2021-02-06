import { ImageSourcePropType } from 'react-native'
import SyncStatus from '../../common/data/enums/SyncStatus'


export default function getAccountSyncIcon(
  syncStatus: SyncStatus
): ImageSourcePropType {

  switch ( syncStatus ){
      case SyncStatus.PENDING:
        return require( '../../assets/images/icons/icon_account_sync_pending.gif' )
      case SyncStatus.IN_PROGRESS:
        return require( '../../assets/images/icons/icon_account_sync_in_progress.gif' )
      case SyncStatus.COMPLETED:
        return require( '../../assets/images/icons/icon_account_sync_done.gif' )
      default:
        return require( '../../assets/images/icons/icon_account_sync_done.gif' )
  }
}
