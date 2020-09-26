import { StyleSheet } from "react-native";
import Colors from "../Colors";
import Fonts from "../Fonts";
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { RFValue } from "react-native-responsive-fontsize";

export default StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    height: 54,
    backgroundColor: Colors.white,
    borderBottomColor: Colors.white,
    borderBottomWidth: 0.5,
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
    fontSize: RFValue(25),
    marginLeft: 20,
    fontFamily: Fonts.FiraSansRegular
  },

  headerTitlesInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    marginLeft: 20,
    fontWeight: 'normal',
    marginRight: 20,
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular
  },

  homepageAmountText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(21),
    marginRight: 5
  },

  homepageAmountUnitText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginBottom: 3
  },

  homepageAmountImage: {
    width: widthPercentageToDP(3),
    height: widthPercentageToDP(3),
    marginRight: 5,
    marginBottom: widthPercentageToDP(1),
    resizeMode: 'contain'
  },

  rootView: {
    flex: 1,
    backgroundColor: 'white'
  },


  // TODO: Eventually, these styles below should be
  // broken out into a standalone "Nav styles" file.

  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
  },

  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },

  modalHeaderSubheadingText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: 10,
  },

  statusBarStyle: {
    flex: 0,
  },

  modalNavHeaderContainer: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
