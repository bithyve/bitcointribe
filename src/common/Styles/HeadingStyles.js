import { StyleSheet } from 'react-native';
import Colors from "../Colors";
import Fonts from "../Fonts";
import { RFValue } from "react-native-responsive-fontsize";


const HeadingStyles = StyleSheet.create({
  listSectionHeading: {
    fontSize: RFValue(16),
    fontWeight: '300',
    marginBottom: 12,
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
  },

  screenHeadingLarge: {
    fontSize: RFValue(24),
    fontWeight: '600',
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
  },
});

export default HeadingStyles;
