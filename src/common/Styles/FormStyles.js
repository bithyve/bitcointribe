import { StyleSheet } from 'react-native'
import Colors from '../Colors'
import Fonts from '../Fonts'
import { RFValue } from 'react-native-responsive-fontsize'

const FormStyles = StyleSheet.create( {
  inputContainer: {
    borderBottomColor: Colors.grayScale1,
  },

  textInputContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
  },

  textAreaInputContainer: {
    height: 100,
  },

  inputText: {
    flex: 1,
    paddingHorizontal: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 13 ),
    textAlign: 'left',
  },

  placeholderText: {
    color: '#BCB6B6',
  },

  errorText: {
    fontFamily: Fonts.MediumItalic,
    color: Colors.red,
    fontSize: RFValue( 11 ),
  },

  hintText: {
    fontFamily: Fonts.Italic,
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
  },
} )


export default FormStyles
