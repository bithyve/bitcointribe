import { StyleSheet } from 'react-native';
import Colors from "../Colors";
import Fonts from "../Fonts";
import { RFValue } from "react-native-responsive-fontsize";


const HeadingStyles = StyleSheet.create({
  listSectionHeading: {
    fontSize: RFValue(16),
    fontWeight: '300',
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
    paddingHorizontal: 16,
  },

  screenHeadingLarge: {
    fontSize: RFValue(24),
    fontWeight: '600',
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
  },

  captionText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.gray6,
  },
});

export default HeadingStyles;
