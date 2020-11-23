import config from "react-native-config"

let releaseTopic = null

export const getReleaseTopic = () => {
  return releaseTopic || getEnvSpecificReleaseTopic()
}

const getEnvSpecificReleaseTopic = () => {
  switch (config.APP_STAGE) {
    case 'app':
      releaseTopic = 'release'
      break
    case 'sta':
      releaseTopic = 'release' + '_stage'
      break
    case 'dev':
      releaseTopic = 'release' + '_dev'
  }
  return releaseTopic
}
