import { StyleSheet } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Colors from '../Colors'
import Fonts from '../Fonts'

export default StyleSheet.create( {
  headerContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    height: 54,
    // backgroundColor: Colors.backgroundColor,
    // borderBottomColor: Colors.white,
    // borderBottomWidth: 0.5,
  },

  headerLeftIconContainer: {
    height: 54
  },

  headerLeftIconInnerContainer: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitles: {
    color: Colors.THEAM_TEXT_COLOR,
    fontSize: RFValue( 22 ),
    letterSpacing: 0.01,
    marginLeft: 20,
    fontFamily: Fonts.Medium
  },
  //
  headerTitles1: {
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontSize: RFValue( 16 ),
    letterSpacing: 0.01,
    marginLeft: 20,
    fontFamily: Fonts.Regular
  },
  subHeaderTitles: {
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontSize: RFValue( 12 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
    marginTop: heightPercentageToDP( 0.5 ),
    letterSpacing: 0.6
  },
  //
  subHeaderTitlesBold: {
    color: Colors.THEAM_TEXT_COLOR,
    fontSize: RFValue( 23 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
    marginTop: heightPercentageToDP( 0.5 ),
    letterSpacing: 0.6
  },
  headerInfoText: {
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontSize: RFValue( 12 ),
    marginLeft: 15,
    marginRight: 15,
    fontWeight: 'normal',
    marginTop: 3,
    fontFamily: Fonts.Regular,
  },
  headerTitlesInfoText: {
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontSize: RFValue( 12 ),
    marginLeft: 20,
    fontWeight: 'normal',
    marginRight: 20,
    marginTop: 5,
    fontFamily: Fonts.Regular
  },

  homepageAmountText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 21 ),
    marginRight: 5
  },

  homepageAmountUnitText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 11 ),
    marginBottom: 3
  },

  homepageAmountImage: {
    width: widthPercentageToDP( 3.5 ),
    height: widthPercentageToDP( 3.5 ),
    marginRight: 5,
    // marginBottom: widthPercentageToDP( 1 ),
    resizeMode: 'contain'
  },

  rootView: {
    flex: 1,
    backgroundColor: 'white'
  },

  cardIconImage: {
    width: 12,
    height: 14,
    resizeMode: 'contain',
    marginLeft: 'auto',
  },
} )
