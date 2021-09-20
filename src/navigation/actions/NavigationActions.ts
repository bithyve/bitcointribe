import { NavigationActions, StackActions } from 'react-navigation'



export const goHomeAction = ( ) => {
  const resetAction = StackActions.reset( {
    index: 0,
    actions: [
      NavigationActions.navigate( {
        routeName: 'Landing'
      } )
    ],
  } )

  return resetAction
}


export const resetToHomeAction = ( params = {
} ) => {
  return  NavigationActions.navigate( {
    routeName: 'Home',
    params,
  } )
}

export const resetStackToAccountDetails = ( params ) => {
  return StackActions.reset( {
    index: 0,
    actions: [
      NavigationActions.navigate( {
        routeName: 'Landing',
        action: NavigationActions.navigate( {
          routeName: 'AccountDetails',
          params,
        } ),
      } ),
    ],
  } )
}

export const resetStackToAccountDetailsSendScreen = ( params ) => {
  return StackActions.reset( {
    index: 0,
    actions: [
      NavigationActions.navigate( {
        routeName: 'Landing',
        action: NavigationActions.navigate( {
          routeName: 'AccountDetails',
          action: NavigationActions.navigate( {
            routeName: 'Send',
            params,
          } ),
        } ),
      } ),
    ],
  } )
}

export const resetStackToSend = ( params ) => {
  return StackActions.reset( {
    index: 0,
    actions: [
      NavigationActions.navigate( {
        routeName: 'Landing',
        action:NavigationActions.navigate( {
          routeName: 'AccountDetails',
          action: NavigationActions.navigate( {
            routeName: 'Send',
            action: NavigationActions.navigate( {
              routeName: 'SentAmountForContactForm',
              params,
            } ),
          } ),
        } ),
      } )
    ]
  } )
}
