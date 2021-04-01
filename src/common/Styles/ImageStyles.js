import { StyleSheet } from 'react-native'
import Colors from '../Colors'
import Fonts from '../Fonts'
import { RFValue } from 'react-native-responsive-fontsize'


const ListStyles = StyleSheet.create( {
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

  thumbnailImageXLarge: {
    width: 64,
    height: 64,
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
    shadowOpacity: 0.37,
    shadowColor: Colors.gray2,
    elevation: 10,
    padding: 10
  },
} )

export default ListStyles
