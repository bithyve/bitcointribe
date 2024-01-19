import { CommonActions } from '@react-navigation/native'

export const goHomeAction = ( ) => {
  return CommonActions.reset( {
    index: 0,
    routes: [
      {
        name: 'Home'
      }
    ],
  } )
}

export const resetToHomeAction = ( params ) => {
  return CommonActions.reset( {
    index: 0,
    routes: [
      {
        name: 'Home',
        params
      }
    ],
  } )
}

export const resetStackToAccountDetails = ( params ) => {
  return CommonActions.reset( {
    index: 1,
    routes: [
      {
        name: 'Home'
      },
      {
        name: 'AccountDetails', params
      },
    ],
  } )
}

export const resetStackToAccountDetailsSendScreen = ( params ) => {
  return CommonActions.reset( {
    index: 1,
    routes: [
      {
        name: 'Home'
      },
      {
        name: 'Send', params
      },
    ],
  } )}

export const resetStackToSend = ( params ) => {
  return CommonActions.reset( {
    index: 1,
    routes: [
      {
        name: 'Home'
      },
      {
        name: 'SentAmountForContactForm', params
      },
    ],
  } )
}
