import { StyleSheet } from 'react-native'
import Colors from '../Colors'
import Fonts from '../Fonts'
import { RFValue } from 'react-native-responsive-fontsize'

const miniNavButton = {
  borderRadius: 5,
  minHeight: 25,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 10,
  paddingVertical: 6,
  backgroundColor: Colors.lightBlue,
}

const miniNavButtonText = {
  color: Colors.white,
  fontSize: RFValue( 12 ),
  fontFamily: Fonts.FiraSansRegular,
}

const actionButton = {
  borderRadius: 10,
  minHeight: 50,
  minWidth: 130,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 16,
}

const primaryActionButton = {
  ...actionButton,
  backgroundColor: Colors.blue,

}

const disabledPrimaryActionButton = {
  ...actionButton,
  backgroundColor: Colors.lightBlue,

}

const actionButtonText = {
  color: Colors.white,
  fontSize: RFValue( 13 ),
  fontFamily: Fonts.FiraSansMedium,
}


const ButtonStyles = StyleSheet.create( {
  actionButton,
  miniNavButton,
  primaryActionButton,
  disabledPrimaryActionButton,
  floatingActionButton: {
    ...primaryActionButton,
    minWidth: 48,
    minHeight: 48,
    paddingHorizontal: 16,
    shadowOpacity: 0.16,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 6,
    // elevation: 5,
  },

  actionButtonText,
  miniNavButtonText,

  floatingActionButtonText: {
    ...actionButtonText,
    fontSize: RFValue( 12 ),
  },
} )

export default ButtonStyles
