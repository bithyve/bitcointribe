export const modifyLevelStatus = (
  levelData: any[],
  levelHealth: any[],
  currentLevel: number,
  keeperInfo: any[],
): { levelData: any[]; isError: boolean } => {
  let isError = false;
  let abc = JSON.stringify(levelHealth);
  let levelHealthVar = [...getModifiedData(keeperInfo, JSON.parse(abc))];
  if (levelHealthVar && levelHealthVar.length > 0) {
    // Executes when level 1 setup or complete and level 2 not initialized
    if (
      (currentLevel == 1 || currentLevel == 0) &&
      levelHealthVar[0] &&
      !levelHealthVar[1] &&
      !levelHealthVar[2]
    ) {
      levelData = checkLevelHealth(levelData, levelHealthVar, 0, 0, currentLevel);
    }

    // Executes when level 1 complete or level 2 in setup for completed setup and level 3 not initialized
    if (
      (currentLevel == 1 || currentLevel == 2) &&
      levelHealthVar[0] &&
      levelHealthVar[1]
    ) {
      // if level 2 complete then change level 1 share data with level 2 share data at for cloud and security question
      levelData = checkLevelHealth(levelData, levelHealthVar, 1, 2, currentLevel);
    }

    // Executes when level 2 complete or level 3 in setup for completed setup
    if (
      (currentLevel == 2 || currentLevel == 3) &&
      levelHealthVar[0] &&
      levelHealthVar[1] &&
      levelHealthVar[2]
    ) {
      // if level 3 complete then change level 2 share data with level 3 share data at for cloud and security question
      levelData = checkLevelHealth(levelData, levelHealthVar, 2, 4, currentLevel);
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
  currentLevel: number
) => {
  if (
    levelHealthVar[index].levelInfo[index2].updatedAt === 0 &&
    levelHealthVar[index].levelInfo[index2 + 1].updatedAt === 0
  ) {
    levelData[index].status = 'notSetup';
    return levelData;
  } else {
    const status = checkStatus(levelHealthVar, index, index2);
    levelData[0].keeper1 = levelHealthVar[currentLevel - 1] && levelHealthVar[currentLevel - 1].levelInfo ? levelHealthVar[currentLevel - 1].levelInfo[0] : levelData[0].keeper1;
    levelData[0].keeper1.name = 'Cloud';
    levelData[0].keeper2 = levelHealthVar[currentLevel - 1] && levelHealthVar[currentLevel - 1].levelInfo[1] ? levelHealthVar[currentLevel - 1].levelInfo[1] : levelData[0].keeper2;
    levelData[0].keeper2.name = 'Security Question';
    levelData[0].status = checkStatus(levelHealthVar, currentLevel - 1, 0);
    if (levelHealthVar[1]) {
      if (currentLevel === 3) {
        levelData[1].keeper1 = levelHealthVar[2].levelInfo[2];
        levelData[1].keeper2 = levelHealthVar[2].levelInfo[3];
        levelData[1].status = checkStatus(levelHealthVar, 2, 2);
      }
      else {
        levelData[1].keeper1 = levelHealthVar[1].levelInfo[2];
        levelData[1].keeper2 = levelHealthVar[1].levelInfo[3];
        levelData[1].status = checkStatus(levelHealthVar, 1, 2);
      }
    }
    if (levelHealthVar[2]) {
      levelData[2].keeper1 = levelHealthVar[2].levelInfo[4];
      levelData[2].keeper2 = levelHealthVar[2].levelInfo[5];
      levelData[2].status = checkStatus(levelHealthVar, 2, 4);
    }
  }
  console.log('levelData', levelData)
  return levelData;
};

const checkStatus = (levelHealthVar: any[], index: number, index2: number) => {
  let status = 'notSetup';
  if(levelHealthVar[index] && levelHealthVar[index].levelInfo) {
    for (let i = 0; i < levelHealthVar[index].levelInfo.length; i++) {
      const element = levelHealthVar[index].levelInfo[i];
      if(element.status == 'accessible'){
        status = 'good';
      }
      if(element.status == 'notAccessible'){
        status = 'bad';
        return status;
      }
    }
  }
  return status;
};

const getModifiedData = (keeperInfo, levelHealthVar) => {
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
        if (
          keeperInfo.findIndex((value) => value.shareId == element.shareId) > -1
        ) {
          element.uuid =
            keeperInfo[
              keeperInfo.findIndex((value) => value.shareId == element.shareId)
            ].uuid;
        }
        if (
          keeperInfo.findIndex((value) => value.shareId == element.shareId) > -1
        ) {
          element.uuid =
            keeperInfo[
              keeperInfo.findIndex((value) => value.shareId == element.shareId)
            ].uuid;
        }
      }
    }
    if (
      levelHealthVar[1] &&
      levelHealthVar[1].levelInfo &&
      levelHealthVar[2] &&
      levelHealthVar[1].levelInfo
    ) {
      for (let j = 0; j < levelHealthVar[1].levelInfo.length; j++) {
        if (
          !levelHealthVar[2].levelInfo[j].uuid &&
          levelHealthVar[2].levelInfo[j].name ==
            levelHealthVar[1].levelInfo[j].name
        )
          levelHealthVar[2].levelInfo[j].uuid =
            levelHealthVar[1].levelInfo[j].uuid;
      }
    }
  }
  return levelHealthVar;
};
