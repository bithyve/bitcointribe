export const modifyLevelStatus = (
  levelData,
  levelHealth,
  currentLevel,
): any[] => {
  console.log('levelHealth', levelHealth);
  console.log('levelData', levelData);
  if (levelHealth[2] != undefined && levelHealth[2].levelInfo!= undefined && levelHealth[2].levelInfo.length == 6) {
    console.log('modifyLevelStatus 3')
    if (
      levelHealth[2].levelInfo[0].shareType == 'cloud' &&
      levelHealth[2].levelInfo[0].status == 'accessible'
    ) {
      levelData[0].keeper1.name = 'Cloud';
      levelData[0].keeper1.keeper1Done = true;
      levelData[0].keeper1.type = 'cloud';
    }
    levelData[0].keeper2.shareId = levelHealth[2].levelInfo[0].shareId;
    if (
      levelHealth[2].levelInfo[1].shareType == 'securityQuestion' &&
      levelHealth[2].levelInfo[1].status == 'accessible'
    ) {
      levelData[0].keeper2.name = 'Security Question';
      levelData[0].keeper2.keeper2Done = true;
      levelData[0].keeper2.type = 'securityQuestion';
    }
    levelData[0].keeper2.shareId = levelHealth[2].levelInfo[1].shareId;
    if (
      levelHealth[2].levelInfo[0].status == 'accessible' &&
      levelHealth[2].levelInfo[1].status == 'accessible'
    ) levelData[0].status = 'good';
    else if (
      (levelHealth[2].levelInfo[0].status == 'accessible' &&
      levelHealth[2].levelInfo[1].status == 'notAccessible') ||
      (levelHealth[2].levelInfo[0].status == 'notAccessible' &&
      levelHealth[2].levelInfo[1].status == 'accessible')
    ) levelData[0].status = 'bad';

    if (levelHealth[2].levelInfo[2].status == 'accessible') {
      levelData[1].keeper1.name = levelHealth[2].levelInfo[2].guardian;
      levelData[1].keeper1.keeper1Done = true;
      levelData[1].keeper1.type = levelHealth[2].levelInfo[2].shareType;
    }
    levelData[1].keeper2.shareId = levelHealth[2].levelInfo[2].shareId;
    if (levelHealth[2].levelInfo[3].status == 'accessible') {
      levelData[1].keeper2.name = levelHealth[2].levelInfo[3].guardian;
      levelData[1].keeper2.keeper2Done = true;
      levelData[1].keeper2.type = levelHealth[2].levelInfo[3].shareType;
    }
    levelData[1].keeper2.shareId = levelHealth[2].levelInfo[3].shareId;
    if (
      levelHealth[2].levelInfo[2].status == 'accessible' &&
      levelHealth[2].levelInfo[3].status == 'accessible'
    ) levelData[1].status = 'good';
    else if (
      (levelHealth[2].levelInfo[2].status == 'accessible' &&
      levelHealth[2].levelInfo[3].status == 'notAccessible') ||
      (levelHealth[2].levelInfo[2].status == 'notAccessible' &&
      levelHealth[2].levelInfo[3].status == 'accessible')
    ) levelData[1].status = 'bad';

    if (levelHealth[2].levelInfo[4].status == 'accessible') {
      levelData[2].keeper1.name = levelHealth[2].levelInfo[4].guardian;
      levelData[2].keeper1.keeper1Done = true;
      levelData[2].keeper1.type = levelHealth[2].levelInfo[4].shareType;
    }
    levelData[2].keeper2.shareId = levelHealth[2].levelInfo[4].shareId;
    if (levelData[2].levelInfo[5].status == 'accessible') {
      levelData[2].keeper2.name = levelHealth[2].levelInfo[5].guardian;
      levelData[2].keeper2.keeper2Done = true;
      levelData[2].keeper2.type = levelHealth[2].levelInfo[5].shareType;
    }
    levelData[2].keeper2.shareId = levelHealth[2].levelInfo[5].shareId;
    if (
      levelHealth[2].levelInfo[4].status == 'accessible' &&
      levelHealth[2].levelInfo[5].status == 'accessible'
    ) levelData[2].status = 'good';
    else if (
      (levelHealth[2].levelInfo[4].status == 'accessible' &&
      levelHealth[2].levelInfo[5].status == 'notAccessible') ||
      (levelHealth[2].levelInfo[4].status == 'notAccessible' &&
      levelHealth[2].levelInfo[5].status == 'accessible')
    ) levelData[2].status = 'bad';
  }
  if (levelHealth[2]== undefined && levelHealth[1] != undefined  && levelHealth[1].levelInfo != undefined  && levelHealth[1].levelInfo.length == 4) {
    console.log('modifyLevelStatus 2')
    if (
      levelHealth[1].levelInfo[0].shareType == 'cloud' &&
      levelHealth[1].levelInfo[0].status == 'accessible'
    ) {
      levelData[0].keeper1.name = 'Cloud';
      levelData[0].keeper1.keeper1Done = true;
      levelData[0].keeper1.type = 'cloud';
    }
    levelData[0].keeper2.shareId = levelHealth[1].levelInfo[0].shareId;
    if (
      levelHealth[1].levelInfo[1].shareType == 'securityQuestion' &&
      levelHealth[1].levelInfo[1].status == 'accessible'
    ) {
      levelData[0].keeper2.name = 'Security Question';
      levelData[0].keeper2.keeper2Done = true;
      levelData[0].keeper2.type = 'securityQuestion';
    }
    levelData[0].keeper2.shareId = levelHealth[1].levelInfo[1].shareId;
    if (
      levelHealth[1].levelInfo[0].status == 'accessible' &&
      levelHealth[1].levelInfo[1].status == 'accessible'
    ) levelData[0].status = 'good';
    else if (
      (levelHealth[1].levelInfo[0].updatedAt == 0 &&
      levelHealth[1].levelInfo[1].updatedAt != 0) ||
      (levelHealth[1].levelInfo[0].updatedAt != 0 &&
      levelHealth[1].levelInfo[1].updatedAt == 0)
    ) levelData[0].status = 'bad';

    if (levelHealth[1].levelInfo[2].status == 'accessible') {
      levelData[1].keeper1.name = levelHealth[1].levelInfo[2].guardian;
      levelData[1].keeper1.keeper1Done = true;
      levelData[1].keeper1.type = levelHealth[1].levelInfo[2].shareType;
    }
    levelData[1].keeper2.shareId = levelHealth[1].levelInfo[2].shareId;
    if (levelHealth[1].levelInfo[3].status == 'accessible') {
      levelData[1].keeper2.name = levelHealth[1].levelInfo[3].guardian;
      levelData[1].keeper2.keeper2Done = true;
      levelData[1].keeper2.type = levelHealth[1].levelInfo[3].shareType;
    }
    levelData[1].keeper2.shareId = levelHealth[1].levelInfo[3].shareId;
    if (
      levelHealth[1].levelInfo[2].status == 'accessible' &&
      levelHealth[1].levelInfo[3].status == 'accessible'
    ) levelData[1].status = 'good';
    else if (
      (levelHealth[1].levelInfo[2].updatedAt != 0 &&
      levelHealth[1].levelInfo[3].updatedAt == 0) ||
      (levelHealth[1].levelInfo[2].updatedAt == 0 &&
      levelHealth[1].levelInfo[3].updatedAt != 0)
    ) levelData[1].status = 'bad';
  }
  if (levelHealth[0] && levelHealth[0].levelInfo && levelHealth[0].levelInfo.length == 2) {
    console.log('modifyLevelStatus 1')
    let change = true;
    if(levelHealth[1] != undefined && levelHealth[1].levelInfo != undefined && levelHealth[1].levelInfo.length == 4 && (levelHealth[1].levelInfo[2].updatedAt != 0 || levelHealth[1].levelInfo[3].updatedAt != 0) ){
      change = false;
    }
    if(change){
      if (
        levelHealth[0].levelInfo[0].shareType == 'cloud' &&
        levelHealth[0].levelInfo[0].status == 'accessible'
      ) {
        levelData[0].keeper1.name = 'Cloud';
        levelData[0].keeper1.keeper1Done = true;
        levelData[0].keeper1.type = 'cloud';
      }
      levelData[0].keeper1.shareId = levelHealth[0].levelInfo[0].shareId;
      if (
        levelHealth[0].levelInfo[1].shareType == 'securityQuestion' &&
        levelHealth[0].levelInfo[1].status == 'accessible'
      ) {
        levelData[0].keeper2.name = 'Security Question';
        levelData[0].keeper2.keeper2Done = true;
        levelData[0].keeper2.type = 'securityQuestion';
      }
      levelData[0].keeper2.shareId = levelHealth[0].levelInfo[1].shareId;
      if (
        levelHealth[0].levelInfo[0].status == 'accessible' &&
        levelHealth[0].levelInfo[1].status == 'accessible'
      ) levelData[0].status = 'good';
      else if (
        (levelHealth[0].levelInfo[0].status == 'accessible' &&
        levelHealth[0].levelInfo[1].status == 'notAccessible') ||
        (levelHealth[0].levelInfo[0].status == 'notAccessible' &&
        levelHealth[0].levelInfo[1].status == 'accessible')
      ) levelData[0].status = 'bad';
    }
  }
  
  return levelData;
};
