import { StyleSheet } from 'react-native'
import Colors from '../Colors'
import Fonts from '../Fonts'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'

export default StyleSheet.create( {
  headerContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    height: 54,
    backgroundColor: Colors.backgroundColor,
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
    color: Colors.blue,
    fontSize: RFValue( 24 ),
    letterSpacing: 0.01,
    marginLeft: 20,
    fontFamily: Fonts.FiraSansRegular
  },
  subHeaderTitles: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 20,
    fontFamily: Fonts.FiraSansRegular,
    marginTop: heightPercentageToDP( 0.5 ),
    letterSpacing: 0.6
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 15,
    marginRight: 15,
    fontWeight: 'normal',
    marginTop: 3,
    fontFamily: Fonts.FiraSansRegular,
  },
  headerTitlesInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 20,
    fontWeight: 'normal',
    marginRight: 20,
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular
  },

  homepageAmountText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 21 ),
    marginRight: 5
  },

  homepageAmountUnitText: {
    fontFamily: Fonts.FiraSansRegular,
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
