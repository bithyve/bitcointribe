import { NavigationActions, StackActions } from "react-navigation";


export const goHomeAction = NavigationActions.navigate({
  routeName: 'Home',
});


export const resetToHomeAction = (params = {}) => {
  return StackActions.reset({
    key: null,
    index: 0,
    actions: [
      NavigationActions.navigate({
        routeName: 'Home',
        params,
      }),
    ],
  });
};


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
