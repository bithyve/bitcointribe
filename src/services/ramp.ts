import config from '../bitcoin/HexaConfig'
import { getEnvDeepLinkPrefix } from '../utils/geEnvSpecificParams'

const deepLinkEnv = getEnvDeepLinkPrefix()
const finalURL = `https://hexawallet.io${deepLinkEnv}/ramp/`

export const fetchRampReservation = ( { receiveAddress } ) => {
  try {
    const url =`${config.RAMP_BASE_URL}?\
hostAppName=${'Bitcoin Tribe'}&\
userAddress=${receiveAddress}&\
hostLogoUrl=${'https://user-images.githubusercontent.com/50690016/228565852-ab731947-c31f-45e6-914a-86828cb359b1.png'}&\
swapAsset=BTC&\
hostApiKey=${config.RAMP_REFERRAL_CODE}&\
finalUrl=${finalURL}
`
    return {
      reservation: 'rampRes', url, error: null
    }

  } catch ( error ) {
    // error
    return {
      error
    }
  }
}
