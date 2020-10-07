import { StyleSheet } from 'react-native';
import Colors from "../Colors";
import Fonts from "../Fonts";
import { RFValue } from "react-native-responsive-fontsize";


const ListStyles = StyleSheet.create({
  listItemTitle: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },

  listItemSubtitle: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 3,
  },

  listItemContentContainer: {
    paddingVertical: 10,
  },
});

export default ListStyles;


