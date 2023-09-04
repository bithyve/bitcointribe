import { StyleSheet } from 'react-native'
import Colors from '../Colors'
import Fonts from '../Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'


const ListStyles = StyleSheet.create( {
  thumbnailImageSmall: {
    width: 28,
    height: 28,
  },

  thumbnailImageMedium: {
    width: wp( 9 ),
    height: wp( 9 ),
  },

  thumbnailImageLarge: {
    width: wp( 14 ),
    height: wp( 14 ),
    alignItems: 'center',
    justifyContent: 'center'
  },

  thumbnailImageXLarge: {
    width: wp( 18 ),
    height: wp( 18 ),
  },

  reorderItemIconImage: {
    width: 26,
    height: 22,
    marginRight: 30
  },

  circledAvatarContainer: {
    borderRadius: wp( 15 )/2,
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
