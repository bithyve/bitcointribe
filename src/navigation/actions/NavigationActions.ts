import { CommonActions } from '@react-navigation/native'

export const goHomeAction = ( ) => {
  return CommonActions.reset( {
    index: 0,
    routes: [ {
      name: 'App',
    } ]
  } )
}

export const resetToHomeAction = ( params = {
} ) => {
  return CommonActions.navigate( {
    name: 'App',
    params,
  } )
}

export const resetStackToAccountDetails = ( params ) => {
  return CommonActions.reset( {
    index: 0,
    routes: [ {
      name: 'Home',
      key: 'HomeKey',
      state: {
        index: 1,
        routes: [
          {
            name: 'Home',
            key: 'HomeKey2'
          },
          {
            name: 'AccountDetails',
            key: 'AccountDetailsKey',
            params
          }
        ]
      }
    } ],
  } )
}

export const resetStackToAccountDetailsSendScreen = ( params ) => {
  return CommonActions.reset( {
    index: 0,
    routes: [ {
      name: 'Home',
      key: 'HomeKey',
      state: {
        index: 1,
        routes: [
          {
            name: 'Home',
            key: 'HomeKey2'
          },
          {
            name: 'AccountDetails',
            key: 'AccountDetailsKey',
            state: {
              routes: [
                {
                  name: 'Send',
                  key: 'SendKey',
                  params
                }
              ]
            }
          }
        ]
      }
    } ],
  } )
}

export const resetStackToSend = ( params ) => {
  return CommonActions.reset( {
    index: 0,
    routes: [ {
      name: 'Home',
      key: 'HomeKey',
      state: {
        index: 1,
        routes: [
          {
            name: 'Home',
            key: 'HomeKey2'
          },
          {
            name: 'AccountDetails',
            key: 'AccountDetailsKey',
            state: {
              routes: [
                {
                  name: 'Send',
                  key: 'SendKey',
                  state: {
                    routes: [
                      {
                        name: 'SentAmountForContactForm',
                        params,
                      },
                    ],
                  },
                }
              ]
            }
          }
        ]
      }
    } ],
  } )
}
