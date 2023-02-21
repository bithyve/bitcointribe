import { StyleSheet } from 'react-native'
import Colors from '../Colors'
import Fonts from '../Fonts'
import { RFValue } from 'react-native-responsive-fontsize'


const HeadingStyles = StyleSheet.create( {
  listSectionHeading: {
    fontSize: RFValue( 14 ),
    fontWeight: '300',
    fontFamily: Fonts.Regular,
    color: Colors.blue,
    paddingHorizontal: 16,
  },

  screenHeadingLarge: {
    fontSize: RFValue( 24 ),
    fontWeight: '600',
    fontFamily: Fonts.Regular,
    color: Colors.blue,
  },

  captionText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
    color: Colors.gray6,
  },

  labelText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  },

  sectionSubHeadingText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontWeight: 'normal',
    fontFamily: Fonts.Regular
  },
} )

export default HeadingStyles
