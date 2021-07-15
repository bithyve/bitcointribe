import { Platform } from 'react-native'
import { KeeperInfoInterface, LevelData, LevelHealthInterface, LevelInfo } from '../../bitcoin/utilities/Interface'

export const modifyLevelStatus = (
  levelData: any[],
  levelHealth: any[],
  currentLevel: number,
  keeperInfo: KeeperInfoInterface[],
  callBack: any
): { levelData: any[]; isError: boolean } => {
  let isError = false
  const abc = JSON.stringify( levelHealth )
  const levelHealthVar = [ ...getModifiedData( keeperInfo, JSON.parse( abc ) ) ]

  levelData = checkLevelHealth( levelData, levelHealthVar )

  if ( levelData.findIndex( ( value ) => value.status == 'bad' ) > -1 ) {
    isError = true
  }

  const levelDataUpdated = getLevelInfoStatus( levelData )
  callBack( levelDataUpdated )
  return {
    levelData: levelDataUpdated, isError
  }
}

const checkLevelHealth = (
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
        levelData[ j ].status = checkStatus2( levelInfo )
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
        levelData[ j ].status = checkStatus2( levelInfo1 )
        if( elements1.length == 3 && j == 2 ) {
          levelData[ j ].keeper1 = element1[ 0 ]
          levelData[ j ].keeper2 = element1[ 1 ]
          levelData[ j ].status = checkStatus2( levelInfo1 )
        }
        if( elements1.length == 2 && j == 1 ) {
          levelData[ j ].keeper1 = element1[ 0 ]
          levelData[ j ].keeper2 = element1[ 1 ]
          levelData[ j ].status = checkStatus2( levelInfo1 )
        }
      }
    }
    return levelData
  } catch ( error ) {
    console.log( 'error', error )
  }
}

const checkStatus2 = ( levelInfo: LevelInfo[] ) => {
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

const getModifiedData = ( keeperInfo:KeeperInfoInterface[], levelHealthVar ) => {
  if ( keeperInfo.length > 0 ) {
    for ( let j = 0; j < levelHealthVar.length; j++ ) {
      const elementJ = levelHealthVar[ j ]
      for ( let i = 0; i < elementJ.levelInfo.length; i++ ) {
        const element = elementJ.levelInfo[ i ]
        if (
          keeperInfo.findIndex(
            ( value ) =>
              value.shareId == element.shareId && value.type == 'contact',
          ) > -1
        ) {
          element.data =
            keeperInfo[
              keeperInfo.findIndex(
                ( value ) =>
                  value.shareId == element.shareId && value.type == 'contact',
              )
            ].data
        }
        if (
          keeperInfo.findIndex(
            ( value ) =>
              value.shareId == element.shareId && value.type == 'device',
          ) > -1
        ) {
          element.data =
            keeperInfo[
              keeperInfo.findIndex(
                ( value ) =>
                  value.shareId == element.shareId && value.type == 'device',
              )
            ].data
        }
      }
    }
  }
  return levelHealthVar
}

const getLevelInfoStatus = ( levelDataTemp ) => {
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
      if( element.keeper1.updatedAt > 0 ) levelData[ i ].keeper1ButtonText = element.keeper1.name ? element.keeper1.name : ''
      if( element.keeper2.updatedAt > 0 ) levelData[ i ].keeper2ButtonText = element.keeper2.name ? element.keeper2.name : ''
      levelData[ i ].note = i == 1 ? 'Backup Level 2 is secure, \nupgrade to Backup Level 3' : 'Level is complete'
    }
    // ONLY ONE ACCESSIBLE
    if( ( element.keeper1.status == 'accessible' && element.keeper2.status == 'notAccessible' ) || ( element.keeper1.status == 'notAccessible' && element.keeper2.status == 'accessible' ) ||
    ( element.keeper1.status == 'notAccessible' && element.keeper2.status == 'notAccessible' ) ){
      let name1 = ''; let name2 = ''
      if( element.keeper1.updatedAt > 0 ) levelData[ i ].keeper1ButtonText = element.keeper1.name ? element.keeper1.name : ''
      if( element.keeper2.updatedAt > 0 ) levelData[ i ].keeper2ButtonText = element.keeper2.name ? element.keeper2.name : i == 0 && !element.keeper2.name ? Platform.OS == 'ios' ? 'Backup on iCloud' : 'Backup on Google Drive' : ''
      if( element.keeper1.updatedAt > 0 && element.keeper1.status == 'notAccessible' ) name1 = element.keeper1.name
      else name1 = 'Recovery Key 1'
      if( element.keeper2.updatedAt > 0 && element.keeper2.status == 'notAccessible' ) name2 = element.keeper2.name
      else name2 = 'Recovery Key 2'
      const name = name1 && name2 ? name1 + ' & ' + name2 : name1 && !name2 ? name1 : name2
      levelData[ i ].note = name + ' need your attention.'
    }
  }
  return levelData
}

const arrayChunks = ( arr, size ) => {
  return Array.from( {
    length: Math.ceil( arr.length / size )
  }, ( v, i ) =>
    arr.slice( i * size, i * size + size )
  )
}
