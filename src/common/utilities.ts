import { KeeperInfoInterface, LevelData, LevelHealthInterface, LevelInfo } from '../bitcoin/utilities/Interface'

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

export const getModifiedData = ( keeperInfo:KeeperInfoInterface[], levelHealthVar ) => {
  if ( keeperInfo.length > 0 ) {
    for ( let j = 0; j < levelHealthVar.length; j++ ) {
      const elementJ = levelHealthVar[ j ]
      for ( let i = 0; i < elementJ.levelInfo.length; i++ ) {
        const element = elementJ.levelInfo[ i ]
        // Data for Contact Type
        if ( keeperInfo.find( value => value.shareId == element.shareId && value.type == 'contact' ) ) element.data = keeperInfo.find( value  => value.shareId == element.shareId && value.type == 'contact' ).data
        // Data for Contact Type
        if ( keeperInfo.find( value => value.shareId == element.shareId && value.type == 'device' ) ) element.data = keeperInfo.find( value  => value.shareId == element.shareId && value.type == 'device' ).data
        // Channel Key
        if ( keeperInfo.find( value => value.shareId == element.shareId ) ) element.channelKey = keeperInfo.find( value  => value.shareId == element.shareId ).channelKey
      }
    }
  }
  return levelHealthVar
}

export const changeNameForSecondary = ( name ) =>{
  if( name === 'Secondary Device1' || name === 'Secondary Device2' || name === 'Secondary Device3' ){
    return name.replace( 'Secondary', 'Personal' )
  }
  return name
}

export const getLevelInfoStatus = ( levelDataTemp ) => {
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

    // Not SETUP
    if( levelData[ i ].status == 'notSetup' ) {
      levelData[ i ].note= 'Setup level to '+( i+1 )
    }
    if( levelData[ i ].status == 'bad' ) {
      levelData[ i ].note= 'Backup needs your attention'
    }
    if( levelData[ i ].status == 'good' ) {
      levelData[ i ].note= 'Backup Level 1 is secure, \nupgrade to Backup Level 2'
    }
    // BOTH ACCESSIBLE
    if( element.keeper1.status == 'accessible' && element.keeper2.status == 'accessible' ){
      levelData[ i ].note = i == 1 ? 'Backup Level 2 is secure, \nupgrade to Backup Level 3' : 'Level is complete'
    }
    // ONLY ONE ACCESSIBLE
    if( ( element.keeper1.status == 'accessible' && element.keeper2.status == 'notAccessible' ) || ( element.keeper1.status == 'notAccessible' && element.keeper2.status == 'accessible' ) ||
    ( element.keeper1.status == 'notAccessible' && element.keeper2.status == 'notAccessible' ) ){
      let name1 = ''; let name2 = ''
      if( element.keeper1.updatedAt > 0 && element.keeper1.status == 'notAccessible' ) name1 = element.keeper1.name
      else name1 = 'Recovery Key 1'
      if( element.keeper2.updatedAt > 0 && element.keeper2.status == 'notAccessible' ) name2 = element.keeper2.name
      else name2 = 'Recovery Key 2'
      const name = name1 && name2 ? changeNameForSecondary( name1 ) + ' & ' + changeNameForSecondary(  name2 ) : name1 && !name2 ? changeNameForSecondary( name1 ) : changeNameForSecondary( name2 )
      levelData[ i ].note = name + ' need your attention.'
    }
    levelData[ i ].keeper1ButtonText = element.keeper1.name ? element.keeper1.name : ''
    levelData[ i ].keeper2ButtonText = element.keeper2.name ? element.keeper2.name : ''
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
