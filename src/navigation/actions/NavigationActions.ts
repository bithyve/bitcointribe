import { NavigationActions, StackActions } from 'react-navigation'


export const goHomeAction = NavigationActions.navigate( {
  routeName: 'Landing',
} )


export const resetToHomeAction = ( params = {
} ) => {
  return StackActions.reset( {
    key: null,
    index: 0,
    actions: [
      NavigationActions.navigate( {
        routeName: 'Landing',
        params,
      } ),
    ],
  } )
}


export const resetStackToAccountDetails = ( params ) => {
  return StackActions.reset( {
    index: 0,
    actions: [
      NavigationActions.navigate( {
        routeName: 'Landing'
      } ),
      NavigationActions.navigate( {
        routeName: 'AccountDetails',
        params,
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
