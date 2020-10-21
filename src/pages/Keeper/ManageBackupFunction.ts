
export const modifyLevelStatus = (
  levelData: any[],
  levelHealthVar: any[],
  currentLevel: number,
  keeperInfo: any[],
): {levelData:any[], isError: boolean;} => {
  let isError = false;
  if (levelHealthVar && levelHealthVar.length > 0) {
    let levelHealth = levelHealthVar[levelHealthVar.length - 1];
    if (keeperInfo.length > 0) {
      for (let i = 0; i < levelHealth.levelInfo.length; i++) {
        const element = levelHealth.levelInfo[i];
        if (
          keeperInfo.findIndex((value) => value.shareId == element.shareId) > -1
        ) {
          levelHealth.levelInfo[i].name =
            keeperInfo[
              keeperInfo.findIndex((value) => value.shareId == element.shareId)
            ].name;
          levelHealth.levelInfo[i].shareType =
            keeperInfo[
              keeperInfo.findIndex((value) => value.shareId == element.shareId)
            ].type;
        }
      }
    }
    if (levelHealth.levelInfo) {
      if (levelHealth.levelInfo[0] && levelHealth.levelInfo[1]) {
        // Level 1 => cloud
        if (levelHealth.levelInfo[0]) {
          levelData[0].keeper1 = levelHealth.levelInfo[0];
          levelData[0].keeper1.name = 'Cloud';
        } // Level 1 => security question
        if (levelHealth.levelInfo[1]) {
          levelData[0].keeper2 = levelHealth.levelInfo[1];
          levelData[0].keeper2.name = 'Security Question';
        } // Level 1 => Status
        if (
          levelHealth.levelInfo[1].status == 'accessible' &&
          levelHealth.levelInfo[0].status == 'accessible' // Both of the Keeper status is true
        ) {
          levelData[0].status = 'good';
        } else if (
          (levelHealth.levelInfo[1].status == 'accessible' &&
            levelHealth.levelInfo[0].status == 'notAccessible') ||
          (levelHealth.levelInfo[1].status == 'notAccessible' &&
            levelHealth.levelInfo[0].status == 'accessible') // one of the Keeper status is true
        ) {
          levelData[0].status = 'bad';
        } else if (
          (levelHealth.levelInfo[1].updatedAt != 0 &&
            levelHealth.levelInfo[0].updatedAt == 0) ||
          (levelHealth.levelInfo[1].updatedAt == 0 &&
            levelHealth.levelInfo[0].updatedAt != 0) // one of the Keeper is setup
        ) {
          levelData[0].status = 'bad';
        } else if (
          levelHealth.levelInfo[1].updatedAt != 0 &&
          levelHealth.levelInfo[0].updatedAt != 0 // Both of the Keeper is setup
        ) {
          levelData[0].status = 'bad';
        } else if (
          levelHealth.levelInfo[1].updatedAt == 0 &&
          levelHealth.levelInfo[0].updatedAt == 0
        ) {
          levelData[0].status = 'notSetup';
        }
      }
      if (levelHealth.levelInfo[2] && levelHealth.levelInfo[3]) {
        // Level 2 => primary Keeper
        if (levelHealth.levelInfo[2]) {
          levelData[1].keeper1 = levelHealth.levelInfo[2];
        }
        // Level 2 => Second Keeper
        if (levelHealth.levelInfo[3]) {
          levelData[1].keeper2 = levelHealth.levelInfo[3];
        } // Level 2 => Status
        if (
          levelHealth.levelInfo[2].status == 'accessible' &&
          levelHealth.levelInfo[3].status == 'accessible' // Both of the Keeper status is true
        ) {
          levelData[1].status = 'good';
        } else if (
          (levelHealth.levelInfo[2].status == 'accessible' &&
            levelHealth.levelInfo[3].status == 'notAccessible') ||
          (levelHealth.levelInfo[2].status == 'notAccessible' &&
            levelHealth.levelInfo[3].status == 'accessible') // One of the Keeper status is true
        ) {
          levelData[1].status = 'bad';
        } else if (
          (levelHealth.levelInfo[2].updatedAt != 0 &&
            levelHealth.levelInfo[3].updatedAt == 0) ||
          (levelHealth.levelInfo[2].updatedAt == 0 &&
            levelHealth.levelInfo[3].updatedAt != 0) // One of the keeper is setup
        ) {
          levelData[1].status = 'bad';
        } else if (
          levelHealth.levelInfo[2].updatedAt != 0 &&
          levelHealth.levelInfo[3].updatedAt != 0 // both of the keeper is setup
        ) {
          levelData[1].status = 'bad';
        } else {
          levelData[1].status = 'notSetup';
        }
      }
      if (levelHealth.levelInfo[4] && levelHealth.levelInfo[5]) {
        // Level 3 => other Keeper 1
        if (levelHealth.levelInfo[4]) {
          levelData[2].keeper1 = levelHealth.levelInfo[4];
        }
        // Level 3 => other Keeper 2
        if (levelHealth.levelInfo[5]) {
          levelData[2].keeper2 = levelHealth.levelInfo[5];
        } // Level 3 => status
        if (
          levelHealth.levelInfo[4].status == 'accessible' &&
          levelHealth.levelInfo[5].status == 'accessible' // Both of the Keeper status is true
        ) {
          levelData[2].status = 'good';
        } else if (
          (levelHealth.levelInfo[4].status == 'accessible' &&
            levelHealth.levelInfo[5].status == 'notAccessible') ||
          (levelHealth.levelInfo[4].status == 'notAccessible' &&
            levelHealth.levelInfo[5].status == 'accessible') // One of the Keeper status is true
        ) {
          levelData[2].status = 'bad';
        } else if (
          (levelHealth.levelInfo[4].updatedAt != 0 &&
            levelHealth.levelInfo[5].updatedAt == 0) ||
          (levelHealth.levelInfo[4].updatedAt == 0 &&
            levelHealth.levelInfo[5].updatedAt != 0) // One of the keeper is setup
        ) {
          levelData[2].status = 'bad';
        } else if (
          levelHealth.levelInfo[4].updatedAt != 0 &&
          levelHealth.levelInfo[5].updatedAt != 0 // both of the keeper is setup
        ) {
          levelData[2].status = 'bad';
        } else if (
          levelHealth.levelInfo[4].updatedAt == 0 &&
          levelHealth.levelInfo[5].updatedAt == 0 // Both of the Keeper is not setup
        ) {
          levelData[2].status = 'notSetup';
        }
      }
    }
  }
  if(levelData.findIndex(value => value.status == 'bad')>-1){
    isError = true;
  }
  return {levelData, isError};
};