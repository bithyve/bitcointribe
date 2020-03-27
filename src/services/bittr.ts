import axios from 'axios'

//const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'
const URL = 'https://beta.getbittr.com/api'

export const createService = data =>
  axios({
    method: 'post',
    url:  URL + '/customer',
    data
  })

export const sendEmailService = data =>
  axios({
    method: 'post',
    url:  URL + '/verify/email',
    data,
  })

export const emailService = data =>
  axios({
    method: 'post',
    url:  URL + '/verify/email/check',
    data
  })

export const verifyEmailService = data =>
  axios({
    method: 'post',
    url:  URL + '/verify/email/check',
    data
  })

export const smsService = data =>
  axios({
    method: 'post',
    url:  URL + '/verify/sms',
    data
  })

export const xpubService = data =>
  axios({
    method: 'post',
    url:  URL + '/xpub/check',
    data
  })
