import NavStyles from '../../common/Styles/NavStyles'
import { NavigationScreenConfig } from 'react-navigation'
import { NavigationStackOptions } from 'react-navigation-stack'
import { Platform } from 'react-native'


export type NavigationOptions = NavigationScreenConfig<NavigationStackOptions, any>;


const defaultStackScreenNavigationOptions: NavigationScreenConfig<NavigationStackOptions, any> = {
  headerTitleStyle: NavStyles.modalHeaderTitleText,

  headerTitleContainerStyle: {
    // Prefer left-aligned title text
    justifyContent: 'flex-start',

    // offset the spacing applied by default b/w the left container and title container
    marginLeft: Platform.OS === 'ios' ? -16 : -5,
  },

  headerRightContainerStyle: {
    paddingRight: 16,
  },
}


export default defaultStackScreenNavigationOptions
