import config from '../bitcoin/HexaConfig'

export const getEnvReleaseTopic = () => {
  switch ( config.APP_STAGE ) {
      case 'app':
        return 'release'
      case 'sta':
        return 'release' + '_stage'
      case 'dev':
        return 'release' + '_dev'
  }
}

export const getEnvDeepLinkPrefix = () => {
  return ( `/${config.APP_STAGE}` )
}

