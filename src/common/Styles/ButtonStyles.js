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
  paddingVertical: 16,
};

const primaryActionButton = {
  ...actionButton,
  backgroundColor: Colors.blue,
  shadowColor: Colors.blue,
  shadowOpacity: 0.16,
  shadowOffset: { width: 10, height: 10 },
  elevation: 5,
};

const actionButtonText = {
  color: Colors.white,
  fontSize: RFValue(13),
  fontFamily: Fonts.FiraSansMedium,
};


const ButtonStyles = StyleSheet.create({
  actionButton,
  primaryActionButton,

  floatingActionButton: {
    ...primaryActionButton,
    borderRadius: 9999,
    paddingHorizontal: 14,
    shadowOpacity: 0.14,
    shadowOffset: { width: 11, height: 12 },
    elevation: 8,
  },

  actionButtonText,

  floatingActionButtonText: {
    ...actionButtonText,
    fontSize: RFValue(12),
  },
});

export default ButtonStyles;
