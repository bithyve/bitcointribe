import config from 'react-native-config'

let deepLinkEnv = null

export const getDeepLinkEnv = () => {
  return deepLinkEnv || generateDeepLinkEnv()
}

const generateDeepLinkEnv = () => {
  switch ( config.BIT_SERVER_MODE ) {
      case 'PROD':
        deepLinkEnv = '/app'
        break
      case 'STA':
        deepLinkEnv = '/sta'
        break
      case 'DEV':
        deepLinkEnv = '/dev'
  }
  return deepLinkEnv
}

