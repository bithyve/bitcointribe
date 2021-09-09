import { Platform } from 'react-native'
import { KeeperInfoInterface, LevelData, LevelHealthInterface, LevelInfo, Trusted_Contacts } from '../bitcoin/utilities/Interface'
import { makeContactRecipientDescription } from '../utils/sending/RecipientFactories'
import ContactTrustKind from './data/enums/ContactTrustKind'

export const UsNumberFormat = ( amount, decimalCount = 0, decimal = '.', thousands = ',' ) => {
  try {
    decimalCount = Math.abs( decimalCount )
    decimalCount = isNaN( decimalCount ) ? 2 : decimalCount
    const negativeSign = amount < 0 ? '-' : ''
    const i = parseInt( amount = Math.abs( Number( amount ) || 0 ).toFixed( decimalCount ) ).toString()
    const j = ( i.length > 3 ) ? i.length % 3 : 0
    return negativeSign + ( j ? i.substr( 0, j ) + thousands : '' ) + i.substr( j ).replace( /(\d{3})(?=\d)/g, '$1' + thousands ) + ( decimalCount ? decimal + Math.abs( amount - i ).toFixed( decimalCount ).slice( 2 ) : '' )
  } catch ( e ) {
    // console.log(e)
  }
}

export const timeConvert = ( valueInMinutes ) => {
  const num = valueInMinutes
  const hours = Math.round( num / 60 )
  const days = Math.round( hours / 24 )
  if ( valueInMinutes < 60 ) {
    return valueInMinutes + ' minutes'
  } else if ( hours < 24 ) {
    return hours + ' hours'
  } else if ( days > 0 ) {
    return days == 1 ? days + ' day' : days + ' days'
  }
}

export const timeConvertNear30 = ( valueInMinutes ) => {
  if ( valueInMinutes < 60 ) {
    return '.5 hours'
  }
  const num = Math.ceil( valueInMinutes / 30 ) * 30
  const hours = ( num / 60 )
  const rhours = Math.floor( hours )
  const minutes = ( hours - rhours ) * 60
  const rminutes = Math.round( minutes )
  if ( rhours > 0 && rminutes <= 0 ) {
    return rhours + ' hours'
  } else if ( rhours > 0 && rminutes > 0 ) {
    return rhours + '.5 hours'
  } else {
    return rminutes + ' minutes'
  }
}

export const getVersions = ( versionHistory, restoreVersions ) => {
  let versions = []
  const versionHistoryArray = []
  const restoreVersionsArray = []
  if( versionHistory ){
    for ( let i=0; i<versionHistory.length; i++ ) {
      versionHistoryArray.push( versionHistory[ i ] )
    }
  }
  //console.log("versionHistoryArray",versionHistoryArray);

  if( restoreVersions ){
    for ( let i=0; i<restoreVersions.length; i++ ) {
      restoreVersionsArray.push( restoreVersions[ i ] )
    }
  }
  //console.log("restoreVersionsArray",restoreVersionsArray);

  if( versionHistoryArray.length && restoreVersionsArray.length ){
    versions = [ ...versionHistoryArray, ...restoreVersionsArray ]
  } else if( versionHistoryArray.length ){
    versions = [ ...versionHistoryArray ]
  } else if( restoreVersionsArray.length ){
    versions = [ ...restoreVersionsArray ]
  }
  //console.log("versions",versions);

  return versions
}

// Health Modification and calculation methods
export const checkLevelHealth = (
  levelData: LevelData[],
  levelHealthVar: LevelHealthInterface[],
) => {
  try {
    if( levelHealthVar.length ){
      if( levelHealthVar.length == 1 ){
        const levelInfo = levelHealthVar[ 0 ].levelInfo
        const elements =  arrayChunks( levelInfo, 2 )
        for ( let j = 0; j < elements.length; j++ ) {
          const element = elements[ j ]
          levelData[ j ].keeper1 = element[ 0 ]
          levelData[ j ].keeper2 = element[ 1 ]
          levelData[ j ].status = checkStatus( levelInfo )
        }
      } else {
        const levelInfo0 = levelHealthVar[ 0 ].levelInfo
        const levelInfo1 = levelHealthVar[ 1 ].levelInfo
        const elements0 =  arrayChunks( levelInfo0, 2 )
        const elements1 =  arrayChunks( levelInfo1, 2 )
        for ( let j = elements1.length - 1; j >= 0; j-- ) {
          const element0 = elements0[ j ] ? elements0[ j ] : null
          const element1 = elements1[ j ]
          levelData[ j ].keeper1 = element0 && element0[ 0 ] ? element0[ 0 ] : levelData[ j ].keeper1
          levelData[ j ].keeper2 = element0 && element0[ 1 ] ? element0[ 1 ] : levelData[ j ].keeper2
          levelData[ j ].status = checkStatus( levelInfo1 )
          if( elements1.length == 3 && j == 2 ) {
            levelData[ j ].keeper1 = element1[ 0 ]
            levelData[ j ].keeper2 = element1[ 1 ]
            levelData[ j ].status = checkStatus( levelInfo1 )
          }
          if( elements1.length == 2 && j == 1 ) {
            levelData[ j ].keeper1 = element1[ 0 ]
            levelData[ j ].keeper2 = element1[ 1 ]
            levelData[ j ].status = checkStatus( levelInfo1 )
          }
        }
      }
    }
    return levelData
  } catch ( error ) {
    console.log( 'error', error )
  }
}

