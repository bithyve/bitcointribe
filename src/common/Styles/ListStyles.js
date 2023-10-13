import { StyleSheet } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP as hp, widthPercentageToDP } from 'react-native-responsive-screen'
import Colors from '../Colors'
import Fonts from '../Fonts'


const ListStyles = StyleSheet.create( {
  infoHeaderSection: {
    paddingHorizontal: 24,
    paddingVertical: 36,
  },

  infoHeaderTitleText: {
    fontSize: RFValue( 12 ),
    color: Colors.THEAM_TEXT_COLOR,
    fontFamily: Fonts.Regular,
  },

  infoHeaderSubtitleText: {
    fontSize: RFValue( 10 ),
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontFamily: Fonts.Regular,
    letterSpacing: 0.1
  },
  listItemTitleTransaction: {
    color: Colors.blue,
    fontSize: RFValue( 15 ),
    fontFamily: Fonts.Regular,
  },
  listItemTitle: {
    color: Colors.black,
    fontSize: RFValue( 15 ),
    fontFamily: Fonts.Regular,
  },

  disabledListItemTitle: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
  },

  listItemSubtitle: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    marginTop: 3,
    letterSpacing: RFValue( 0 ),
    lineHeight: RFValue( 13 )
  },
  textAmt: {
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Regular,
    color: Colors.textColorGrey,
  },
  listItemContentContainer: {
    // paddingVertical: 10,
  },
  container : {
    // paddingHorizontal: 3,
    height: hp( '9%' ),
    marginHorizontal: 14
  },
  disabledContainer: {
    paddingHorizontal: 16,
    backgroundColor: 'rgb(245,245,248)'
  },
  reorderItemIconImage: {
    width: 44,
    height: 44,
  },
  modalTitle: {
    marginLeft: widthPercentageToDP( '7%' ),
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Regular,
    letterSpacing: RFValue( 0.54 )
  }
} )

export default ListStyles
