import { StyleSheet } from 'react-native'
import Colors from '../Colors'
import Fonts from '../Fonts'
import { RFValue } from 'react-native-responsive-fontsize'


const NavStyles = StyleSheet.create( {
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginHorizontal: 20,
    marginBottom: 15,
  },

  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
    textAlign: 'left',
    marginHorizontal: 0,
  },

  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 10,
    flexWrap: 'wrap',
  },

  modalHeaderSubtitleText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
  },

  modalNavHeaderContainer: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },


  // TODO: Legacy styles -- consider removing/refactoring
  modalContainer: {
    height: '100%',
    width: '100%',
  },

  modalContentView: {
    // flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
} )

export default NavStyles
