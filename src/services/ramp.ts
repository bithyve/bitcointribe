import config from '../bitcoin/HexaConfig'
import { getEnvDeepLinkPrefix } from '../utils/geEnvSpecificParams'

const deepLinkEnv = getEnvDeepLinkPrefix()
const finalURL = `https://hexawallet.io${deepLinkEnv}/ramp`

export const fetchRampReservation = ( { receiveAddress } ) => {
  try {
    const url =`${config.RAMP_BASE_URL}?\
hostAppName=${'Hexa Wallet'}&\
userAddress=${receiveAddress}&\
hostLogoUrl=${'https://hexa-public-assets.s3.eu-west-2.amazonaws.com/hexa_wallet_ramp_logo.png'}&\
swapAsset=BTC&\
hostApiKey=${config.RAMP_REFERRAL_CODE}&\
finalUrl=${finalURL}
`
    return {
      reservation: 'rampRes', url, error: null
    }

  } catch ( error ) {
    console.log( 'error generating ramp link ', error )
    return {
      error
    }
  }
}
