import React, { useCallback, useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import { TextInput } from 'react-native-gesture-handler'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { editTrustedContact } from '../../store/actions/trustedContacts'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import { useDispatch } from 'react-redux'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import HeaderTitle from '../../components/HeaderTitle'
import ButtonBlue from '../../components/ButtonBlue'

export type Props = {
  closeModal: ( name: string ) => void;
  contact: ContactRecipientDescribing
};



const EditContactScreen: React.FC<Props> = ( { closeModal, contact }: Props ) => {
  const [ name, setName ] = useState( '' )
  const [ inputStyle, setInputStyle ] = useState( styles.inputBox )
  const dispatch = useDispatch()

  const editContact = useCallback( async () => {
    dispatch( editTrustedContact( {
      channelKey: contact.channelKey,
      contactName: name,
    } ) )
    closeModal( name )
  }, [ contact, name ] )



  return (
    <View style={{
      // flex: 1
      backgroundColor: Colors.bgColor,
      justifyContent: 'space-between',
    }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => closeModal( '' )}
        style={{
          width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
          alignSelf: 'flex-end',
          backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
          marginTop: wp( 3 ), marginRight: wp( 3 )
        }}
      >
        <FontAwesome name="close" color={Colors.white} size={19} style={{
          // marginTop: hp( 0.5 )
        }} />
      </TouchableOpacity>
      <HeaderTitle
        firstLineTitle={'Edit Name'}
        secondLineTitle={'Enter a name to store against the contact'}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <View style={{
        ...inputStyle
      }}>
        <TextInput
          style={{
            height: 50,
            // margin: 20,
            paddingHorizontal: 15,
            fontSize: RFValue( 13 ),
            letterSpacing: 0.26,
            fontFamily: Fonts.FiraSansRegular,
          }}
          placeholder={'Enter Name'}
          placeholderTextColor={Colors.borderColor}
          value={name}
          textContentType='none'
          autoCompleteType='off'
          autoCorrect={false}
          autoCapitalize="none"
          onKeyPress={event => {
          // setBackspace( event )
          }}
          onFocus={() => setInputStyle( styles.inputBoxFocused )}
          onBlur={() => setInputStyle( styles.inputBox )}
          onChangeText={( text ) => {
            setName( text )
          }}
          onSubmitEditing={
            () => {
            // contact.displayedName = name
            }
          }
        />
      </View>
      <View style={{
        alignItems: 'flex-start', marginLeft: wp( 5 ), marginVertical: hp( 3 )
      }}>
        <ButtonBlue
          buttonText="Save Changes"
          handleButtonPress={() => {editContact()}}
          buttonDisable={name.length === 0}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  inputBox: {
    borderRadius: 10,
    marginHorizontal: wp( 5 ),
    backgroundColor: Colors.white,
    marginBottom: hp( 2 )
  },
  inputBoxFocused: {
    borderRadius: 10,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 10, height: 10
    },
    backgroundColor: Colors.white,
    marginHorizontal: wp( 5 ),
    marginBottom: hp( 2 )
  },
  modalContentContainer: {
    // flex: 1,
    justifyContent: 'space-between',
  },

  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 2,
    backgroundColor: Colors.backgroundColor,
  },

  addModalView: {
    backgroundColor: Colors.white,
    paddingVertical: 4,
    paddingHorizontal: wp( 9 ),
    // flexDirection: 'row',
    // display: 'flex',
    justifyContent: 'space-between',
  },

  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular
  },

  addModalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular
  },

  modalElementInfoView: {
    marginVertical: 10,
    height: heightPercentageToDP( '5%' ),
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
  },

  webLinkBarContainer: {
    flexDirection: 'row',
    elevation: 10,
    shadowColor: '#00000017',
    shadowOpacity: 1,
    shadowRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: 'space-around',
    height: 40,
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 10,
    marginBottom: heightPercentageToDP( 2 ),
    borderRadius: 10,
  },
} )

export default EditContactScreen
