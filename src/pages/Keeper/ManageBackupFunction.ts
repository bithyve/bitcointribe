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
      levelData = checkLevelHealth(levelData, levelHealthVar, 0, 0);
    }

    // Executes when level 1 complete or level 2 in setup for completed setup and level 3 not initialized
    if (
      (currentLevel == 1 || currentLevel == 2) &&
      levelHealthVar[0] &&
      levelHealthVar[1] &&
      !levelHealthVar[2]
    ) {
      // if level 2 complete then change level 1 share data with level 2 share data at for cloud and security question
      levelData = checkLevelHealth(levelData, levelHealthVar, 1, 2);
    }

    // Executes when level 2 complete or level 3 in setup for completed setup
    if (
      (currentLevel == 2 || currentLevel == 3) &&
      levelHealthVar[0] &&
      levelHealthVar[1] &&
      levelHealthVar[2]
    ) {
      // if level 3 complete then change level 2 share data with level 3 share data at for cloud and security question
      levelData = checkLevelHealth(levelData, levelHealthVar, 2, 4);
    }
  }
  if (levelData.findIndex((value) => value.status == 'bad') > -1) {
    isError = true;
  }
  return { levelData, isError };
};

const checkLevelHealth = (
  levelData: any[],
  levelHealthVar: any[],
  index: number,
  index2: number,
) => {
  if (
    levelHealthVar[index].levelInfo[index2].updatedAt === 0 &&
    levelHealthVar[index].levelInfo[index2 + 1].updatedAt === 0
  ) {
    levelData[index].status = 'notSetup';
    return levelData;
  } else {
    const status = checkStatus(levelHealthVar, index, index2);
    let levelIndex = status === 'good' ? index : index !== 0 ? index - 1 : 0;
    if (index + 1 === 1 || index === 1 || index - 1 === 1) {
      levelData[0].keeper1 = levelHealthVar[levelIndex].levelInfo[0];
      levelData[0].keeper1.name = 'Cloud';
      levelData[0].keeper2 = levelHealthVar[levelIndex].levelInfo[1];
      levelData[0].keeper2.name = 'Security Question';
      console.log(checkStatus(levelHealthVar, 0, 0), levelData[0]);
      levelData[0].status = checkStatus(levelHealthVar, levelIndex, 0);
    }
    if (index + 1 === 2 || index === 2) {
      console.log('li', index, levelIndex);
      if (levelIndex === 2) {
        levelData[1].keeper1 = levelHealthVar[levelIndex - 1].levelInfo[2];
        levelData[1].keeper1.shareId =
          levelHealthVar[levelIndex].levelInfo[2].shareId;
        levelData[1].keeper1.status =
          levelHealthVar[levelIndex].levelInfo[2].status;
        levelData[1].keeper2 = levelHealthVar[levelIndex - 1].levelInfo[3];
        levelData[1].keeper2.shareId =
          levelHealthVar[levelIndex].levelInfo[3].shareId;
        levelData[1].keeper2.status =
          levelHealthVar[levelIndex].levelInfo[3].status;
      } else if (levelIndex === 1) {
        levelData[1].keeper1 = levelHealthVar[levelIndex].levelInfo[2];
        levelData[1].keeper2 = levelHealthVar[levelIndex].levelInfo[3];
      } else {
        levelData[1].keeper1 = levelHealthVar[index].levelInfo[2];
        levelData[1].keeper2 = levelHealthVar[index].levelInfo[3];
      }
      console.log('ld2', levelData);
      levelData[1].status = checkStatus(levelHealthVar, 1, 2);
      console.log('ld22', levelData);
    }
    if (index + 1 === 3) {
      levelData[2].keeper1 = levelHealthVar[2].levelInfo[4];
      levelData[2].keeper2 = levelHealthVar[2].levelInfo[5];
      levelData[2].status = checkStatus(levelHealthVar, 2, 4);
    }
  }
  return levelData;
};

const checkStatus = (levelHealthVar: any[], index: number, index2: number) => {
  if (
    levelHealthVar[index].levelInfo[index2].status === 'accessible' &&
    levelHealthVar[index].levelInfo[index2 + 1].status === 'accessible'
  ) {
    return 'good';
  } else if (
    levelHealthVar[index].levelInfo[index2].status === 'notAccessible' ||
    levelHealthVar[index].levelInfo[index2 + 1].status === 'notAccessible'
  ) {
    return 'bad';
  }
};
