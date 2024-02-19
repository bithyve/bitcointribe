import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native'
import Fonts from '../../common/Fonts'
import NavStyles from '../../common/Styles/NavStyles'
import CommonStyles from '../../common/Styles/Styles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import CopyThisText from '../../components/CopyThisText'
import Colors from '../../common/Colors'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch, useSelector } from 'react-redux'
import { RFValue } from 'react-native-responsive-fontsize'
import DeviceInfo from 'react-native-device-info'
import BottomSheet from 'reanimated-bottom-sheet'
import ErrorModalContents from '../../components/ErrorModalContents'
import ModalHeader from '../../components/ModalHeader'
import QRCode from '../../components/QRCode'
import { Wallet } from '../../bitcoin/utilities/Interface'
import { ErrorSending } from '../../store/actions/BHR'


const SecureScan = props => {
  const [ ErrorBottomSheet, setErrorBottomSheet ] = useState( React.createRef() )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const isErrorSendingFailed = useSelector( state => state.bhr.errorSending )
  // console.log('isErrorSendingFailed', isErrorSendingFailed);
  const getServiceType = props.route.params?.getServiceType
    ? props.route.params?.getServiceType
    : null
  const carouselIndex = props.route.params?.carouselIndex
    ? props.route.params?.carouselIndex
    : null
  const serviceType = props.route.params?.serviceType
  const { DECENTRALIZED_BACKUP } = useSelector(
    state => state.storage.database,
  )
  const wallet: Wallet = useSelector(
    state => state.storage.wallet,
  )
  const { loading } = useSelector( state => state.bhr )
  const [ selectedStatus, setSelectedStatus ] = useState( 'Ugly' ) // for preserving health of this entity
  const [ secondaryQR, setSecondaryQR ] = useState( '' )
  const { SHARES_TRANSFER_DETAILS } = DECENTRALIZED_BACKUP
  SHARES_TRANSFER_DETAILS[ 0 ] && !secondaryQR
    ? setSecondaryQR(
      JSON.stringify( {
        ...SHARES_TRANSFER_DETAILS[ 0 ],
        type: 'secondaryDeviceQR',
      } ),
    )
    : null

  const deepLink = SHARES_TRANSFER_DETAILS[ 0 ]
    ? `https://hexawallet.io/app/${wallet.walletName}/sss/ek/` +
    SHARES_TRANSFER_DETAILS[ 0 ].ENCRYPTED_KEY
    : ''
  const dispatch = useDispatch()

  // useEffect( () => {
  //   if ( !secondaryQR ) {
  // sss file removed
  //     dispatch( uploadEncMShare( 0 ) )
  //   }
  // }, [] )

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

  if ( isErrorSendingFailed ) {
    setTimeout( () => {
      setErrorMessageHeader( 'Error sending Recovery Key' )
      setErrorMessage(
        'There was an error while sending your Recovery Key, please try again in a little while',
      )
    }, 2 );
    ( ErrorBottomSheet as any ).current.snapTo( 1 )
    dispatch( ErrorSending( null ) )
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            if ( getServiceType ) {
              getServiceType( serviceType, carouselIndex )
            }
            props.navigation.goBack()
          }}
          hitSlop={{
            top: 20, left: 20, bottom: 20, right: 20
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.homepageButtonColor} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={NavStyles.modalHeaderTitleView}>
        <View style={{
          marginTop: hp( '1%' )
        }}>
          <Text style={NavStyles.modalHeaderTitleText}>
            Activate Secure Account
          </Text>
          <Text style={NavStyles.modalHeaderInfoText}>
            Please scan the following QR on your authenticator app like Google
            Authenticator
          </Text>
          <Text style={NavStyles.modalHeaderInfoText}>
            The authenticator app should be{'\n'}installed on a different device
          </Text>
        </View>
      </View>
      <View style={NavStyles.modalContentView}>
        {loading.uploadMetaShare || !secondaryQR ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <QRCode value={secondaryQR} size={hp( '27%' )} />
        )}
        {deepLink ? <CopyThisText text={deepLink} /> : null}
      </View>
      <View style={{
        margin: 20
      }}>
        <View style={{
          flexDirection: 'row', marginTop: 20, marginBottom: 20
        }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate( 'GoogleAuthenticatorOTP' )
            }}
            style={{
              height: wp( '13%' ),
              width: wp( '40%' ),
              backgroundColor: Colors.blue,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              elevation: 10,
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: {
                width: 15, height: 15
              },
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue( 13 ),
                fontFamily: Fonts.Medium,
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack()
            }}
            style={{
              height: wp( '13%' ),
              width: wp( '30%' ),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue( 13 ),
                fontFamily: Fonts.Medium,
              }}
            >
              Activate Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  loader: {
    height: hp( '27%' ), justifyContent: 'center'
  },
} )

export default SecureScan
