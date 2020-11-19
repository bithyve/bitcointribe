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
