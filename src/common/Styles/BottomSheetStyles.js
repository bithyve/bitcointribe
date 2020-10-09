import { StyleSheet } from 'react-native';
import Colors from "../Colors";
import Fonts from "../Fonts";
import { RFValue } from "react-native-responsive-fontsize";


const BottomSheetStyles = StyleSheet.create({
  confirmationMessageHeading: {
    fontSize: RFValue(18),
    marginBottom: 12,
    fontFamily: Fonts.FiraSansMedium,
    color: Colors.blue,
  },
});

export default BottomSheetStyles;
