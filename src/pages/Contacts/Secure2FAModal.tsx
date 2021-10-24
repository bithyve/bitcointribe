import React, { useState, useContext } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StyleSheet,
} from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { DeepLinkEncryptionType } from '../../bitcoin/utilities/Interface'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import CardWithRadioBtn from '../../components/CardWithRadioBtn'
import idx from 'idx'
import * as ExpoContacts from 'expo-contacts'
import BottomInfoBox from '../../components/BottomInfoBox'
import { translations } from '../../common/content/LocContext'

export default function Secure2FA( props ) {
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]

  const [ activeType, setActiveType ] = useState( DeepLinkEncryptionType.NUMBER )
  // const [ contactData, setContactData ] = useState( null )
  const [ phoneNumbers ] = useState( props.Contact?.phoneNumbers ? props.Contact.phoneNumbers : [] )
  const [ emails ] = useState( props.Contact?.emails ? props.Contact.emails : [] )
  return (
    <SafeAreaView style={{
      backgroundColor: Colors.backgroundColor
    }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {props.closeBottomSheet()}}
        style={{
          width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
          alignSelf: 'flex-end',
          backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
          marginTop: wp( 3 ), marginRight: wp( 3 )
        }}
      >
        <FontAwesome name="close" color={Colors.white} size={19} style={{
        // marginTop: hp( 0.5 )
        }} />
      </TouchableOpacity>
      <View style={{
        // alignSelf: 'baseline'
      }}>
        <View style={{
          marginLeft: wp( 6 ),
        }}>
          <Text style={styles.modalTitleText}>{strings.SelectSecond}</Text>
          <Text style={{
            ...styles.modalInfoText,
            marginTop: wp( 1.5 ),
            marginBottom: wp( 3 ),
            marginRight: wp( 13 )
          }}>{strings.select1}</Text>
        </View>
        {phoneNumbers && phoneNumbers.length && phoneNumbers[ 0 ].number ?
          <CardWithRadioBtn
            mainText={strings.ConfirmPhone}
            subText={phoneNumbers[ 0 ].number}
            isSelected={activeType === DeepLinkEncryptionType.NUMBER}
            setActiveIndex={setActiveType}
            index={DeepLinkEncryptionType.NUMBER}
            geticon={''}
            italicText={''}
            changeBgColor={true}
          />
          : null}
        {emails && emails.length && emails[ 0 ].email ?
          <CardWithRadioBtn
            mainText={strings.ConfirmEmail}
            subText={emails[ 0 ].email}
            isSelected={activeType === DeepLinkEncryptionType.EMAIL}
            setActiveIndex={setActiveType}
            index={DeepLinkEncryptionType.EMAIL}
            geticon={''}
            italicText={''}
            changeBgColor={true}
          />
          : null }
        <CardWithRadioBtn
          mainText={strings.ConfirmOTP}
          subText={strings.subText}
          isSelected={activeType === DeepLinkEncryptionType.OTP}
          setActiveIndex={setActiveType}
          index={DeepLinkEncryptionType.OTP}
          geticon={''}
          italicText={''}
          changeBgColor={true}
        />
      </View>
      <BottomInfoBox
        title={common.note}
        infoText={strings.infoText}
        // backgroundColor={Colors.white}
      />
      <View style={{
        marginTop: 0, marginBottom: hp( 2 )
      }}>
        <TouchableOpacity
          onPress={() => {
            props.onConfirm( activeType )
            //props.navigation.navigate('SettingGetNewPin')
            //PinChangeSuccessBottomSheet.current.snapTo(1);
          }}
          style={{
            ...styles.proceedButtonView,
            backgroundColor:Colors.blue,
          }}
        >
          <Text style={styles.proceedButtonText}>{common.proceed}</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: wp( 8 ),
    marginVertical: wp( 4 ),
    width: '85%'
  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '6%' ),
    marginBottom: hp( 1 ),
    // marginTop: hp( 9 )
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  modalBoldText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansMedium,
    letterSpacing: 0.6,
    lineHeight: 18
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.54
    // width: wp( 30 ),
  },
  modalInfoText: {
    marginRight: wp( 4 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify',
    letterSpacing: 0.6,
    lineHeight: 18
  },
  keyPadRow: {
    flexDirection: 'row',
    height: hp( '8%' ),
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue( 11, 812 ),
    fontStyle: 'italic',
  },
  keyPadElementTouchable: {
    flex: 1,
    height: hp( '8%' ),
    fontSize: RFValue( 18 ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPadElementText: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    fontFamily: Fonts.FiraSansRegular,
    fontStyle: 'normal',
  },
  proceedButtonView: {
    marginLeft: wp( 6 ),
    height: wp( '13%' ),
    width: wp( '30%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    marginBottom: hp( '1%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: 'bold',
    fontSize: RFValue( 13 ),
  },
  textStyles: {
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
  },
  textFocused: {
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
  },
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp( '13%' ),
    width: wp( '13%' ),
    borderRadius: 7,
    marginLeft: wp( 6 ),
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: wp( '13%' ),
    width: wp( '13%' ),
    borderRadius: 7,
    marginLeft: wp( 6 ),
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.35,
    shadowOffset: {
      width: 0, height: 3
    },
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  passcodeTextInputView: {
    flexDirection: 'row',
    marginTop: hp( '1%' ),
    marginBottom: hp( '2%' ),
  },
  boldItalicText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    marginLeft: wp( 6 ),
    marginTop: hp( '10%' ),
    fontFamily: Fonts.FiraSansRegular,
  },
  headerInfoText: {
    marginTop: hp( '2%' ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: wp( 6 ),
    fontFamily: Fonts.FiraSansRegular,
  },
} )