export const checkStatus = ( levelInfo: LevelInfo[] ) => {
  let status = 'notSetup'
  let goodCount = 0
  let setupCount = 0
  if( levelInfo.length ) {
    for ( let i = 0; i < levelInfo.length; i++ ) {
      const element = levelInfo[ i ]
      if( element.status == 'accessible' ) goodCount++
      if( element.updatedAt == 0 ) setupCount++
    }
    if( setupCount ) status = 'notSetup'
    else if( goodCount == levelInfo.length ) status = 'good'
    else if( goodCount < levelInfo.length ) status = 'bad'
    return status
  }
  return status
}

export const getModifiedData = ( keeperInfo:KeeperInfoInterface[], levelHealthVar: LevelHealthInterface[], trustedContact: Trusted_Contacts ) => {
  if ( keeperInfo.length > 0 ) {
    for ( let j = 0; j < levelHealthVar.length; j++ ) {
      const elementJ = levelHealthVar[ j ]
      for ( let i = 0; i < elementJ.levelInfo.length; i++ ) {
        const element = elementJ.levelInfo[ i ]
        const selectedKeeperInfo: KeeperInfoInterface = keeperInfo.find( value  => value.shareId == element.shareId )
        const channelKey = selectedKeeperInfo && selectedKeeperInfo.channelKey ? selectedKeeperInfo.channelKey : null
        const data = channelKey ? {
          index: selectedKeeperInfo && Object.keys( selectedKeeperInfo.data ).length && selectedKeeperInfo.data.index ? selectedKeeperInfo.data.index : -1, ...trustedContact[ channelKey ] ? makeContactRecipientDescription( channelKey, trustedContact[ channelKey ], ContactTrustKind.KEEPER_OF_USER ) : {
          }
        } : selectedKeeperInfo && Object.keys( selectedKeeperInfo.data ).length ? selectedKeeperInfo.data : {
        }
        if ( keeperInfo.find( value => value.shareId == element.shareId ) ) element.data = data
        // Channel Key
        if ( keeperInfo.find( value => value.shareId == element.shareId ) ) element.channelKey = channelKey
      }
    }
  }
  return levelHealthVar
}

export const getLevelInfoStatus = ( levelDataTemp, currentLevel ) => {
  const levelData: LevelData[] = [ ...levelDataTemp ]
  for ( let i = 0; i < levelData.length; i++ ) {
    const element = levelData[ i ]

    if( element.keeper1.updatedAt == 0 || element.keeper2.updatedAt == 0 ) {
      levelData[ i ].status = 'notSetup'
    } else if( element.keeper1.status == 'accessible' && element.keeper2.status == 'accessible' ) {
      levelData[ i ].status = 'good'
    } else if( ( element.keeper1.status == 'accessible' && element.keeper2.status == 'notAccessible' ) || ( element.keeper1.status == 'notAccessible' && element.keeper2.status == 'accessible' ) ) {
      levelData[ i ].status = 'bad'
    } else if( element.keeper1.status == 'notAccessible' && element.keeper2.status == 'notAccessible' ) {
      levelData[ i ].status = 'bad'
    }

    const displayName1 = element.keeper1.data && Object.keys( element.keeper1.data ).length && element.keeper1.data.displayedName ? element.keeper1.data.displayedName : ''
    const displayName2 = element.keeper2.data && Object.keys( element.keeper2.data ).length && element.keeper2.data.displayedName ? element.keeper2.data.displayedName : ''
    levelData[ i ].keeper1ButtonText = displayName1 ? displayName1 : element.keeper1.data && Object.keys( element.keeper1.data ).length && element.keeper1.data.name ? element.keeper1.data.name : element.keeper1.name ? element.keeper1.name : i == 0 && !element.keeper1.name ? 'Set Password' : ''
    console.log( 'levelData[ i ].keeper1ButtonText', i, levelData[ i ].keeper1ButtonText )
    levelData[ i ].keeper2ButtonText = displayName2 ? displayName2 : element.keeper2.data && Object.keys( element.keeper2.data ).length && element.keeper2.data.name ? element.keeper2.data.name : element.keeper2.name ? element.keeper2.name : i == 0 && !element.keeper2.name ? Platform.OS == 'ios' ? 'Backup on iCloud' : 'Backup on Google Drive' : ''
  }
  return levelData
}

export const arrayChunks = ( arr, size ) => {
  return Array.from( {
    length: Math.ceil( arr.length / size )
  }, ( v, i ) =>
    arr.slice( i * size, i * size + size )
  )
}

export const getIndex = ( levelHealth, type, selectedKeeper, keeperInfo ) => {
  let changeIndex = 1
  let contactCount = 0
  let deviceCount = 0
  for ( let i = 0; i < levelHealth.length; i++ ) {
    const element = levelHealth[ i ]
    for ( let j = 2; j < element.levelInfo.length; j++ ) {
      const element2 = element.levelInfo[ j ]
      if (
        element2.shareType == 'contact' &&
          selectedKeeper &&
          selectedKeeper.shareId != element2.shareId &&
          levelHealth[ i ]
      ) {
        contactCount++
      }
      if (
        element2.shareType == 'device' &&
          selectedKeeper &&
          selectedKeeper.shareId != element2.shareId &&
          levelHealth[ i ]
      ) {
        deviceCount++
      }
      const kpInfoContactIndex = keeperInfo.findIndex( ( value ) => value.shareId == element2.shareId && value.type == 'contact' )
      if ( type == 'contact' && element2.shareType == 'contact' && contactCount < 2 ) {
        if ( kpInfoContactIndex > -1 && keeperInfo[ kpInfoContactIndex ].data.index == 1 ) {
          changeIndex = 2
        } else changeIndex = 1
      }
      if( type == 'device' ){
        if ( element2.shareType == 'device' && deviceCount == 1 ) {
          changeIndex = 3
        } else if( element2.shareType == 'device' && deviceCount == 2 ){
          changeIndex = 4
        }
      }
    }
  }
  return changeIndex
}
