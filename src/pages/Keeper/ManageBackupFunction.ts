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

    // Executes when level 1 setup or complete and level 2 not initialized
    if (
      (currentLevel == 1 || currentLevel == 0) &&
      levelHealthVar[0] &&
      !levelHealthVar[1] &&
      !levelHealthVar[2]
    ) {
      if (levelHealthVar[0].levelInfo[0] && levelHealthVar[0].levelInfo[1]) {
        levelData[0].keeper1 = levelHealthVar[0].levelInfo[0];
        levelData[0].keeper1.name = 'Cloud';
        levelData[0].keeper2 = levelHealthVar[0].levelInfo[1];
        levelData[0].keeper2.name = 'Security Question';
        if (
          levelHealthVar[0].levelInfo[1].updatedAt === 0 &&
          levelHealthVar[0].levelInfo[0].updatedAt === 0
        ) {
          levelData[0].status = 'notSetup';
        } else {
          if (
            levelHealthVar[0].levelInfo[1].status === 'accessible' &&
            levelHealthVar[0].levelInfo[0].status === 'accessible'
          ) {
            levelData[0].status = 'good';
          } else if (
            levelHealthVar[0].levelInfo[1].status === 'notAccessible' ||
            levelHealthVar[0].levelInfo[0].status === 'notAccessible'
          ) {
            levelData[0].status = 'bad';
          }
        }
      }
    }

    // Executes when level 1 complete or level 2 in setup for completed setup and level 3 not initialized
    if (
      (currentLevel == 1 || currentLevel == 2) &&
      levelHealthVar[0] &&
      levelHealthVar[1] &&
      !levelHealthVar[2]
    ) {
      // if level 2 complete then change level 1 share data with level 2 share data at for cloud and security question
      if (
        (levelHealthVar[0].levelInfo[0] && levelHealthVar[0].levelInfo[1]) ||
        (levelHealthVar[1].levelInfo[0] && levelHealthVar[1].levelInfo[1])
      ) {
        levelData[0].keeper1 =
          currentLevel === 2
            ? levelHealthVar[1].levelInfo[0]
            : levelHealthVar[0].levelInfo[0];
        levelData[0].keeper1.name = 'Cloud';
        levelData[0].keeper2 =
          currentLevel === 2
            ? levelHealthVar[1].levelInfo[1]
            : levelHealthVar[0].levelInfo[1];
        levelData[0].keeper2.name = 'Security Question';
        if (
          (levelHealthVar[0].levelInfo[1].updatedAt === 0 &&
            levelHealthVar[0].levelInfo[0].updatedAt === 0 &&
            currentLevel === 1) ||
          (levelHealthVar[1].levelInfo[1].updatedAt === 0 &&
            levelHealthVar[1].levelInfo[0].updatedAt === 0 &&
            currentLevel === 2)
        ) {
          levelData[0].status = 'notSetup';
        } else {
          if (
            (levelHealthVar[0].levelInfo[1].status === 'accessible' &&
              levelHealthVar[0].levelInfo[0].status === 'accessible' &&
              currentLevel === 1) ||
            (levelHealthVar[1].levelInfo[1].status === 'accessible' &&
              levelHealthVar[1].levelInfo[0].status === 'accessible' &&
              currentLevel === 2)
          ) {
            levelData[0].status = 'good';
          } else if (
            (levelHealthVar[0].levelInfo[1].status === 'notAccessible' ||
              levelHealthVar[0].levelInfo[0].status === 'notAccessible') &&
            currentLevel === 1
          ) {
            levelData[0].status = 'bad';
          } else if (
            (levelHealthVar[1].levelInfo[1].status === 'notAccessible' ||
              levelHealthVar[1].levelInfo[0].status === 'notAccessible') &&
            currentLevel === 2
          ) {
            levelData[0].status = 'bad';
          }
        }
      }

      // assigning level 2 share data
      if (levelHealthVar[1].levelInfo[2] && levelHealthVar[1].levelInfo[3]) {
        levelData[1].keeper1 = levelHealthVar[1].levelInfo[2];
        levelData[1].keeper2 = levelHealthVar[1].levelInfo[3];
        if (
          levelHealthVar[1].levelInfo[2].updatedAt === 0 &&
          levelHealthVar[1].levelInfo[3].updatedAt === 0
        ) {
          levelData[1].status = 'notSetup';
        } else {
          if (
            levelHealthVar[1].levelInfo[2].status === 'accessible' &&
            levelHealthVar[1].levelInfo[3].status === 'accessible'
          ) {
            levelData[1].status = 'good';
          } else if (
            levelHealthVar[1].levelInfo[2].status === 'notAccessible' ||
            levelHealthVar[1].levelInfo[3].status === 'notAccessible'
          ) {
            levelData[1].status = 'bad';
          }
        }
      }
    }

    // Executes when level 2 complete or level 3 in setup for completed setup
    if (
      (currentLevel == 2 || currentLevel == 3) &&
      levelHealthVar[0] &&
      levelHealthVar[1] &&
      levelHealthVar[2]
    ) {
      // if level 3 complete then change level 2 share data with level 3 share data at for cloud and security question
      if (
        (levelHealthVar[1].levelInfo[0] && levelHealthVar[1].levelInfo[1]) ||
        (levelHealthVar[2].levelInfo[0] && levelHealthVar[2].levelInfo[1])
      ) {
        levelData[0].keeper1 =
          currentLevel === 3
            ? levelHealthVar[2].levelInfo[0]
            : levelHealthVar[1].levelInfo[0];
        levelData[0].keeper1.name = 'Cloud';
        levelData[0].keeper2 = levelHealthVar[2].levelInfo[1]
          ? levelHealthVar[2].levelInfo[1]
          : levelHealthVar[1].levelInfo[1];
        levelData[0].keeper2.name = 'Security Question';
        if (
          (levelHealthVar[2].levelInfo[1].updatedAt === 0 &&
            levelHealthVar[2].levelInfo[0].updatedAt === 0) ||
          (levelHealthVar[1].levelInfo[1].updatedAt === 0 &&
            levelHealthVar[1].levelInfo[0].updatedAt === 0)
        ) {
          levelData[0].status = 'notSetup';
        } else {
          if (
            (levelHealthVar[2].levelInfo[1].status === 'accessible' &&
              levelHealthVar[2].levelInfo[0].status === 'accessible' &&
              currentLevel === 3) ||
            (levelHealthVar[1].levelInfo[1].status === 'accessible' &&
              levelHealthVar[1].levelInfo[0].status === 'accessible' &&
              currentLevel === 2)
          ) {
            levelData[0].status = 'good';
          } else if (
            ((levelHealthVar[2].levelInfo[1].status === 'notAccessible' ||
              levelHealthVar[2].levelInfo[0].status === 'notAccessible') &&
              currentLevel === 3) ||
            ((levelHealthVar[1].levelInfo[1].status === 'notAccessible' ||
              levelHealthVar[1].levelInfo[0].status === 'notAccessible') &&
              currentLevel === 2)
          ) {
            levelData[0].status = 'bad';
          }
        }
      }

      // if level 3 complete then change level 2 share data with level 3 share data at for 1st and 2nd keeper
      if (
        (levelHealthVar[1].levelInfo[2] && levelHealthVar[1].levelInfo[3]) ||
        (levelHealthVar[2].levelInfo[2] && levelHealthVar[2].levelInfo[3])
      ) {
        levelData[1].keeper1 =
          currentLevel === 3
            ? levelHealthVar[2].levelInfo[2]
            : levelHealthVar[1].levelInfo[2];
        levelData[1].keeper2 =
          currentLevel === 3
            ? levelHealthVar[2].levelInfo[3]
            : levelHealthVar[1].levelInfo[3];
        if (
          (levelHealthVar[1].levelInfo[2].updatedAt == 0 &&
            levelHealthVar[1].levelInfo[3].updatedAt == 0 &&
            currentLevel == 2) ||
          (levelHealthVar[2].levelInfo[2].updatedAt == 0 &&
            levelHealthVar[2].levelInfo[3].updatedAt == 0 &&
            currentLevel == 3)
        ) {
          levelData[1].status = 'notSetup';
        } else {
          if (
            (levelHealthVar[1].levelInfo[2].status == 'accessible' &&
              levelHealthVar[1].levelInfo[3].status == 'accessible' &&
              currentLevel == 2) ||
            (levelHealthVar[2].levelInfo[2].status == 'accessible' &&
              levelHealthVar[2].levelInfo[3].status == 'accessible' &&
              currentLevel == 3)
          ) {
            levelData[1].status = 'good';
          } else if (
            (levelHealthVar[1].levelInfo[2].status == 'notAccessible' ||
              levelHealthVar[1].levelInfo[3].status == 'notAccessible') &&
            currentLevel == 2
          ) {
            levelData[1].status = 'bad';
          } else if (
            (levelHealthVar[2].levelInfo[2].status == 'notAccessible' ||
              levelHealthVar[2].levelInfo[3].status == 'notAccessible') &&
            currentLevel == 3
          ) {
            levelData[1].status = 'bad';
          }
        }
      }

      // assign level 3 data
      if (levelHealthVar[2].levelInfo[4] && levelHealthVar[2].levelInfo[5]) {
        levelData[2].keeper1 = levelHealthVar[2].levelInfo[4];
        levelData[2].keeper2 = levelHealthVar[2].levelInfo[5];
        if (
          levelHealthVar[2].levelInfo[4].updatedAt == 0 &&
          levelHealthVar[2].levelInfo[5].updatedAt == 0
        ) {
          levelData[2].status = 'notSetup';
        } else {
          if (
            levelHealthVar[2].levelInfo[2].status == 'accessible' &&
            levelHealthVar[2].levelInfo[3].status == 'accessible' &&
            levelHealthVar[2].levelInfo[4].status == 'accessible' &&
            levelHealthVar[2].levelInfo[5].status == 'accessible'
          ) {
            levelData[2].status = 'good';
          } else if (
            (levelHealthVar[2].levelInfo[2].status == 'notAccessible' ||
              levelHealthVar[2].levelInfo[3].status == 'notAccessible' ||
              levelHealthVar[2].levelInfo[4].status == 'notAccessible' ||
              levelHealthVar[2].levelInfo[5].status == 'notAccessible')
          ) {
            levelData[2].status = 'bad';
          }
        }
      }
    }
  }
  if (levelData.findIndex((value) => value.status == 'bad') > -1) {
    isError = true;
  }
  console.log('levelHealthVar managebackupfunctions', levelHealthVar);
  console.log('levelData managebackupfunctions', levelData);
  return { levelData, isError };
};
