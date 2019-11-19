import { StyleSheet } from "react-native";
import Colors from "./Colors";
import Fonts from "./Fonts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";

export default StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 54,
    backgroundColor: Colors.white,
    borderBottomColor: Colors.white,
    borderBottomWidth: 0.5
  },
  headerLeftIconContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 40
  },
  headerLeftIconInnerContainer: {
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center"
  }
});
