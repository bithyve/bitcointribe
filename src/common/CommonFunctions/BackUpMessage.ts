import BackupWithKeeperState from '../data/enums/BackupWithKeeperState'
import CreateWithKeeperState from '../data/enums/CreateWithKeeperState'

export function backUpMessage( days, levelData, createWithKeeperStatus,
  backupWithKeeperStatus, borderWalletBackupStatus, borderWalletMnemonic ): string {

  if( days > 180 )
    return 'Wallet backup phrase is expired'
  if ( days > 150 )
    return 'Wallet backup phrase will expire soon'
  if( ( createWithKeeperStatus == CreateWithKeeperState.BACKEDUP ||
      backupWithKeeperStatus == BackupWithKeeperState.BACKEDUP ) &&
      levelData[ 0 ].keeper1ButtonText?.toLowerCase() == 'seed' &&
    levelData[ 0 ].keeper1.status != 'notSetup' )
    return 'Recovery Phrase confirmed. Your wallet is backed-up with Bitcoin Keeper.'
  if( createWithKeeperStatus == CreateWithKeeperState.BACKEDUP ||
    backupWithKeeperStatus == BackupWithKeeperState.BACKEDUP )
    return 'Your wallet is backed up with Keeper'
  // if( levelData[ 0 ].keeper1.shareType == '' )
  //   return 'Confirm Backup Phrase'
  if( borderWalletBackupStatus && borderWalletBackupStatus.status && borderWalletMnemonic  )
    return 'Border Wallet backed-up successfully'
  if ( levelData[ 0 ].keeper1ButtonText?.toLowerCase() == 'seed' &&
    levelData[ 0 ].keeper1.status != 'notSetup' )
    return 'Wallet backup confirmed'
  return 'Backup to safeguard your wallet'
}

