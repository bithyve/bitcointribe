export const modifyLevelStatus = (
  levelData: any[],
  levelHealth: any[],
  currentLevel: number,
  keeperInfo: any[],
  callBack: any
): { levelData: any[]; isError: boolean } => {
  let isError = false
  const abc = JSON.stringify( levelHealth )
  const levelHealthVar = [ ...getModifiedData( keeperInfo, JSON.parse( abc ) ) ]
  // console.log( 'modifyLevelStatus levelHealthVar', levelHealthVar )
  if ( levelHealthVar && levelHealthVar.length > 0 ) {
    // Executes when level 1 setup or complete and level 2 not initialized
    if (
      ( currentLevel == 1 || currentLevel == 0 ) &&
      levelHealthVar[ 0 ] &&
      !levelHealthVar[ 1 ] &&
      !levelHealthVar[ 2 ]
    ) {
      levelData = checkLevelHealth( levelData, levelHealthVar, 0, 0, currentLevel )
    }

    // Executes when level 1 complete or level 2 in setup for completed setup and level 3 not initialized
    if (
      ( currentLevel == 1 || currentLevel == 2 ) &&
      levelHealthVar[ 0 ] &&
      levelHealthVar[ 1 ]
    ) {
      // if level 2 complete then change level 1 share data with level 2 share data at for cloud and security question
      levelData = checkLevelHealth( levelData, levelHealthVar, 1, 2, currentLevel )
    }

    // Executes when level 2 complete or level 3 in setup for completed setup
    if (
      ( currentLevel == 2 || currentLevel == 3 ) &&
      levelHealthVar[ 0 ] &&
      levelHealthVar[ 1 ] &&
      levelHealthVar[ 2 ]
    ) {
      // if level 3 complete then change level 2 share data with level 3 share data at for cloud and security question
      levelData = checkLevelHealth( levelData, levelHealthVar, 2, 4, currentLevel )
    }
  }
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
  levelData: any[],
  levelHealthVar: any[],
  index: number,
  index2: number,
  currentLevel: number
) => {
  try {
    // console.log( 'modifyLevelStatus index index2', index, index2 )
    if (
      levelHealthVar[ index ].levelInfo[ index2 ].updatedAt === 0 &&
    levelHealthVar[ index ].levelInfo[ index2 + 1 ].updatedAt === 0
    ) {
      levelData[ index ].status = 'notSetup'
      if( index == 2 && currentLevel > 0 && levelHealthVar[ index ] ){
        // console.log( 'modifyLevelStatus index == 2 && currentLevel > 0 && levelHealthVar[ index ]' )
        levelData[ index ].keeper1 = levelHealthVar[ index ] && levelHealthVar[ index ].levelInfo ? levelHealthVar[ index ].levelInfo[ index2 ] : levelData[ index2 ].keeper1
        levelData[ index ].keeper2 = levelHealthVar[ index ] && levelHealthVar[ index ].levelInfo[ index2 ] ? levelHealthVar[ index ].levelInfo[ index2 ] : levelData[ index2 ].keeper2
        levelData[ index ].status = checkStatus( levelHealthVar, index, index2 )
      }
      else if( index != 0 && currentLevel > 0 ){
        // console.log( 'modifyLevelStatus index != 0 && currentLevel > 0' )
        levelData[ index-1 ].keeper1 = levelHealthVar[ currentLevel - 1 ] && levelHealthVar[ currentLevel - 1 ].levelInfo ? levelHealthVar[ currentLevel - 1 ].levelInfo[ 0 ] : levelData[ 0 ].keeper1
        levelData[ index-1 ].keeper1.name = index == 0 ? 'Cloud' : levelHealthVar[ currentLevel - 1 ].levelInfo[ 0 ].name
        levelData[ index-1 ].keeper2 = levelHealthVar[ currentLevel - 1 ] && levelHealthVar[ currentLevel - 1 ].levelInfo[ 1 ] ? levelHealthVar[ currentLevel - 1 ].levelInfo[ 1 ] : levelData[ 0 ].keeper2
        levelData[ index-1 ].keeper2.name = index == 0 ? 'Security Question' : levelHealthVar[ currentLevel - 1 ].levelInfo[ 1 ].name
        levelData[ index-1 ].status = checkStatus( levelHealthVar, currentLevel - 1, 0 )
      }
      else if( index == 0 && currentLevel == 0 ){
        // console.log( 'modifyLevelStatus index == 0 && currentLevel == 0' )
        levelData[ index ].keeper1 = levelHealthVar[ 0 ] && levelHealthVar[ 0 ].levelInfo ? levelHealthVar[ 0 ].levelInfo[ 0 ] : levelData[ 0 ].keeper1
        levelData[ index ].keeper1.name = 'Cloud'
        levelData[ index ].keeper2 = levelHealthVar[ 0 ] && levelHealthVar[ 0 ].levelInfo[ 1 ] ? levelHealthVar[ 0 ].levelInfo[ 1 ] : levelData[ 0 ].keeper2
        levelData[ index ].keeper2.name = 'Security Question'
        levelData[ index ].status = checkStatus( levelHealthVar, 0, 0 )
      }
      levelData[ index ].status = 'notSetup'
      return levelData
    } else {
      // console.log( 'modifyLevelStatus ELSE' )
      const status = checkStatus( levelHealthVar, index, index2 )
      if( levelHealthVar[ 0 ] && currentLevel > 0 ){
        levelData[ 0 ].keeper1 = levelHealthVar[ currentLevel - 1 ] && levelHealthVar[ currentLevel - 1 ].levelInfo ? levelHealthVar[ currentLevel - 1 ].levelInfo[ 0 ] : levelData[ 0 ].keeper1
        levelData[ 0 ].keeper1.name = 'Cloud'
        levelData[ 0 ].keeper2 = levelHealthVar[ currentLevel - 1 ] && levelHealthVar[ currentLevel - 1 ].levelInfo[ 1 ] ? levelHealthVar[ currentLevel - 1 ].levelInfo[ 1 ] : levelData[ 0 ].keeper2
        levelData[ 0 ].keeper2.name = 'Security Question'
        levelData[ 0 ].status = checkStatus( levelHealthVar, currentLevel - 1, 0 )
      }
      if ( levelHealthVar[ 0 ] && currentLevel == 0 ) {
        levelData[ 0 ].keeper1 = levelHealthVar[ currentLevel ] && levelHealthVar[ currentLevel ].levelInfo ? levelHealthVar[ currentLevel ].levelInfo[ 0 ] : levelData[ 0 ].keeper1
        levelData[ 0 ].keeper1.name = 'Cloud'
        levelData[ 0 ].keeper2 = levelHealthVar[ currentLevel ] && levelHealthVar[ currentLevel ].levelInfo[ 1 ] ? levelHealthVar[ currentLevel ].levelInfo[ 1 ] : levelData[ 0 ].keeper2
        levelData[ 0 ].keeper2.name = 'Security Question'
        levelData[ 0 ].status = checkStatus( levelHealthVar, 0, 0 )
      }
      if ( levelHealthVar[ 1 ] ) {
        if ( currentLevel === 3 ) {
          levelData[ 1 ].keeper1 = levelHealthVar[ 2 ].levelInfo[ 2 ]
          levelData[ 1 ].keeper2 = levelHealthVar[ 2 ].levelInfo[ 3 ]
          levelData[ 1 ].status = checkStatus( levelHealthVar, 2, 2 )
        }
        else {
          levelData[ 1 ].keeper1 = levelHealthVar[ 1 ].levelInfo[ 2 ]
          levelData[ 1 ].keeper2 = levelHealthVar[ 1 ].levelInfo[ 3 ]
          levelData[ 1 ].status = checkStatus( levelHealthVar, 1, 2 )
        }
      }
      if ( levelHealthVar[ 2 ] ) {
        levelData[ 2 ].keeper1 = levelHealthVar[ 2 ].levelInfo[ 4 ]
        levelData[ 2 ].keeper2 = levelHealthVar[ 2 ].levelInfo[ 5 ]
        levelData[ 2 ].status = checkStatus( levelHealthVar, 2, 4 )
      }
    }
    // console.log( 'modifyLevelStatus levelData', levelData )
    return levelData
  } catch ( error ) {
    console.log( 'error', error )
  }
}

