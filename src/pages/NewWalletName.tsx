import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  InteractionManager,
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Fonts from '../common/Fonts'
import Colors from '../common/Colors'
import CommonStyles from '../common/Styles/Styles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import DeviceInfo from 'react-native-device-info'
import HeaderTitle from '../components/HeaderTitle'
import BottomInfoBox from '../components/BottomInfoBox'
import Entypo from 'react-native-vector-icons/Entypo'
import { updateCloudPermission } from '../store/actions/health'
import useInitialDBHydrationState from '../utils/hooks/state-selectors/storage/useInitialDBHydrationState'
import { initializeDBHydration } from '../store/actions/storage'

export default function NewWalletName( props ) {
  const [ walletName, setWalletName ] = useState( '' )
  const [ inputStyle, setInputStyle ] = useState( styles.inputBox )
  const [ doCloudBackup, setDoCloudBackup ] = useState( true )
  const [ cloud ] = useState( Platform.OS == 'ios' ? 'iCloud' : 'Google Drive' )
  const dispatch = useDispatch()
  const isDBHydrated = useInitialDBHydrationState()
  useEffect( ()=>{
    InteractionManager.runAfterInteractions( () => {
      if( !isDBHydrated ){
        dispatch( initializeDBHydration() )
      }
    } )

  }, [] )

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{
        flex: 1
      }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.navigate( 'WalletInitialization' )
            }}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </View>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
          style={{
            flex: 1
          }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <ScrollView>
            <HeaderTitle
              firstLineTitle={'New Hexa Wallet'}
              secondLineTitle={''}
              infoTextNormal={'Please enter a '}
              infoTextBold={'display name.'}
              infoTextNormal1={'Your contacts will see this'}
            />
            <TextInput
              style={inputStyle}
              placeholder={'Enter display name'}
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
              marginLeft: 20,
            }}>
              <Text style={{
                fontSize: RFValue( 12 ),
                fontFamily: Fonts.FiraSansRegular, color: Colors.textColorGrey,
              }}>
                  No numbers or special characters allowed</Text>
            </View>
            <TouchableOpacity
              style={styles.doCloudBackupField}
              onPress={() => setDoCloudBackup( !doCloudBackup )}
              activeOpacity={1}
            >
              <View style={styles.doCloudBackupFieldContentContainer}>
                <Text style={{
                  ...styles.smallInfoLabelText, fontSize: RFValue( 12 )
                }}>
              Secure my backup on my {cloud}
                </Text>
                <View style={styles.checkbox}>
                  {doCloudBackup && (
                    <Entypo
                      name="check"
                      size={RFValue( 20 )}
                      color={Colors.green}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.bottomButtonView}>
            {walletName.trim() != '' ? (
              <View
                style={{
                  elevation: 10,
                  shadowColor: Colors.shadowBlue,
                  shadowOpacity: 1,
                  shadowOffset: {
                    width: 15, height: 15
                  },
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    dispatch( updateCloudPermission( doCloudBackup ) )
                    props.navigation.navigate( 'NewWalletQuestion', {
                      walletName,
                    } )
                  }}
                  style={styles.buttonView}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <View style={styles.statusIndicatorView}>
              <View style={styles.statusIndicatorActiveView} />
              <View style={styles.statusIndicatorInactiveView} />
            </View>
          </View>

          {walletName.trim() == '' ? (
            <View style={{
              marginBottom: DeviceInfo.hasNotch ? hp( '3%' ) : 0
            }}>
              <BottomInfoBox
                title={'We do not store this'}
                infoText={
                  'This is used during your communication with your contacts'
                }
              />
            </View>
          ) : null}
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
    fontFamily: Fonts.FiraSansRegular,
  },
  labelStyle: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 15,
    fontFamily: Fonts.FiraSansRegular,
  },
  inputBox: {
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: hp( '5%' ),
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: 20,
  },
  inputBoxFocused: {
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: hp( '5%' ),
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
    backgroundColor: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: 20,
  },
  bottomNoteText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    marginBottom: 5,
    fontFamily: Fonts.FiraSansRegular,
  },
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  buttonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  bottomButtonView: {
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: DeviceInfo.hasNotch() ? 70 : 40,
    paddingTop: 30,
    alignItems: 'center',
  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
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
    fontFamily: Fonts.FiraSansRegular,
  },
} )
