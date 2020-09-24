import { StyleSheet } from 'react-native';
import Colors from '../Colors';
import Fonts from "../Fonts";
import { RFValue } from "react-native-responsive-fontsize";



const actionButton = {
  borderRadius: 12,
  height: 44,
  minWidth: 144,
  justifyContent: 'center',
  alignItems: 'center',
};


const ButtonStyles = StyleSheet.create({
  primaryActionButton: {
    ...actionButton,
    backgroundColor: Colors.blue,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },

  actionButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});

export default ButtonStyles;
