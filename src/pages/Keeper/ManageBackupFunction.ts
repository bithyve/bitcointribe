import { MetaShare } from "../../bitcoin/utilities/Interface";

export const modifyLevelStatus = (
  levelData,
  levelHealthVar,
  currentLevel,
  keeperInfo : any[]
): any[] => {
  
  if (levelHealthVar) {
    let levelHealth = levelHealthVar[levelHealthVar.length - 1];
    if(keeperInfo.length>0){
      for (let i = 0; i < levelHealth.levelInfo.length; i++) {
        const element = levelHealth.levelInfo[i];
        if(keeperInfo.findIndex(value=>value.shareId == element.shareId) > -1){
          levelHealth.levelInfo[i].guardian = keeperInfo[keeperInfo.findIndex(value=>value.shareId == element.shareId)].name;
        }
      }
    }
    if (levelHealth.levelInfo) {
      if (levelHealth.levelInfo[0] && levelHealth.levelInfo[1]) {
        // Level 1 => cloud
        if (levelHealth.levelInfo[0]) {
          levelData[0].keeper1.name = 'Cloud';
          levelData[0].keeper1.keeper1Done =
            levelHealth.levelInfo[0].status == 'accessible' ? true : false;
          levelData[0].keeper1.type = 'cloud';
          levelData[0].keeper1.shareId = levelHealth.levelInfo[0].shareId;
        } // Level 1 => security question
        if (levelHealth.levelInfo[1]) {
          levelData[0].keeper2.name = 'Security Question';
          levelData[0].keeper2.keeper2Done =
            levelHealth.levelInfo[1].status == 'accessible' ? true : false;
          levelData[0].keeper2.type = 'securityQuestion';
          levelData[0].keeper2.shareId = levelHealth.levelInfo[1].shareId;
        } // Level 1 => Status
        if (
          levelHealth.levelInfo[1].status == 'accessible' &&
          levelHealth.levelInfo[0].status == 'accessible'
        ) {
          levelData[0].status = 'good';
        } else if (
          (levelHealth.levelInfo[1].status == 'accessible' &&
            levelHealth.levelInfo[0].status == 'notAccessible') ||
          (levelHealth.levelInfo[1].status == 'notAccessible' &&
            levelHealth.levelInfo[0].status == 'accessible') ||
          (levelHealth.levelInfo[1].updatedAt != 0 &&
            levelHealth.levelInfo[0].updatedAt == 0) ||
          (levelHealth.levelInfo[1].updatedAt == 0 &&
            levelHealth.levelInfo[0].updatedAt != 0)
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
          levelData[1].keeper1.name = levelHealth.levelInfo[2].guardian
            ? levelHealth.levelInfo[2].guardian
            : '';
          levelData[1].keeper1.keeper1Done =
            levelHealth.levelInfo[2].status == 'accessible' ? true : false;
          levelData[1].keeper1.type = 'primaryKeeper';
          levelData[1].keeper1.shareId = levelHealth.levelInfo[2].shareId;
        }
        // Level 2 => Second Keeper
        if (levelHealth.levelInfo[3]) {
          levelData[1].keeper2.name = levelHealth.levelInfo[3].guardian
            ? levelHealth.levelInfo[3].guardian
            : '';
          levelData[1].keeper2.keeper2Done =
            levelHealth.levelInfo[3].status == 'accessible' ? true : false;
          levelData[1].keeper2.type = levelHealth.levelInfo[3].shareType
            ? levelHealth.levelInfo[3].shareType
            : '';
          levelData[1].keeper2.shareId = levelHealth.levelInfo[3].shareId;
        } // Level 2 => Status
        if (
          levelHealth.levelInfo[2].status == 'accessible' &&
          levelHealth.levelInfo[3].status == 'accessible'
        ) {
          levelData[1].status = 'good';
        } else if (
          (levelHealth.levelInfo[2].status == 'accessible' &&
            levelHealth.levelInfo[3].status == 'notAccessible') ||
          (levelHealth.levelInfo[2].status == 'notAccessible' &&
            levelHealth.levelInfo[3].status == 'accessible') ||
          (levelHealth.levelInfo[2].updatedAt != 0 &&
            levelHealth.levelInfo[3].updatedAt == 0) ||
          (levelHealth.levelInfo[2].updatedAt == 0 &&
            levelHealth.levelInfo[3].updatedAt != 0)
        ) {
          levelData[1].status = 'bad';
        } else if (
          levelHealth.levelInfo[2].updatedAt == 0 &&
          levelHealth.levelInfo[3].updatedAt == 0
        ) {
          levelData[1].status = 'notSetup';
        }
      }
      if (levelHealth.levelInfo[4] && levelHealth.levelInfo[5]) {
        // Level 3 => other Keeper 1
        if (levelHealth.levelInfo[4]) {
          levelData[2].keeper1.name = levelHealth.levelInfo[4].guardian
            ? levelHealth.levelInfo[4].guardian
            : '';
          levelData[2].keeper1.keeper1Done =
            levelHealth.levelInfo[4].status == 'accessible' ? true : false;
          levelData[2].keeper1.type = levelHealth.levelInfo[4].shareType
            ? levelHealth.levelInfo[4].shareType
            : '';
          levelData[2].keeper1.shareId = levelHealth.levelInfo[4].shareId;
        }
        // Level 3 => other Keeper 2
        if (levelHealth.levelInfo[5]) {
          levelData[2].keeper2.name = levelHealth.levelInfo[5].guardian
            ? levelHealth.levelInfo[5].guardian
            : '';
          levelData[2].keeper2.keeper2Done =
            levelHealth.levelInfo[5].status == 'accessible' ? true : false;
          levelData[2].keeper2.type = levelHealth.levelInfo[5].shareType
            ? levelHealth.levelInfo[5].shareType
            : '';
          levelData[2].keeper2.shareId = levelHealth.levelInfo[5].shareId;
        } // Level 3 => status
        if (
          levelHealth.levelInfo[4].status == 'accessible' &&
          levelHealth.levelInfo[5].status == 'accessible'
        ) {
          levelData[2].status = 'good';
        } else if (
          (levelHealth.levelInfo[4].status == 'accessible' &&
            levelHealth.levelInfo[5].status == 'notAccessible') ||
          (levelHealth.levelInfo[4].status == 'notAccessible' &&
            levelHealth.levelInfo[5].status == 'accessible') ||
          (levelHealth.levelInfo[4].updatedAt != 0 &&
            levelHealth.levelInfo[5].updatedAt == 0) ||
          (levelHealth.levelInfo[4].updatedAt == 0 &&
            levelHealth.levelInfo[5].updatedAt != 0)
        ) {
          levelData[2].status = 'bad';
        } else if (
          levelHealth.levelInfo[4].updatedAt == 0 &&
          levelHealth.levelInfo[5].updatedAt == 0
        ) {
          levelData[2].status = 'notSetup';
        }
      }
    }
  }
  return levelData;
};
