import { StyleSheet } from "react-native";
import Colors from "../../../common/Colors";
import Fonts from "../../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";

export default StyleSheet.create({
  cardIconImage: {
    width: 12,
    height: 14,
    resizeMode: "contain",
    marginLeft: "auto"
  },
  modalContainer: {
    height: "100%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: Colors.borderColor,
    alignSelf: "center",
    width: "100%"
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 15
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12, 812),
    marginTop: 5
  },
  modalContentView: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
});
