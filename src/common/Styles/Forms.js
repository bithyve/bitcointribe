import { StyleSheet } from "react-native";
import Colors from "../Colors";
import Fonts from "../Fonts";
import { RFValue } from "react-native-responsive-fontsize";

const FormStyles = StyleSheet.create({
  inputContainer: {
    borderBottomColor: Colors.grayScale1,
  },

  textInputContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
  },

  inputText: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },

  placeholderText: {
    color: "#BCB6B6",
  },

  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
  },
});


export default FormStyles;
