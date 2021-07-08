import { StyleSheet } from 'react-native'
import Colors from '../Colors'
import Fonts from '../Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'


const ListStyles = StyleSheet.create( {
  infoHeaderSection: {
    paddingHorizontal: 24,
    paddingVertical: 36,
  },

  infoHeaderTitleText: {
    fontSize: RFValue( 13 ),
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
  },

  infoHeaderSubtitleText: {
    fontSize: RFValue( 11 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
  },

  listItemTitle: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },

  disabledListItemTitle: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },

  listItemSubtitle: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 3,
  },
  listItemContentContainer: {
    // paddingVertical: 10,
  },
  container : {
    // paddingHorizontal: 3,
    height: hp( '9%' ),
    marginHorizontal: 14
  },
  disabledContainer: {
    paddingHorizontal: 16,
    backgroundColor: 'rgb(245,245,248)'
  },
  reorderItemIconImage: {
    width: 44,
    height: 44,
  },
} )

export default ListStyles
