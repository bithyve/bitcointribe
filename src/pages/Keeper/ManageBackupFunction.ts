export const modifyLevelStatus = (
  levelData: any[],
  levelHealthVar: any[],
  currentLevel: number,
  keeperInfo: any[],
): { levelData: any[]; isError: boolean } => {
  let isError = false;
  if (levelHealthVar && levelHealthVar.length > 0) {
    if (keeperInfo.length > 0) {
      for (let j = 0; j < levelHealthVar.length; j++) {
        const elementJ = levelHealthVar[j];
        for (let i = 0; i < elementJ.levelInfo.length; i++) {
          const element = elementJ.levelInfo[i];
          if (
            keeperInfo.findIndex(
              (value) =>
                value.shareId == element.shareId && value.type == 'contact',
            ) > -1
          ) {
            element.data =
              keeperInfo[
                keeperInfo.findIndex(
                  (value) =>
                    value.shareId == element.shareId && value.type == 'contact',
                )
              ].data;
          }
        }
      }
    }

    // CASE 1: currentLevel = 0 && currentLevel = 1 && !levelHealthVar[1] && !levelHealthVar[2]
    if (
      (currentLevel == 1 || currentLevel == 0) &&
      levelHealthVar[0] &&
      !levelHealthVar[1] &&
      !levelHealthVar[2]
    ) {
      if (levelHealthVar[0].levelInfo[0] && levelHealthVar[0].levelInfo[1]) {
        // Level 1 => CLOUD
        if (levelHealthVar[0].levelInfo[0]) {
          levelData[0].keeper1 = levelHealthVar[0].levelInfo[0];
          levelData[0].keeper1.name = 'Cloud';
        } // Level 1 => SECURITY QUESTION
        if (levelHealthVar[0].levelInfo[1]) {
          levelData[0].keeper2 = levelHealthVar[0].levelInfo[1];
          levelData[0].keeper2.name = 'Security Question';
        } // Level 1 => Status
        if (
          levelHealthVar[0].levelInfo[1].status == 'accessible' &&
          levelHealthVar[0].levelInfo[0].status == 'accessible' // Both of the Keeper status is true
        ) {
          levelData[0].status = 'good';
        } else if (
          (levelHealthVar[0].levelInfo[1].status == 'accessible' &&
            levelHealthVar[0].levelInfo[0].status == 'notAccessible') ||
          (levelHealthVar[0].levelInfo[1].status == 'notAccessible' &&
            levelHealthVar[0].levelInfo[0].status == 'accessible') // one of the Keeper status is true
        ) {
          levelData[0].status = 'bad';
        } else if (
          (levelHealthVar[0].levelInfo[1].updatedAt != 0 &&
            levelHealthVar[0].levelInfo[0].updatedAt == 0) ||
          (levelHealthVar[0].levelInfo[1].updatedAt == 0 &&
            levelHealthVar[0].levelInfo[0].updatedAt != 0) // one of the Keeper is setup
        ) {
          levelData[0].status = 'bad';
        } else if (
          levelHealthVar[0].levelInfo[1].updatedAt != 0 &&
          levelHealthVar[0].levelInfo[0].updatedAt != 0 // Both of the Keeper is setup
        ) {
          levelData[0].status = 'bad';
        } else if (
          levelHealthVar[0].levelInfo[1].updatedAt == 0 &&
          levelHealthVar[0].levelInfo[0].updatedAt == 0
        ) {
          levelData[0].status = 'notSetup';
        }
      }
    }

    // CASE 2: currentLevel = 1 || currentLevel = 2 && levelHealthVar[1] && !levelHealthVar[2]
    if (
      (currentLevel == 1 || currentLevel == 2) &&
      levelHealthVar[0] &&
      levelHealthVar[1] &&
      !levelHealthVar[2]
    ) {
      // GET FROM LEVEL 1 ### LEVEL 1 ###
      if (
        (levelHealthVar[0].levelInfo[0] && levelHealthVar[0].levelInfo[1]) ||
        (levelHealthVar[1].levelInfo[0] && levelHealthVar[1].levelInfo[1])
      ) {
        // Level 1 => CLOUD
        if (levelHealthVar[0].levelInfo[0] || levelHealthVar[1].levelInfo[0]) {
          levelData[0].keeper1 =
            currentLevel == 2
              ? levelHealthVar[1].levelInfo[0]
              : levelHealthVar[0].levelInfo[0];
          levelData[0].keeper1.name = 'Cloud';
        } // Level 1 => SECURITY QUESTION
        if (levelHealthVar[0].levelInfo[1]) {
          levelData[0].keeper2 =
            currentLevel == 2
              ? levelHealthVar[1].levelInfo[1]
              : levelHealthVar[0].levelInfo[1];
          levelData[0].keeper2.name = 'Security Question';
        } // Level 1 => Status
        if (
          (levelHealthVar[0].levelInfo[1].status == 'accessible' &&
            levelHealthVar[0].levelInfo[0].status == 'accessible' &&
            currentLevel == 1) ||
          (levelHealthVar[1].levelInfo[1].status == 'accessible' &&
            levelHealthVar[1].levelInfo[0].status == 'accessible' &&
            currentLevel == 2) // Both of the Keeper status is true
        ) {
          levelData[0].status = 'good';
        } else if (
          ((levelHealthVar[0].levelInfo[1].status == 'accessible' &&
            levelHealthVar[0].levelInfo[0].status == 'notAccessible') ||
            (levelHealthVar[0].levelInfo[1].status == 'notAccessible' &&
              levelHealthVar[0].levelInfo[0].status == 'accessible')) &&
          currentLevel == 1 // one of the Keeper status is true
        ) {
          levelData[0].status = 'bad';
        } else if (
          ((levelHealthVar[1].levelInfo[1].status == 'accessible' &&
            levelHealthVar[1].levelInfo[0].status == 'notAccessible') ||
            (levelHealthVar[1].levelInfo[1].status == 'notAccessible' &&
              levelHealthVar[1].levelInfo[0].status == 'accessible')) &&
          currentLevel == 2
        ) {
          levelData[0].status = 'bad';
        } else if (
          ((levelHealthVar[0].levelInfo[1].updatedAt != 0 &&
            levelHealthVar[0].levelInfo[0].updatedAt == 0) ||
            (levelHealthVar[0].levelInfo[1].updatedAt == 0 &&
              levelHealthVar[0].levelInfo[0].updatedAt != 0)) &&
          currentLevel == 1 // one of the Keeper is setup
        ) {
          levelData[0].status = 'bad';
        } else if (
          ((levelHealthVar[1].levelInfo[1].updatedAt != 0 &&
            levelHealthVar[1].levelInfo[0].updatedAt == 0) ||
            (levelHealthVar[1].levelInfo[1].updatedAt == 0 &&
              levelHealthVar[1].levelInfo[0].updatedAt != 0)) &&
          currentLevel == 2 // one of the Keeper is setup
        ) {
          levelData[0].status = 'bad';
        } else if (
          (levelHealthVar[0].levelInfo[1].updatedAt != 0 &&
            levelHealthVar[0].levelInfo[0].updatedAt != 0 &&
            currentLevel == 1) ||
          (levelHealthVar[1].levelInfo[1].updatedAt != 0 &&
            levelHealthVar[1].levelInfo[0].updatedAt != 0 &&
            currentLevel == 2) // Both of the Keeper is setup
        ) {
          levelData[0].status = 'bad';
        } else if (
          (levelHealthVar[0].levelInfo[1].updatedAt == 0 &&
            levelHealthVar[0].levelInfo[0].updatedAt == 0 &&
            currentLevel == 1) ||
          (levelHealthVar[1].levelInfo[1].updatedAt == 0 &&
            levelHealthVar[1].levelInfo[0].updatedAt == 0 &&
            currentLevel == 2)
        ) {
          levelData[0].status = 'notSetup';
        }
      }
      // GET FROM LEVEL 2 ### LEVEL 2 ###
      if (levelHealthVar[1].levelInfo[2] && levelHealthVar[1].levelInfo[3]) {
        // Level 1 => KEEPER 1 (PRIMARY KEEPER)
        if (levelHealthVar[1].levelInfo[2]) {
          levelData[1].keeper1 = levelHealthVar[1].levelInfo[2];
        } // Level 1 =>
        if (levelHealthVar[1].levelInfo[3]) {
          levelData[1].keeper2 = levelHealthVar[1].levelInfo[3];
        } // Level 1 => Status
        if (
          levelHealthVar[1].levelInfo[2].status == 'accessible' &&
          levelHealthVar[1].levelInfo[3].status == 'accessible' // Both of the Keeper status is true
        ) {
          levelData[1].status = 'good';
        } else if (
          (levelHealthVar[1].levelInfo[2].status == 'accessible' &&
            levelHealthVar[1].levelInfo[3].status == 'notAccessible') ||
          (levelHealthVar[1].levelInfo[2].status == 'notAccessible' &&
            levelHealthVar[1].levelInfo[3].status == 'accessible') // one of the Keeper status is true
        ) {
          levelData[1].status = 'bad';
        } else if (
          (levelHealthVar[1].levelInfo[2].updatedAt != 0 &&
            levelHealthVar[1].levelInfo[3].updatedAt == 0) ||
          (levelHealthVar[1].levelInfo[2].updatedAt == 0 &&
            levelHealthVar[1].levelInfo[3].updatedAt != 0) // one of the Keeper is setup
        ) {
          levelData[1].status = 'bad';
        } else if (
          levelHealthVar[1].levelInfo[2].updatedAt != 0 &&
          levelHealthVar[1].levelInfo[3].updatedAt != 0 // Both of the Keeper is setup
        ) {
          levelData[1].status = 'bad';
        } else if (
          levelHealthVar[1].levelInfo[2].updatedAt == 0 &&
          levelHealthVar[1].levelInfo[3].updatedAt == 0
        ) {
          levelData[1].status = 'notSetup';
        }
      }
    }

    // CASE 3: currentLevel = 2 || currentLevel = 3 && levelHealthVar[0] && levelHealthVar[1] && levelHealthVar[2]
    if (
      (currentLevel == 2 || currentLevel == 3) &&
      levelHealthVar[0] &&
      levelHealthVar[1] &&
      levelHealthVar[2]
    ) {
      // GET FROM LEVEL 2 OR 3 ### LEVEL 1 ###
      if (
        (levelHealthVar[1].levelInfo[0] && levelHealthVar[1].levelInfo[1]) ||
        (levelHealthVar[2].levelInfo[0] && levelHealthVar[2].levelInfo[1])
      ) {
        // Level 1 => CLOUD
        if (levelHealthVar[1].levelInfo[0] || levelHealthVar[2].levelInfo[0]) {
          levelData[0].keeper1 =
            currentLevel == 2
              ? levelHealthVar[1].levelInfo[0]
              : levelHealthVar[2].levelInfo[0];
          levelData[0].keeper1.name = 'Cloud';
        } // Level 1 => SECURITY QUESTION
        if (levelHealthVar[1].levelInfo[1] || levelHealthVar[2].levelInfo[0]) {
          levelData[0].keeper2 =
            currentLevel == 2
              ? levelHealthVar[1].levelInfo[1]
              : levelHealthVar[2].levelInfo[1];
          levelData[0].keeper2.name = 'Security Question';
        } // Level 1 => Status
        if (
          (levelHealthVar[2].levelInfo[1].status == 'accessible' &&
            levelHealthVar[2].levelInfo[0].status == 'accessible' &&
            currentLevel == 3) ||
          (levelHealthVar[1].levelInfo[1].status == 'accessible' &&
            levelHealthVar[1].levelInfo[0].status == 'accessible' &&
            currentLevel == 2) // Both of the Keeper status is true
        ) {
          levelData[0].status = 'good';
        } else if (
          ((levelHealthVar[2].levelInfo[1].status == 'accessible' &&
            levelHealthVar[2].levelInfo[0].status == 'notAccessible') ||
            (levelHealthVar[2].levelInfo[1].status == 'notAccessible' &&
              levelHealthVar[2].levelInfo[0].status == 'accessible')) &&
          currentLevel == 3 // one of the Keeper status is true
        ) {
          levelData[0].status = 'bad';
        } else if (
          ((levelHealthVar[1].levelInfo[1].status == 'accessible' &&
            levelHealthVar[1].levelInfo[0].status == 'notAccessible') ||
            (levelHealthVar[1].levelInfo[1].status == 'notAccessible' &&
              levelHealthVar[1].levelInfo[0].status == 'accessible')) &&
          currentLevel == 2
        ) {
          levelData[0].status = 'bad';
        } else if (
          ((levelHealthVar[2].levelInfo[1].updatedAt != 0 &&
            levelHealthVar[2].levelInfo[0].updatedAt == 0) ||
            (levelHealthVar[2].levelInfo[1].updatedAt == 0 &&
              levelHealthVar[2].levelInfo[0].updatedAt != 0)) &&
          currentLevel == 3 // one of the Keeper is setup
        ) {
          levelData[0].status = 'bad';
        } else if (
          ((levelHealthVar[1].levelInfo[1].updatedAt != 0 &&
            levelHealthVar[1].levelInfo[0].updatedAt == 0) ||
            (levelHealthVar[1].levelInfo[1].updatedAt == 0 &&
              levelHealthVar[1].levelInfo[0].updatedAt != 0)) &&
          currentLevel == 2 // one of the Keeper is setup
        ) {
          levelData[0].status = 'bad';
        } else if (
          (levelHealthVar[2].levelInfo[1].updatedAt != 0 &&
            levelHealthVar[2].levelInfo[0].updatedAt != 0 &&
            currentLevel == 3) ||
          (levelHealthVar[1].levelInfo[1].updatedAt != 0 &&
            levelHealthVar[1].levelInfo[0].updatedAt != 0 &&
            currentLevel == 2) // Both of the Keeper is setup
        ) {
          levelData[0].status = 'bad';
        } else if (
          (levelHealthVar[2].levelInfo[1].updatedAt == 0 &&
            levelHealthVar[2].levelInfo[0].updatedAt == 0 &&
            currentLevel == 3) ||
          (levelHealthVar[1].levelInfo[1].updatedAt == 0 &&
            levelHealthVar[1].levelInfo[0].updatedAt == 0 &&
            currentLevel == 2)
        ) {
          levelData[0].status = 'notSetup';
        }
      }
      // GET FROM LEVEL 2 OR 3 // GET FROM LEVEL 2 OR 3 ### LEVEL 2 ###
      if (
        (levelHealthVar[1].levelInfo[2] && levelHealthVar[1].levelInfo[3]) ||
        (levelHealthVar[2].levelInfo[2] && levelHealthVar[2].levelInfo[3])
      ) {
        // Level 1 => KEEPER 1 (PRIMARY KEEPER)
        if (levelHealthVar[1].levelInfo[2] || levelHealthVar[2].levelInfo[2]) {
          levelData[1].keeper1 =
            currentLevel == 2
              ? levelHealthVar[1].levelInfo[2]
              : levelHealthVar[2].levelInfo[2];
        } // Level 1 =>
        if (levelHealthVar[1].levelInfo[3] || levelHealthVar[2].levelInfo[3]) {
          levelData[1].keeper2 =
            currentLevel == 2
              ? levelHealthVar[1].levelInfo[3]
              : levelHealthVar[2].levelInfo[3];
        } // Level 1 => Status
        if (
          (levelHealthVar[1].levelInfo[2].status == 'accessible' &&
            levelHealthVar[1].levelInfo[3].status == 'accessible' &&
            currentLevel == 2) ||
          (levelHealthVar[2].levelInfo[2].status == 'accessible' &&
            levelHealthVar[2].levelInfo[3].status == 'accessible' &&
            currentLevel == 3) // Both of the Keeper status is true
        ) {
          levelData[1].status = 'good';
        } else if (
          (levelHealthVar[1].levelInfo[2].status == 'accessible' &&
            levelHealthVar[1].levelInfo[3].status == 'notAccessible') ||
          (levelHealthVar[1].levelInfo[2].status == 'notAccessible' &&
            levelHealthVar[1].levelInfo[3].status == 'accessible' &&
            currentLevel == 2) // one of the Keeper status is true
        ) {
          levelData[1].status = 'bad';
        } else if (
          (levelHealthVar[2].levelInfo[2].status == 'accessible' &&
            levelHealthVar[2].levelInfo[3].status == 'notAccessible') ||
          (levelHealthVar[2].levelInfo[2].status == 'notAccessible' &&
            levelHealthVar[2].levelInfo[3].status == 'accessible' &&
            currentLevel == 3) // one of the Keeper status is true
        ) {
          levelData[1].status = 'bad';
        } else if (
          (levelHealthVar[1].levelInfo[2].updatedAt != 0 &&
            levelHealthVar[1].levelInfo[3].updatedAt == 0) ||
          (levelHealthVar[1].levelInfo[2].updatedAt == 0 &&
            levelHealthVar[1].levelInfo[3].updatedAt != 0 &&
            currentLevel == 2) // one of the Keeper is setup
        ) {
          levelData[1].status = 'bad';
        } else if (
          (levelHealthVar[2].levelInfo[2].updatedAt != 0 &&
            levelHealthVar[2].levelInfo[3].updatedAt == 0) ||
          (levelHealthVar[2].levelInfo[2].updatedAt == 0 &&
            levelHealthVar[2].levelInfo[3].updatedAt != 0 &&
            currentLevel == 3) // one of the Keeper is setup
        ) {
          levelData[1].status = 'bad';
        } else if (
          (levelHealthVar[1].levelInfo[2].updatedAt != 0 &&
            levelHealthVar[1].levelInfo[3].updatedAt != 0 &&
            currentLevel == 2) ||
          (levelHealthVar[2].levelInfo[2].updatedAt != 0 &&
            levelHealthVar[2].levelInfo[3].updatedAt != 0 &&
            currentLevel == 3) // Both of the Keeper is setup
        ) {
          levelData[1].status = 'bad';
        } else if (
          (levelHealthVar[1].levelInfo[2].updatedAt == 0 &&
            levelHealthVar[1].levelInfo[3].updatedAt == 0 &&
            currentLevel == 2) ||
          (levelHealthVar[2].levelInfo[2].updatedAt == 0 &&
            levelHealthVar[2].levelInfo[3].updatedAt == 0 &&
            currentLevel == 3)
        ) {
          levelData[1].status = 'notSetup';
        }
      }

      // GET FROM LEVEL 2 OR 3 ### LEVEL 3 ###
      if (levelHealthVar[2].levelInfo[4] && levelHealthVar[2].levelInfo[5]) {
        // Level 1 => KEEPER 3
        if (levelHealthVar[2].levelInfo[4]) {
          levelData[2].keeper1 = levelHealthVar[2].levelInfo[4];
        } // Level 1 => KEEPER 4
        if (levelHealthVar[2].levelInfo[5]) {
          levelData[2].keeper2 = levelHealthVar[2].levelInfo[5];
        } // Level 1 => Status
        if (
          levelHealthVar[2].levelInfo[4].status == 'accessible' &&
          levelHealthVar[2].levelInfo[5].status == 'accessible' &&
          currentLevel == 3 // Both of the Keeper status is true
        ) {
          levelData[2].status = 'good';
        } else if (
          (levelHealthVar[2].levelInfo[4].status == 'accessible' &&
            levelHealthVar[2].levelInfo[5].status == 'notAccessible') ||
          (levelHealthVar[2].levelInfo[4].status == 'notAccessible' &&
            levelHealthVar[2].levelInfo[5].status == 'accessible' &&
            currentLevel == 3) // one of the Keeper status is true
        ) {
          levelData[2].status = 'bad';
        } else if (
          (levelHealthVar[2].levelInfo[4].updatedAt != 0 &&
            levelHealthVar[2].levelInfo[5].updatedAt == 0) ||
          (levelHealthVar[2].levelInfo[4].updatedAt == 0 &&
            levelHealthVar[2].levelInfo[5].updatedAt != 0 &&
            currentLevel == 3) // one of the Keeper is setup
        ) {
          levelData[2].status = 'bad';
        } else if (
          levelHealthVar[2].levelInfo[4].updatedAt != 0 &&
          levelHealthVar[2].levelInfo[5].updatedAt != 0 &&
          currentLevel == 3 // Both of the Keeper is setup
        ) {
          levelData[2].status = 'bad';
        } else if (
          levelHealthVar[2].levelInfo[4].updatedAt == 0 &&
          levelHealthVar[2].levelInfo[5].updatedAt == 0 &&
          currentLevel == 3
        ) {
          levelData[2].status = 'notSetup';
        }
      }
    }
  }
  if (levelData.findIndex((value) => value.status == 'bad') > -1) {
    isError = true;
  }
  console.log('keeperinfo managebackupfunctions', keeperInfo)
  console.log('levelData managebackupfunctions', levelData)
  return { levelData, isError };
};
