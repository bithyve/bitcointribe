import config from '../bitcoin/HexaConfig'
const { HEXA_ID } = config
import { BH_AXIOS } from './api'
import { getDeepLinkEnv } from '../utils/deeplink/getDeepLinkEnv'
const ramp_auth_url = 'https://buy.ramp.network/'
const ramp_referral_code = 'ku67r7oh5juc27bmb3h5pek8y5heyb5bdtfa66pr'
const deepLinkEnv = getDeepLinkEnv()
const finalURL = `https://hexawallet.io${deepLinkEnv}/ramp`
export const fetchRampReservation = ( amount, receiveAddress, currencyCode, country ) => {
  try {
    const body = {
      amount,
      currencyCode,
      country,
      receiveAddress,
      referenceId: Date.now()
    }
    const url =`${ramp_auth_url}?\
hostAppName=${'Hexa Wallet'}&\
userAddress=${receiveAddress}&\
hostLogoUrl=${'https://hexawallet.io/wp-content/uploads/2019/07/hexa-logo-footer.png'}&\
swapAsset=BTC&\
hostApiKey=${ramp_referral_code}&\
finalUrl=${finalURL}
`
    return {
      reservation: 'rampRes', url, error: null
    }

    // return BH_AXIOS.post( 'fetchRampReservation', {
    //   HEXA_ID,
    //   ...body
    // } )

  } catch ( error ) {
    console.log( 'error calling ramp ', error )
    return {
      error
    }
  }
}
