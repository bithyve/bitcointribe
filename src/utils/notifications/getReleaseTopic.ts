import config from "react-native-config"

let releaseTopic = null

export const getReleaseTopic = () => {
  return releaseTopic || getEnvSpecificReleaseTopic()
}

const getEnvSpecificReleaseTopic = () => {
    switch (config.BIT_SERVER_MODE) {
    case 'PROD':
      releaseTopic = 'release'
      break
    case 'STA':
      releaseTopic = 'release' + '_stage'
      break
    case 'DEV':
      releaseTopic = 'release' + '_dev'
  }
  return releaseTopic
}

