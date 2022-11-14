import { StyleSheet } from 'react-native'
import Colors from '../Colors'
import Fonts from '../Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP as hp, widthPercentageToDP } from 'react-native-responsive-screen'


const ListStyles = StyleSheet.create( {
  infoHeaderSection: {
    paddingHorizontal: 24,
    paddingVertical: 36,
  },

  infoHeaderTitleText: {
    fontSize: RFValue( 13 ),
    color: Colors.blue,
    fontFamily: Fonts.RobotoSlabRegular,
  },

  infoHeaderSubtitleText: {
    fontSize: RFValue( 9 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.RobotoSlabRegular,
    letterSpacing: 0.1
  },
  listItemTitleTransaction: {
    color: Colors.blue,
    fontSize: RFValue( 15 ),
    fontFamily: Fonts.RobotoSlabRegular,
  },
  listItemTitle: {
    color: Colors.black,
    fontSize: RFValue( 15 ),
    fontFamily: Fonts.RobotoSlabRegular,
  },

  disabledListItemTitle: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.RobotoSlabRegular,
  },

  listItemSubtitle: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.RobotoSlabRegular,
    marginTop: 3,
    letterSpacing: RFValue( 0 ),
    lineHeight: RFValue( 13 )
  },
  textAmt: {
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.RobotoSlabRegular,
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
    fontSize: RFValue( 14 ),
    fontFamily: Fonts.RobotoSlabRegular,
    letterSpacing: RFValue( 0.54 ),
  }
} )

export default ListStyles
