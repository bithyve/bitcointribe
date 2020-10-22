import { NavigationState } from "react-navigation";

export default function getActiveRouteName(navigationState: NavigationState) {
  if (!navigationState) {
    return null;
  }

  const route = navigationState.routes[navigationState.index];

  // Dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route);
  }

  return route.routeName;
}
