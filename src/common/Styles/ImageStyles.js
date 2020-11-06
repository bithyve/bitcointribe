import { StyleSheet } from 'react-native';
import Colors from "../Colors";
import Fonts from "../Fonts";
import { RFValue } from "react-native-responsive-fontsize";


const ListStyles = StyleSheet.create({
  thumbnailImageSmall: {
    width: 28,
    height: 28,
  },

  thumbnailImageMedium: {
    width: 44,
    height: 44,
  },

  thumbnailImageLarge: {
    width: 54,
    height: 54,
  },

  reorderItemIconImage: {
    width: 44,
    height: 44,
  },

  circledAvatarContainer: {
    borderRadius: 9999,
    borderColor: Colors.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 10,
    shadowOpacity: 0.7,
    shadowColor: Colors.gray3,
    elevation: 10,
  },
});

export default ListStyles;