const checkStatus = ( levelHealthVar: any[], index: number, index2: number ) => {
  let status = 'notSetup'
  let goodCount = 0; let badCount = 0
  if( levelHealthVar[ index ] && levelHealthVar[ index ].levelInfo ) {
    for ( let i = 0; i < levelHealthVar[ index ].levelInfo.length; i++ ) {
      const element = levelHealthVar[ index ].levelInfo[ i ]
      if( element.status == 'accessible' ) goodCount++
      if( element.status == 'notAccessible' ) badCount++
    }
    if( goodCount == levelHealthVar[ index ].levelInfo.length ) status = 'good'
    else if( goodCount < levelHealthVar[ index ].levelInfo.length ) status = 'bad'
    // console.log( 'modifyLevelStatus badCount', badCount )
    // console.log( 'modifyLevelStatus goodCount', goodCount )
    // console.log( 'modifyLevelStatus status', status )
    return status
  }
  return status
}

const getModifiedData = ( keeperInfo, levelHealthVar ) => {
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
        if (
          keeperInfo.findIndex( ( value ) => value.shareId == element.shareId ) > -1
        ) {
          element.uuid =
            keeperInfo[
              keeperInfo.findIndex( ( value ) => value.shareId == element.shareId )
            ].uuid
        }
        if (
          keeperInfo.findIndex( ( value ) => value.shareId == element.shareId ) > -1
        ) {
          element.uuid =
            keeperInfo[
              keeperInfo.findIndex( ( value ) => value.shareId == element.shareId )
            ].uuid
        }
      }
    }
    if (
      levelHealthVar[ 1 ] &&
      levelHealthVar[ 1 ].levelInfo &&
      levelHealthVar[ 2 ] &&
      levelHealthVar[ 1 ].levelInfo
    ) {
      for ( let j = 0; j < levelHealthVar[ 1 ].levelInfo.length; j++ ) {
        if (
          !levelHealthVar[ 2 ].levelInfo[ j ].uuid &&
          levelHealthVar[ 2 ].levelInfo[ j ].name ==
            levelHealthVar[ 1 ].levelInfo[ j ].name
        )
          levelHealthVar[ 2 ].levelInfo[ j ].uuid =
            levelHealthVar[ 1 ].levelInfo[ j ].uuid
      }
    }
  }
  return levelHealthVar
}

