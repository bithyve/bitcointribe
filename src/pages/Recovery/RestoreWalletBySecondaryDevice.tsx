import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Fonts from '../../common/Fonts'
import Colors from '../../common/Colors'
import CommonStyles from '../../common/Styles/Styles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import HeaderTitle from '../../components/HeaderTitle'
import BottomInfoBox from '../../components/BottomInfoBox'
import { useDispatch, useSelector } from 'react-redux'
import {
  ErrorReceiving,
} from '../../store/actions/BHR'
import Toast from '../../components/Toast'
import ErrorModalContents from '../../components/ErrorModalContents'
import ModalHeader from '../../components/ModalHeader'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import QRCode from '../../components/QRCode'
import config from '../../bitcoin/HexaConfig'
import { Wallet } from '../../bitcoin/utilities/Interface'
import CopyThisText from '../../components/CopyThisText'

export default function RestoreWalletBySecondaryDevice( props ) {
  const [ secondaryQR, setSecondaryQR ] = useState( '' )
  const [ ErrorBottomSheet ] = useState( React.createRef() )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const isErrorReceivingFailed = useSelector(
    ( state ) => state.bhr.errorReceiving,
  )
  const { DECENTRALIZED_BACKUP } = useSelector(
    ( state ) => state.storage.database,
  )
  const wallet: Wallet = useSelector(
    ( state ) => state.storage.wallet,
  )
  const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP

  const { REQUEST_DETAILS, META_SHARE } = RECOVERY_SHARES[ 0 ]
    ? RECOVERY_SHARES[ 0 ]
    : {
      REQUEST_DETAILS: null, META_SHARE: null
    }

  REQUEST_DETAILS && !secondaryQR
    ? setSecondaryQR(
      JSON.stringify( {
        ...REQUEST_DETAILS,
        requester: wallet.walletName,
        type: 'recoveryQR',
        ver: DeviceInfo.getVersion(),
      } ),
    )
    : null
  secondaryQR ? console.log( secondaryQR ) : null

  const dispatch = useDispatch()
  useEffect( () => {
    // Removed sss file
    // if ( !REQUEST_DETAILS ) dispatch( requestShare( 0 ) )
  }, [] )

  if ( META_SHARE ) {
    Toast( 'Received' )
  }
  if ( isErrorReceivingFailed ) {
    setTimeout( () => {
      setErrorMessageHeader( 'Error receiving Recovery key' )
      setErrorMessage(
        'There was an error while receiving your Recovery Key, please try again',
      )
    }, 2 );
    ( ErrorBottomSheet as any ).current.snapTo( 1 )
    dispatch( ErrorReceiving( null ) )
  }

  const getQrCodeData = useCallback( ( qrData ) => {
    try {
      const scannedData = JSON.parse( qrData )
      switch ( scannedData.type ) {
          case 'ReverseRecoveryQR':
            const recoveryRequest = {
              requester: scannedData.requester,
              publicKey: scannedData.publicKey,
              uploadedAt: scannedData.UPLOADED_AT,
              isQR: true,
            }

            if (
              Date.now() - recoveryRequest.uploadedAt >
            config.TC_REQUEST_EXPIRY
            ) {
              Alert.alert(
                `${recoveryRequest.isQR ? 'QR' : 'Link'} expired!`,
                `Please ask your Guardian to initiate a new ${
                  recoveryRequest.isQR ? 'QR' : 'Link'
                }`,
              )
            }

            // downloadSecret(index, recoveryRequest.publicKey);
            // Removed sss file
            // dispatch(
            //   downloadMShare( recoveryRequest.publicKey, null, 'recovery', 0 ),
            // )

            setTimeout( () => {
              props.navigation.navigate( 'RestoreSelectedContactsList' )
            }, 1000 )
            break

          default:
            break
      }
    } catch ( err ) {
      Toast( 'Invalid QR' )
    }
  }, [] )

  const renderErrorModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          ( ErrorBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ errorMessage, errorMessageHeader ] )

  const renderErrorModalHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( ErrorBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
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
              props.navigation.goBack()
            }}
            hitSlop={{
              top: 20, left: 20, bottom: 20, right: 20
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
          <View style={{
            marginBottom: 22
          }}>
            <HeaderTitle
              firstLineTitle={'Recover wallet using'}
              secondLineTitle={'Keeper Device'}
              infoTextNormal={
                'Use the Recovery Key stored in your Keeper device. '
              }
              infoTextBold={'you will need to have the other device with you'}
            />
          </View>

          <View
            style={{
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            {!secondaryQR ? (
              <ActivityIndicator size="large" />
            ) : (
              <QRCode title="Recovery key" value={secondaryQR} size={hp( '27%' )} />
            )}
          </View>
          {secondaryQR?<CopyThisText
            backgroundColor={Colors.backgroundColor}
            text={secondaryQR}
            width={'20%'}
            height={'15%'}
          /> : null}

          {REQUEST_DETAILS ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp( '3%' ),
                marginBottom: hp( '3%' ),
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  // Removed this method
                  // dispatch(
                  //   downloadMShare( REQUEST_DETAILS.KEY, null, 'recovery' ),
                  // )
                  props.navigation.goBack()
                }}
                disabled={!!META_SHARE}
                style={{
                  backgroundColor: META_SHARE
                    ? Colors.lightBlue
                    : Colors.blue,
                  borderRadius: 10,
                  width: wp( '50%' ),
                  height: wp( '13%' ),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: Colors.white,
                    fontSize: RFValue( 13 ),
                    fontFamily: Fonts.FiraSansMedium,
                  }}
                >
                  Yes, I have scanned
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate( 'QRScanner', {
                    onCodeScanned: getQrCodeData,
                  } )
                }}
                disabled={!!META_SHARE}
                style={{
                  backgroundColor: META_SHARE
                    ? Colors.lightBlue
                    : Colors.blue,
                  borderRadius: 10,
                  marginTop: 10,
                  width: wp( '50%' ),
                  height: wp( '13%' ),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: Colors.white,
                    fontSize: RFValue( 13 ),
                    fontFamily: Fonts.FiraSansMedium,
                  }}
                >
                  Scan
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </KeyboardAvoidingView>

        <BottomInfoBox
          title={'Note'}
          infoText={
            'Once you have scanned and accepted the request, press continue button'
          }
        />

        <BottomSheet
          enabledInnerScrolling={true}
          ref={ErrorBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '35%' )
              : hp( '40%' ),
          ]}
          renderContent={renderErrorModalContent}
          renderHeader={renderErrorModalHeader}
        />
      </View>
    </SafeAreaView>
  )
}


