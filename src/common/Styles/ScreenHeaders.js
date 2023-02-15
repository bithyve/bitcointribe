import { StyleSheet } from 'react-native'
import Colors from '../Colors'
import Fonts from '../Fonts'
import { RFValue } from 'react-native-responsive-fontsize'


const ScreenHeaderStyles = StyleSheet.create( {
  smallHeaderContainer: {
    height: 59,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },

  smallHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.Regular,
    textAlign: 'center',
  },
} )

export default ScreenHeaderStyles