const getLevelInfoStatus = ( levelData ) => {
  for ( let i = 0; i < levelData.length; i++ ) {
    const element = levelData[ i ]
    if( levelData[ i ].status == 'notSetup' ) {
      levelData[ i ].note= 'Setup/Upgrade your backup.'
    }
    if( levelData[ i ].status == 'bad' ) {
      levelData[ i ].note= 'Backup needs your attention.'
    }
    if( levelData[ i ].status == 'good' ) {
      levelData[ i ].note= 'Backup is secure.'
    }

    // ONLY ONE ACCESSIBLE
    if( levelData[ i ].status == 'bad' && ( element.keeper1.status == 'accessible' && element.keeper2.status == 'notAccessible' ) || ( element.keeper1.status == 'notAccessible' && element.keeper2.status == 'accessible' ) ){
      if( element.keeper1.updatedAt > 0 ) levelData[ i ].keeper1ButtonText = element.keeper1.name
      if( element.keeper2.updatedAt > 0 ) levelData[ i ].keeper2ButtonText = element.keeper2.name
    }
    // BOTH NOT ACCESSIBLE
    if( levelData[ i ].status == 'bad' && ( element.keeper1.status == 'notAccessible' && element.keeper2.status == 'notAccessible' ) ){
      if( element.keeper1.updatedAt > 0 ) levelData[ i ].keeper1ButtonText = element.keeper1.name
      if( element.keeper2.updatedAt > 0 ) levelData[ i ].keeper2ButtonText = element.keeper2.name
    }
    // BOTH NOT ACCESSIBLE
    if( levelData[ i ].status == 'good' && ( element.keeper1.status == 'accessible' && element.keeper2.status == 'accessible' ) ){
      levelData[ i ].keeper1ButtonText = element.keeper1.name
      levelData[ i ].keeper2ButtonText = element.keeper2.name
    }
  }
  return levelData
}
