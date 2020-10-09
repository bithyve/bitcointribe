import { NavigationActions, StackActions } from "react-navigation";


export const goHomeAction = NavigationActions.navigate({
  routeName: 'Home',
});


export const resetStackToAccountDetails = (params) => {
  return StackActions.reset({
    index: 1,
    actions: [
      NavigationActions.navigate({ routeName: 'Home' }),
      NavigationActions.navigate({
        routeName: 'AccountDetails',
        params,
      }),
    ],
  });
};


export const goBackToAccountDetails = NavigationActions.back({
  key: 'AccountDetails',
});
