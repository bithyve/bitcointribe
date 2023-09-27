import NavStyles from '../../common/Styles/NavStyles'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { Platform } from 'react-native'

const defaultStackScreenNavigationOptions: NativeStackNavigationOptions = {
  headerTitleStyle: NavStyles.modalHeaderTitleText,

  //TODO:- replace these below commented properties with new style properties

  // headerTitleContainerStyle: {
  //   // Prefer left-aligned title text
  //   justifyContent: 'flex-start',

  //   // offset the spacing applied by default b/w the left container and title container
  //   marginLeft: Platform.OS === 'ios' ? -16 : -5,
  // },

  // headerRightContainerStyle: {
  //   paddingRight: 16,
  // },
}


export default defaultStackScreenNavigationOptions
