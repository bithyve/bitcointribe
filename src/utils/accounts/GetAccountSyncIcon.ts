import { ImageSourcePropType } from 'react-native'


export default function getAccountSyncIcon(
  hasAccountSyncCompleted: boolean
): ImageSourcePropType {
  if ( hasAccountSyncCompleted ) return require( '../../assets/images/icons/icon_account_sync_done.png' )
  else return require( '../../assets/images/icons/icon_account_sync_pending.png' )

}
