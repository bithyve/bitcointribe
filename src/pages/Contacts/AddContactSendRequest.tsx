import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Image,
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
import BottomInfoBox from '../../components/BottomInfoBox'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import SendViaLink from '../../components/SendViaLink'
import { nameToInitials, isEmpty } from '../../common/CommonFunctions'
import SendViaQR from '../../components/SendViaQR'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import {
  updateTrustedContactsInfoLocally,
} from '../../store/actions/trustedContacts'
import config from '../../bitcoin/HexaConfig'
import ModalHeader from '../../components/ModalHeader'
import TimerModalContents from './TimerModalContents'
import {
  REGULAR_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import ShareOtpWithTrustedContact from '../ManageBackup/ShareOtpWithTrustedContact'
import { addNewSecondarySubAccount } from '../../store/actions/accounts'
import AccountShell from '../../common/data/models/AccountShell'
import TrustedContactsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TrustedContactsSubAccountInfo'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import ShareOtpWithContact from '../ManageBackup/ShareOTPWithContact'
import { ContactDetails, ContactInfo } from '../../bitcoin/utilities/Interface'

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

  const updateEphemeralChannelLoader = useSelector(
    ( state ) => state.trustedContacts.loading.updateEphemeralChannel,
  )

  const updateTrustedContactsInfo = async ( contact ) => {
    const tcInfo = trustedContactsInfo ? trustedContactsInfo : []
    if ( tcInfo && tcInfo.length ) {
      if (
        tcInfo.findIndex( ( trustedContact ) => {
          if ( !trustedContact ) return false

          const presentContactName = `${trustedContact.firstName} ${
            trustedContact.lastName ? trustedContact.lastName : ''
          }`
            .toLowerCase()
            .trim()

          const selectedContactName = `${contact.firstName} ${
            contact.lastName ? contact.lastName : ''
          }`
            .toLowerCase()
            .trim()

          return presentContactName == selectedContactName
        } ) == -1
      ) {
        tcInfo.push( contact )
      }
    } else {
      tcInfo[ 0 ] = null // securing initial 3 positions for Guardians
      tcInfo[ 1 ] = null
      tcInfo[ 2 ] = null
      tcInfo[ 3 ] = contact
    }

    dispatch( updateTrustedContactsInfoLocally( tcInfo ) )
  }

  const dispatch = useDispatch()

  const createTrustedContact = useCallback( async () => {
    if ( !Contact ) return
    const contactName = Contact.name
    let info = ''
    if ( Contact.phoneNumbers && Contact.phoneNumbers.length ) {
      const phoneNumber = Contact.phoneNumbers[ 0 ].number
      let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
      number = number.slice( number.length - 10 ) // last 10 digits only
      info = number
    } else if ( Contact.emails && Contact.emails.length ) {
      info = Contact.emails[ 0 ].email
    }

    const contactDetails: ContactDetails = {
      id: Contact.id,
      contactName,
      info: info? info.trim(): info,
      image: Contact.imageAvailable? Contact.image: null
    }
    const contactInfo: ContactInfo = {
      contactDetails,
    }

    let parentShell: AccountShell
    accountShells.forEach( ( shell: AccountShell ) => {
      if( !shell.primarySubAccount.instanceNumber ){
        if( shell.primarySubAccount.sourceKind === REGULAR_ACCOUNT ) parentShell = shell
      }
    } )
    const newSecondarySubAccount = new TrustedContactsSubAccountInfo( {
      accountShellID: parentShell.id,
      isTFAEnabled: parentShell.primarySubAccount.sourceKind === SourceAccountKind.SECURE_ACCOUNT? true: false,
    } )

    dispatch(
      addNewSecondarySubAccount( newSecondarySubAccount, parentShell, contactInfo ),
    )
  }, [ Contact ] )

  useEffect( () => {
    if ( updateEphemeralChannelLoader ) {
      if ( trustedLink ) setTrustedLink( '' )
      if ( trustedQR ) setTrustedQR( '' )
      return
    }

    if ( !Contact ) {
      console.log( 'Err: Contact missing' )
      return
    }
    console.log( {
      Contact
    } )

    const contactName = `${Contact.firstName} ${
      Contact.lastName ? Contact.lastName : ''
    }`
      .toLowerCase()
      .trim()
    const trustedContact = trustedContacts.tc.trustedContacts[ contactName ]

    if ( trustedContact ) {
      if ( !trustedContact.ephemeralChannel ) {
        console.log(
          'Err: Ephemeral Channel does not exists for contact: ',
          contactName,
        )
        return
      }

      const { publicKey, otp } = trustedContacts.tc.trustedContacts[
        contactName
      ]
      const requester = WALLET_SETUP.walletName
      const appVersion = DeviceInfo.getVersion()
      if ( !trustedLink ) {
        if ( Contact.phoneNumbers && Contact.phoneNumbers.length ) {
          const phoneNumber = Contact.phoneNumbers[ 0 ].number
          let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
          number = number.slice( number.length - 10 ) // last 10 digits only
          const numHintType = 'num'
          const numHint = number[ 0 ] + number.slice( number.length - 2 )
          const numberEncPubKey = TrustedContactsService.encryptPub(
            publicKey,
            number,
          ).encryptedPub
          const numberDL =
            `https://hexawallet.io/${config.APP_STAGE}/tc` +
            `/${requester}` +
            `/${numberEncPubKey}` +
            `/${numHintType}` +
            `/${numHint}` +
            `/${trustedContact.ephemeralChannel.initiatedAt}` +
            `/v${appVersion}`
          setIsOTPType( false )
          setTrustedLink( numberDL )
        } else if ( Contact.emails && Contact.emails.length ) {
          const email = Contact.emails[ 0 ].email
          const emailHintType = 'eml'
          const trucatedEmail = email.replace( '.com', '' )
          const emailHint =
            email[ 0 ] + trucatedEmail.slice( trucatedEmail.length - 2 )
          const emailEncPubKey = TrustedContactsService.encryptPub(
            publicKey,
            email,
          ).encryptedPub
          const emailDL =
            `https://hexawallet.io/${config.APP_STAGE}/tc` +
            `/${requester}` +
            `/${emailEncPubKey}` +
            `/${emailHintType}` +
            `/${emailHint}` +
            `/${trustedContact.ephemeralChannel.initiatedAt}` +
            `/v${appVersion}`
          setIsOTPType( false )
          setTrustedLink( emailDL )
        } else if ( otp ) {
          const otpHintType = 'otp'
          const otpHint = 'xxx'
          const otpEncPubKey = TrustedContactsService.encryptPub( publicKey, otp )
            .encryptedPub
          const otpDL =
            `https://hexawallet.io/${config.APP_STAGE}/tc` +
            `/${requester}` +
            `/${otpEncPubKey}` +
            `/${otpHintType}` +
            `/${otpHint}` +
            `/${trustedContact.ephemeralChannel.initiatedAt}` +
            `/v${appVersion}`
          setIsOTPType( true )
          setOTP( otp )
          setTrustedLink( otpDL )
        } else {
          Alert.alert( 'Invalid Contact', 'Something went wrong.' )
          return
        }
        updateTrustedContactsInfo( Contact ) // Contact initialized to become TC
      }

      if ( !trustedQR ) {
        let info = ''
        if ( Contact.phoneNumbers && Contact.phoneNumbers.length ) {
          const phoneNumber = Contact.phoneNumbers[ 0 ].number
          let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
          number = number.slice( number.length - 10 ) // last 10 digits only
          info = number
        } else if ( Contact.emails && Contact.emails.length ) {
          info = Contact.emails[ 0 ].email
        } else if ( otp ) {
          info = otp
        }

        setTrustedQR(
          JSON.stringify( {
            requester: WALLET_SETUP.walletName,
            publicKey,
            info: info.trim(),
            uploadedAt: trustedContact.ephemeralChannel.initiatedAt,
            type: 'trustedContactQR',
            ver: appVersion,
          } ),
        )
        // setTimeout( () => {
        //   ( ContactRequestBottomSheet as any ).current.snapTo( 1 )
        // }, 2 )

      } else {
        // setTimeout( () => {
        //   ( ContactRequestBottomSheet as any ).current.snapTo( 1 )
        // }, 2 )
      }

    } else {
      createTrustedContact()
    }
  }, [ Contact, trustedContacts, updateEphemeralChannelLoader ] )

  const openTimer = async () => {
    setTimeout( () => {
      setRenderTimer( true )
    }, 2 )
    const TCRequestTimer = JSON.parse(
      await AsyncStorage.getItem( 'TCRequestTimer' ),
    );
    ( SendViaLinkBottomSheet as any ).current.snapTo( 0 )
    if ( !TCRequestTimer ) {
      ( TimerModalBottomSheet as any ).current.snapTo( 1 )
    }
  }

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
              openTimer()
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
          openTimer()
        }}
        onPressShare={() => {
          setTimeout( () => {
            setRenderTimer( true )
          }, 2 )
          if ( isOTPType ) {
            shareOtpWithTrustedContactBottomSheet.current.snapTo( 1 )
          } else {
            openTimer()
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
          openTimer()
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
                createTrustedContact()
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
            openTimer()
          }}
          onPressShare={() => {
            setTimeout( () => {
              setRenderTimer( true )
            }, 2 )
            if ( isOTPType ) {
              shareOtpWithTrustedContactBottomSheet.current.snapTo( 1 )
            } else {
              openTimer()
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
