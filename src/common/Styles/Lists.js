import { StyleSheet } from 'react-native';
import Colors from "../Colors";
import Fonts from "../Fonts";
import { RFValue } from "react-native-responsive-fontsize";


const ListStyles = StyleSheet.create({
  infoHeaderSection: {
    paddingHorizontal: 24,
    paddingVertical: 36,
  },

  infoHeaderText: {
    fontSize: RFValue(11),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
  },

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

  thumbnailImageSmall: {
    width: 28,
    height: 28,
  },

  thumbnailImageMedium: {
    width: 40,
    height: 40,
  },

  reorderItemIconImage: {
    width: 44,
    height: 44,
  },
});

export default ListStyles;


