import React, { useContext, useState } from 'react'
import {
  Keyboard, KeyboardAvoidingView,
  Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { useDispatch } from 'react-redux'
import { AccountType } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import Fonts from '../../common/Fonts'
import HeaderTitle from '../../components/HeaderTitle'
import Toast from '../../components/Toast'
import { goHomeAction } from '../../navigation/actions/NavigationActions'
import { addNewAccountShells } from '../../store/actions/accounts'
import { newAccountsInfo } from '../../store/sagas/accounts'

export enum BottomSheetKind {
  CLOUD_PERMISSION,
}

export enum BottomSheetState {
  Closed,
  Open,
}

export default function NewRGBWallet( props ) {
  const [ walletName, setWalletName ] = useState( '' )
  const [ inputStyle, setInputStyle ] = useState( styles.inputBox )
  const dispatch = useDispatch()
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'login' ]
  const [ loaderModal, setLoaderModal ] = useState( false )

  const createNewRgbAccount = () => {
    const accountsInfo: newAccountsInfo = {
      accountType: AccountType.RGB_ACCOUNT,
      accountDetails: {
        name: walletName,
        description: 'RGB Account',
      }
    }
    dispatch( addNewAccountShells( [ accountsInfo ] ) )
    Toast( 'RGB account created' )
    props.navigation.dispatch( goHomeAction() )

  }

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <View style={{
        flex: 1
      }}>
        <KeyboardAvoidingView
          style={{
            flex: 1
          }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <View style={{
            flex: 1
          }} >
            <HeaderTitle
              navigation={props.navigation}
              backButton={true}
              firstLineTitle={'Step 1 creating RGB wallet'}
              secondLineBoldTitle={strings.NameyourWallet}
              secondLineTitle={''}
              infoTextNormal={''}
              infoTextBold={''}
              infoTextNormal1={''}
              step={''}
            />
            <TextInput
              style={inputStyle}
              placeholder={strings.walletName}
              placeholderTextColor={Colors.borderColor}
              value={walletName}
              keyboardType={
                Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
              }
              maxLength={10}
              onChangeText={( text ) => {
                text = text.replace( /[^A-Za-z]/g, '' )
                setWalletName( text )
              }}
              onFocus={() => {
                setInputStyle( styles.inputBoxFocused )
              }}
              onBlur={() => {
                setInputStyle( styles.inputBox )
              }}
              autoCorrect={false}
              autoCompleteType="off"
            />
            <View style={{
              marginRight: wp( 6 )
            }}>
              <Text style={{
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.Italic, color: Colors.textColorGrey,
                alignSelf: 'flex-end'
              }}>
                {strings.numbers}</Text>
            </View>
          </View>
          {/* </KeyboardAvoidingView> */}
          {/* <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorActiveView} />
            <View style={styles.statusIndicatorInactiveView} />
          </View> */}
          <View style={styles.bottomButtonView}>
            <View>
              <TouchableOpacity
                onPress={() => {
                  setLoaderModal( true )
                  Keyboard.dismiss()
                  createNewRgbAccount()
                }}
              >
                <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
                  start={{
                    x: 0, y: 0
                  }} end={{
                    x: 1, y: 0
                  }}
                  locations={[ 0.2, 1 ]}
                  style={styles.buttonView}
                >
                  <Text style={styles.buttonText}>{strings.Next}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  pageTitle: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    marginLeft: 20,
    marginBottom: 5,
    fontFamily: Fonts.Regular,
  },
  labelStyle: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 15,
    fontFamily: Fonts.Regular,
  },
  inputBox: {
    borderRadius: 10,
    marginTop: hp( '1%' ),
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    marginBottom: hp( 1 ),
    backgroundColor: Colors.backgroundColor1,
  },
  inputBoxFocused: {
    borderRadius: 10,
    marginTop: hp( '1%' ),
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.backgroundColor1,
    fontFamily: Fonts.Regular,
    marginBottom: hp( 1 ),
  },
  bottomNoteText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    marginBottom: 5,
    fontFamily: Fonts.Regular,
  },
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  },
  buttonView: {
    height: wp( '13%' ),
    width: wp( '30%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  bottomButtonView: {
    flexDirection: 'row-reverse',
    paddingHorizontal: hp( 3 ),
    paddingBottom: DeviceInfo.hasNotch() ? hp( 4 ) : hp( 3 ),
    // paddin: hp( 9 ),
    // alignItems: 'flex-end',
    // backgroundColor:'red'
  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    paddingHorizontal: hp( 3 )
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  checkbox: {
    width: wp( '7%' ),
    height: wp( '7%' ),
    borderRadius: 7,
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doCloudBackupField: {
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    marginBottom: 36,
    marginHorizontal: 14,
    paddingHorizontal: 10,
    padding:10,
    marginTop: hp( '5%' ),
  },
  doCloudBackupFieldContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallInfoLabelText: {
    backgroundColor: Colors.backgroundColor,
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  },
} )
