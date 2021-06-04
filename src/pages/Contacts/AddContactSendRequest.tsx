import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDispatch, useSelector } from 'react-redux'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import NavStyles from '../../common/Styles/NavStyles'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import SendViaLink from '../../components/SendViaLink'
import { isEmpty } from '../../common/CommonFunctions'
import SendViaQR from '../../components/SendViaQR'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import config from '../../bitcoin/HexaConfig'
import ModalHeader from '../../components/ModalHeader'
import TimerModalContents from './TimerModalContents'
import AccountShell from '../../common/data/models/AccountShell'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import ShareOtpWithContact from '../ManageBackup/ShareOTPWithContact'
import { QRCodeTypes, TrustedContact, Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import { initializeTrustedContact, InitTrustedContactFlowKind } from '../../store/actions/trustedContacts'

export default function AddContactSendRequest( props ) {
  const [ isOTPType, setIsOTPType ] = useState( false )
  const [
    shareOtpWithTrustedContactBottomSheet,
  ] = useState( React.createRef<BottomSheet>() )
  const [ OTP, setOTP ] = useState( '' )
  const [ SendViaLinkBottomSheet ] = useState(
    React.createRef(),
  )
  const [ SendViaQRBottomSheet ] = useState(
    React.createRef(),
  )
  const [ ContactRequestBottomSheet ] = useState(
    React.createRef(),
  )
  const [ TimerModalBottomSheet ] = useState(
    React.createRef(),
  )
  const [ renderTimer, setRenderTimer ] = useState( false )

  const [ trustedLink, setTrustedLink ] = useState( '' )
  const [ trustedQR, setTrustedQR ] = useState( '' )
  const trustedContactsInfo = useSelector(
    ( state ) => state.trustedContacts.trustedContactsInfo,
  )
  const accountShells: AccountShell[] = useSelector(
    ( state ) => state.accounts.accountShells,
  )

  const SelectedContact = props.navigation.getParam( 'SelectedContact' )
    ? props.navigation.getParam( 'SelectedContact' )
    : []

  const [ Contact ] = useState(
    SelectedContact ? SelectedContact[ 0 ] : {
    },
  )

  const WALLET_SETUP = useSelector(
    ( state ) => state.storage.database.WALLET_SETUP,
  )
  const trustedContacts: TrustedContactsService = useSelector(
    ( state ) => state.trustedContacts.service,
  )
  const dispatch = useDispatch()

  const createTrustedContact = useCallback( async () => {
    const contacts: Trusted_Contacts = trustedContacts.tc.trustedContacts
    for( const contact of Object.values( contacts ) ){
      if ( contact.contactDetails.id === Contact.id ) return
    }
    dispatch( initializeTrustedContact( {
      contact: Contact,
      flowKind: InitTrustedContactFlowKind.SETUP_TRUSTED_CONTACT
    } ) )
  }, [ Contact ] )

  useEffect( ()=> {
    if ( !Contact ) return
    createTrustedContact()
    if( trustedLink || trustedQR ){
      setTrustedLink( '' )
      setTrustedQR( '' )
    }
  }, [ Contact ] )

  useEffect( () => {
    if( !Contact ) return

    const contacts: Trusted_Contacts = trustedContacts.tc.trustedContacts
    let currentContact: TrustedContact
    let channelKey: string

    if( contacts )
      for( const ck of Object.keys( contacts ) ){
        if ( contacts[ ck ].contactDetails.id === Contact.id ){
          currentContact = contacts[ ck ]
          channelKey = ck
          break
        }
      }

    if ( currentContact ) {
      const { secondaryChannelKey } = currentContact
      const appVersion = DeviceInfo.getVersion()

      // const numberDL =
      //   `https://hexawallet.io/${config.APP_STAGE}/${
      //     'tcg'
      //   }` +
      //   `/${channelKey}` +
      //   `${secondaryChannelKey? `/${secondaryChannelKey}`: ''}` +
      //   `/v${appVersion}`
      // setTrustedLink( numberDL )

      setTrustedQR(
        JSON.stringify( {
          type: QRCodeTypes.CONTACT_REQUEST,
          channelKey,
          walletName: WALLET_SETUP.walletName,
          secondaryChannelKey,
          version: appVersion,
        } )
      )
    }

  }, [ Contact, trustedContacts ] )

  // const openTimer = async () => {
  //   setTimeout( () => {
  //     setRenderTimer( true )
  //   }, 2 )
  //   const TCRequestTimer = JSON.parse(
  //     await AsyncStorage.getItem( 'TCRequestTimer' ),
  //   );
  //   ( SendViaLinkBottomSheet as any ).current.snapTo( 0 )
  //   if ( !TCRequestTimer ) {
  //     ( TimerModalBottomSheet as any ).current.snapTo( 1 )
  //   }
  // }

  const renderSendViaLinkContents = useCallback( () => {
    if ( !isEmpty( Contact ) ) {
      return (
        <SendViaLink
          isFromReceive={true}
          headerText={'Share'}
          subHeaderText={'Send to your contact'}
          contactText={'Adding to Friends and Family:'}
          contact={Contact ? Contact : null}
          infoText={`Click here to accept contact request from ${
            WALLET_SETUP.walletName
          }' Hexa wallet - link will expire in ${
            config.TC_REQUEST_EXPIRY / ( 60000 * 60 )
          } hours`}
          link={trustedLink}
          contactEmail={''}
          onPressBack={() => {
            if ( SendViaLinkBottomSheet.current )
              ( SendViaLinkBottomSheet as any ).current.snapTo( 0 )
          }}
          onPressDone={async () => {
            setTimeout( () => {
              setRenderTimer( true )
            }, 2 )
            if ( isOTPType ) {
              shareOtpWithTrustedContactBottomSheet.current.snapTo( 1 )
            } else {
              // openTimer()
            }
            ( SendViaLinkBottomSheet as any ).current.snapTo( 0 )
          }}
        />
      )
    }
  }, [ Contact, trustedLink ] )

  const renderSendViaLinkHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   if (SendViaLinkBottomSheet.current)
      //     (SendViaLinkBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )


  const renderContactRequest = useCallback( () => {
    return (
      <RequestKeyFromContact
        isFromReceive={true}
        headerText={'Friends and Family Request'}
        subHeaderText={'Scan the QR from your Contact\'s Hexa Wallet'}
        contactText={'Adding to Friends and Family:'}
        contact={Contact}
        QR={trustedQR}
        link={trustedLink}
        contactEmail={''}
        onPressBack={() => {
          if ( ContactRequestBottomSheet.current )
            ( ContactRequestBottomSheet as any ).current.snapTo( 0 )
          props.navigation.goBack()
        }}
        onPressDone={() => {
          ( ContactRequestBottomSheet as any ).current.snapTo( 0 )
          // openTimer()
        }}
        onPressShare={() => {
          setTimeout( () => {
            setRenderTimer( true )
          }, 2 )
          if ( isOTPType ) {
            shareOtpWithTrustedContactBottomSheet.current.snapTo( 1 )
          } else {
            // openTimer()
          }
          ( ContactRequestBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [ Contact, trustedQR ] )

  const renderSendViaQRContents = useCallback( () => {
    return (
      <SendViaQR
        isFromReceive={true}
        headerText={'Friends and Family Request'}
        subHeaderText={'Scan the QR from your Contact\'s Hexa Wallet'}
        contactText={'Adding to Friends and Family:'}
        contact={Contact}
        QR={trustedQR}
        contactEmail={''}
        onPressBack={() => {
          if ( SendViaQRBottomSheet.current )
            ( SendViaQRBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressDone={() => {
          ( SendViaQRBottomSheet as any ).current.snapTo( 0 )
          // openTimer()
        }}
      />
    )
  }, [ Contact, trustedQR ] )

  const renderTimerModalContents = useCallback( () => {
    return (
      <TimerModalContents
        isOTPType={isOTPType}
        contactText={'Trusted Contact'}
        contact={Contact}
        renderTimer={renderTimer}
        onPressContinue={() => onContinueWithTimer()}
      />
    )
  }, [ renderTimer ] )

  const renderTimerModalHeader = useCallback( () => {
    return (
      <ModalHeader
        // backgroundColor={'transparent'}
      // onPressHeader={() => {
      //   if (TimerModalBottomSheet.current)
      //     (TimerModalBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )
  const renderContactRequestHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   if (SendViaQRBottomSheet.current)
      //     (SendViaQRBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  const onContinueWithTimer = () => {
    ( TimerModalBottomSheet as any ).current.snapTo( 0 )
    props.navigation.goBack()
  }

  const renderSendViaQRHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   if (SendViaQRBottomSheet.current)
      //     (SendViaQRBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  const setPhoneNumber = () => {
    const phoneNumber = Contact.phoneNumbers[ 0 ].number
    let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
    number = number.slice( number.length - 10 ) // last 10 digits only
    return number
  }

  const renderShareOtpWithTrustedContactContent = useCallback( () => {
    return (
      <ShareOtpWithContact
        renderTimer={renderTimer}
        onPressOk={() => {
          setRenderTimer( false )
          shareOtpWithTrustedContactBottomSheet.current.snapTo( 0 )
          props.navigation.goBack()
        }}
        onPressBack={() => {
          shareOtpWithTrustedContactBottomSheet.current.snapTo( 0 )
        }}
        OTP={OTP}
      />
    )
  }, [ OTP, renderTimer ] )

  const renderShareOtpWithTrustedContactHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          shareOtpWithTrustedContactBottomSheet.current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={NavStyles.modalContainer}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            paddingRight: 10,
            paddingBottom: hp( '1.5%' ),
            paddingTop: hp( '1%' ),
            marginLeft: 10,
            marginRight: 10,
            marginBottom: hp( '1.5%' ),
          }}
        >
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center'
          }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack()
              }}
              hitSlop={{
                top: 20, left: 20, bottom: 20, right: 20
              }}
              style={{
                height: 30, width: 30, justifyContent: 'center'
              }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <View style={{
              flex: 1
            }}>
              <Text
                style={{
                  ...NavStyles.modalHeaderTitleText,
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Add a contact{' '}
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue( 12 ),
                  fontFamily: Fonts.FiraSansRegular,
                  paddingTop: 5,
                }}
              >
                Send a Friends and Family request
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                // createTrustedContact()
                props.navigation.goBack()
              }}
              style={{
                height: wp( '8%' ),
                width: wp( '18%' ),
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.blue,
                justifyContent: 'center',
                borderRadius: 8,
                alignSelf: 'center',
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue( 12 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <RequestKeyFromContact
          isModal={false}
          // headerText={'Request Recovery Secret from trusted contact'}
          // subHeaderText={`Request share from trusted Contact, you can change${'\n'}your trusted contact, or either primary mode of context`}
          contactText={'Adding to Friends and Family:'}
          contact={Contact}
          QR={trustedQR}
          link={trustedLink}
          contactEmail={''}
          onPressBack={() => {
            props.navigation.goBack()
          }}
          onPressDone={() => {
            // openTimer()
          }}
          onPressShare={() => {
            setTimeout( () => {
              setRenderTimer( true )
            }, 2 )
            if ( isOTPType ) {
              shareOtpWithTrustedContactBottomSheet.current.snapTo( 1 )
            } else {
              // openTimer()
            }
          }}
        />
        {/* <View style={{
          marginTop: 'auto'
        }}>
          <View style={{
            marginBottom: hp( '1%' )
          }}>
            <BottomInfoBox
              title={'Friends and Family request'}
              infoText={
                'Your contact will have to accept your request for you to add them'
              }
            />
          </View> */}
        {/* <View
            style={{
              flexDirection: 'row',
              backgroundColor: Colors.blue,
              height: 60,
              borderRadius: 10,
              marginLeft: 25,
              marginRight: 25,
              marginBottom: hp( '4%' ),
              justifyContent: 'space-evenly',
              alignItems: 'center',
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: {
                width: 15, height: 15
              },
            }}
          >
            <TouchableOpacity
              onPress={() => {
                createTrustedContact()
                if ( SendViaLinkBottomSheet.current )
                  ( SendViaLinkBottomSheet as any ).current.snapTo( 1 )
              }}
              style={styles.buttonInnerView}
            >
              <Image
                source={require( '../../assets/images/icons/openlink.png' )}
                style={styles.buttonImage}
              />
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
            <View
              style={{
                width: 1, height: 30, backgroundColor: Colors.white
              }}
            />
            <TouchableOpacity
              style={styles.buttonInnerView}
              onPress={() => {
                createTrustedContact()
                if ( SendViaQRBottomSheet.current )
                  ( SendViaQRBottomSheet as any ).current.snapTo( 1 )
              }}
            >
              <Image
                source={require( '../../assets/images/icons/qr-code.png' )}
                style={styles.buttonImage}
              />
              <Text style={styles.buttonText}>QR</Text>
            </TouchableOpacity>
          </View> */}
        {/* </View> */}
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={SendViaLinkBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '45%' )
              : hp( '46%' ),
          ]}
          renderContent={renderSendViaLinkContents}
          renderHeader={renderSendViaLinkHeader}
        />
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={SendViaQRBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '46%' )
              : hp( '46%' ),
          ]}
          renderContent={renderSendViaQRContents}
          renderHeader={renderSendViaQRHeader}
        />
        {/* <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={ContactRequestBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '86%' )
              : hp( '86%' ),
          ]}
          renderContent={renderContactRequest}
          renderHeader={renderContactRequestHeader}
        /> */}
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={TimerModalBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '50%' )
              : hp( '55%' ),
          ]}
          renderContent={renderTimerModalContents}
          renderHeader={renderTimerModalHeader}
        />
        <BottomSheet
          onCloseEnd={() => {
            if ( SelectedContact.length > 0 ) {
              setRenderTimer( false )
            }
          }}
          enabledInnerScrolling={true}
          ref={shareOtpWithTrustedContactBottomSheet}
          snapPoints={[ -30, hp( '65%' ) ]}
          renderContent={renderShareOtpWithTrustedContactContent}
          renderHeader={renderShareOtpWithTrustedContactHeader}
        />
      </View>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  contactProfileView: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: hp( '1.7%' ),
  },
  contactProfileImage: {
    borderRadius: 60 / 2,
    width: 60,
    height: 60,
    resizeMode: 'cover',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
  },
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp( '30%' ),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
} )
