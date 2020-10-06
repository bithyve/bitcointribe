import { StyleSheet } from 'react-native';
import Colors from '../Colors';
import Fonts from "../Fonts";
import { RFValue } from "react-native-responsive-fontsize";


const actionButton = {
  borderRadius: 10,
  minHeight: 50,
  minWidth: 144,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 16
};


const ButtonStyles = StyleSheet.create({
  actionButton,

  primaryActionButton: {
    ...actionButton,
    backgroundColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOpacity: 0.16,
    shadowOffset: { width: 10, height: 10 },
    elevation: 5,
  },

  actionButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});

export default ButtonStyles;
