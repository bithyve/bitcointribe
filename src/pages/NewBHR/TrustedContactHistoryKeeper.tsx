import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  AsyncStorage,
  Alert,
  Keyboard,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useSelector } from 'react-redux'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import ErrorModalContents from '../../components/ErrorModalContents'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import ModalHeader from '../../components/ModalHeader'
import HistoryPageComponent from './HistoryPageComponent'
import TrustedContacts from './TrustedContacts'
import ShareOtpWithTrustedContact from './ShareOtpWithTrustedContact'
import moment from 'moment'
import _ from 'underscore'
import { nameToInitials } from '../../common/CommonFunctions'
import {
  uploadEncMShareKeeper,
  ErrorSending,
  updateMSharesHealth,
  updatedKeeperInfo,
  sendApprovalRequest,
  onApprovalStatusChange,
  uploadSMShareKeeper,
} from '../../store/actions/health'
import { useDispatch } from 'react-redux'
import SendShareModal from './SendShareModal'
import SendViaLink from '../../components/SendViaLink'
import SendViaQR from '../../components/SendViaQR'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import {
  EphemeralDataElements,
  LevelHealthInterface,
  notificationType,
  TrustedContactDerivativeAccountElements,
} from '../../bitcoin/utilities/Interface'
import config from '../../bitcoin/HexaConfig'
import {
  updateEphemeralChannel,
  updateTrustedContactsInfoLocally,
} from '../../store/actions/trustedContacts'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import FriendsAndFamilyHelpContents from '../../components/Helper/FriendsAndFamilyHelpContents'
import {
  TRUSTED_CONTACTS,
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import { isEmpty } from '../../common/CommonFunctions/index'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import QRModal from '../Accounts/QRModal'
import { StackActions } from 'react-navigation'
import ApproveSetup from './ApproveSetup'

const TrustedContactHistoryKeeper = ( props ) => {
  const [ ErrorBottomSheet, setErrorBottomSheet ] = useState( React.createRef() )
  const [ HelpBottomSheet, setHelpBottomSheet ] = useState( React.createRef() )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const isErrorSendingFailed = useSelector(
    ( state ) => state.health.errorSending,
  )
  const dispatch = useDispatch()
  const [ ChangeBottomSheet, setChangeBottomSheet ] = useState( React.createRef() )
  const [ changeContact, setChangeContact ] = useState( false )
  const [ ReshareBottomSheet, setReshareBottomSheet ] = useState(
    React.createRef(),
  )
  const [ ConfirmBottomSheet, setConfirmBottomSheet ] = useState(
    React.createRef(),
  )
  const [ OTP, setOTP ] = useState( '' )
  const [ renderTimer, setRenderTimer ] = useState( false )
  const [ chosenContactIndex, setChosenContactIndex ] = useState( 1 )
  const [ chosenContact, setChosenContact ] = useState(
    props.navigation.state.params.selectedContact
      ? props.navigation.state.params.selectedContact
      : null,
  )
  const [ trustedContactsBottomSheet, setTrustedContactsBottomSheet ] = useState(
    React.createRef(),
  )
  const [ SendViaLinkBottomSheet, setSendViaLinkBottomSheet ] = useState(
    React.createRef(),
  )
  const fcmTokenValue = useSelector( ( state ) => state.preferences.fcmTokenValue )
  const [ SendViaQRBottomSheet, setSendViaQRBottomSheet ] = useState(
    React.createRef(),
  )
  const keeperTypeBottomSheet = React.createRef()
  const [ QrBottomSheetsFlag, setQrBottomSheetsFlag ] = useState( false )
  const [ qrScannedData, setQrScannedData ] = useState( '' )
  const [ shareBottomSheet, setshareBottomSheet ] = useState( React.createRef() )
  const [
    shareOtpWithTrustedContactBottomSheet,
    setShareOtpWithTrustedContactBottomSheet,
  ] = useState( React.createRef<BottomSheet>() )
  const [ LoadContacts, setLoadContacts ] = useState( false )
  const [ SelectedContacts, setSelectedContacts ] = useState( [] )
  const { DECENTRALIZED_BACKUP, WALLET_SETUP } = useSelector(
    ( state ) => state.storage.database,
  )
  const { SHARES_TRANSFER_DETAILS } = DECENTRALIZED_BACKUP
  const uploadMetaShare = useSelector(
    ( state ) => state.health.loading.uploadMetaShare,
  )
  const updateEphemeralChannelLoader = useSelector(
    ( state ) => state.trustedContacts.loading.updateEphemeralChannel,
  )
  const updateTrustedChannelLoader = useSelector(
    ( state ) => state.trustedContacts.loading.updateTrustedChannel,
  )
  const trustedContacts: TrustedContactsService = useSelector(
    ( state ) => state.trustedContacts.service,
  )
  const regularAccount: RegularAccount = useSelector(
    ( state ) => state.accounts[ REGULAR_ACCOUNT ].service,
  )
  const testAccount: TestAccount = useSelector(
    ( state ) => state.accounts[ TEST_ACCOUNT ].service,
  )
  const trustedContactsInfo = useSelector(
    ( state ) => state.trustedContacts.trustedContactsInfo,
  )
  const [ isOTPType, setIsOTPType ] = useState( false )
  const [ trustedLink, setTrustedLink ] = useState( '' )
  const [ trustedQR, setTrustedQR ] = useState( '' )
  const [ trustedContactHistory, setTrustedContactHistory ] = useState( [
    {
      id: 1,
      title: 'Recovery Key created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Key in-transit',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Key accessible',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Key not accessible',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
  ] )
  const [ selectedTime, setSelectedTime ] = useState(
    props.navigation.getParam( 'selectedTime' ),
  )
  const [ selectedStatus, setSelectedStatus ] = useState(
    props.navigation.getParam( 'selectedStatus' ),
  )
  const [ selectedTitle, setSelectedTitle ] = useState(
    props.navigation.getParam( 'selectedTitle' ),
  )
  const [ index, setIndex ] = useState( props.navigation.state.params.index )
  const s3Service = useSelector( ( state ) => state.health.service )
  const keeperInfo = useSelector( ( state ) => state.health.keeperInfo )
  const [ selectedLevelId, setSelectedLevelId ] = useState(
    props.navigation.state.params.selectedLevelId,
  )
  const [ selectedKeeper, setSelectedKeeper ] = useState(
    props.navigation.state.params.selectedKeeper,
  )
  const [ isReshare, setIsReshare ] = useState(
    props.navigation.state.params.selectedTitle == 'Friends and Family'
      ? false
      : true,
  )
  const [ selectedShareId, setSelectedShareId ] = useState( props.navigation.state.params.selectedKeeper.shareId ? props.navigation.state.params.selectedKeeper.shareId : '' )
  const levelHealth:LevelHealthInterface[] = useSelector( ( state ) => state.health.levelHealth )
  const currentLevel = useSelector( ( state ) => state.health.currentLevel )
  const [ selectedKeeperType, setSelectedKeeperType ] = useState( '' )
  const [ selectedKeeperName, setSelectedKeeperName ] = useState( '' )
  const keeperApproveStatus = useSelector(
    ( state ) => state.health.keeperApproveStatus
  )
  const [ isChange, setIsChange ] = useState( false )
  const [
    ApprovePrimaryKeeperBottomSheet,
    setApprovePrimaryKeeperBottomSheet,
  ] = useState( React.createRef() )
  useEffect( () => {
    setSelectedLevelId( props.navigation.state.params.selectedLevelId )
    setSelectedKeeper( props.navigation.state.params.selectedKeeper )
    setIsReshare(
      props.navigation.state.params.selectedTitle == 'Friends and Family'
        ? false
        : true,
    )
    setSelectedTime( props.navigation.state.params.selectedTime )
    setSelectedStatus( props.navigation.state.params.selectedStatus )
    setSelectedTitle( props.navigation.state.params.selectedTitle )
    setIndex( props.navigation.state.params.index )
    setChosenContact( props.navigation.state.params.selectedContact )
    const shareId = !props.navigation.state.params.selectedKeeper.shareId && selectedLevelId == 3 ? levelHealth[ 2 ].levelInfo[ 4 ].shareId : props.navigation.state.params.selectedKeeper.shareId ? props.navigation.state.params.selectedKeeper.shareId : ''
    setSelectedShareId( shareId )
    setIsChange(
      props.navigation.state.params.isChangeKeeperType
        ? props.navigation.state.params.isChangeKeeperType
        : false
    )
  }, [
    props.navigation.state.params.selectedLevelId,
    props.navigation.state.params.selectedKeeper,
    props.navigation.state.params.selectedStatus,
  ] )

  useEffect( () => {
    if ( isChange ) {
      setTimeout( () => {
        setLoadContacts( true )
      }, 2 );
      ( trustedContactsBottomSheet as any ).current.snapTo( 1 )
    }
  }, [ isChange ] )

  useEffect( () => {
    ( async () => {
      const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
      if ( shareHistory ) updateHistory( shareHistory )
      const shareId = !props.navigation.state.params.selectedKeeper.shareId && selectedLevelId == 3 ? levelHealth[ 2 ].levelInfo[ 4 ].shareId : props.navigation.state.params.selectedKeeper.shareId ? props.navigation.state.params.selectedKeeper.shareId : ''
      setSelectedShareId( shareId )
    } )()
    setContactInfo()
  }, [] )

  const setContactInfo = useCallback( async () => {
    const keeperInfoTemp: any[] = [ ...keeperInfo ]
    if ( keeperInfoTemp.length > 0 ) {
      const keeperInfoIndex = keeperInfoTemp.findIndex( ( value ) => value.shareId == selectedShareId )
      if ( keeperInfoIndex > -1 && keeperInfoTemp[ keeperInfoIndex ].type == 'contact' ) {
        setSelectedContacts( [ keeperInfoTemp[ keeperInfoIndex ].data ] )
        const selectedContacts = trustedContactsInfo.slice( 1, 3 )
        const tempContact = keeperInfoTemp[ keeperInfoIndex ].data
        const tcInstance =
          trustedContacts.tc.trustedContacts[
            tempContact.name.toLowerCase().trim()
          ]
        if ( tcInstance )
          tempContact.contactsWalletName = tcInstance.contactsWalletName
        setChosenContact( tempContact )
      }
    }
  }, [ index, keeperInfo ] )

  const getContacts = useCallback(
    async ( selectedContacts ) => {
      setTimeout( () => {
        if ( selectedContacts[ 0 ] ) {
          setSelectedTitle(
            selectedContacts[ 0 ].firstName && selectedContacts[ 0 ].lastName
              ? selectedContacts[ 0 ].firstName +
                  ' ' +
                  selectedContacts[ 0 ].lastName
              : selectedContacts[ 0 ].firstName && !selectedContacts[ 0 ].lastName
                ? selectedContacts[ 0 ].firstName
                : !selectedContacts[ 0 ].firstName && selectedContacts[ 0 ].lastName
                  ? selectedContacts[ 0 ].lastName
                  : 'Friends and Family',
          )
          setChosenContact( selectedContacts[ 0 ] )
        }
      }, 2 );
      ( trustedContactsBottomSheet as any ).current.snapTo( 0 );
      ( shareBottomSheet as any ).current.snapTo( 1 )
    },
    [ SelectedContacts, chosenContact ],
  )

  const renderTrustedContactsContent = useCallback( () => {
    return (
      <TrustedContacts
        LoadContacts={LoadContacts}
        onPressBack={() => {
          ( trustedContactsBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressContinue={async ( selectedContacts ) => {
          Keyboard.dismiss()
          getContacts( selectedContacts )
        }}
      />
    )
  }, [ LoadContacts, getContacts ] )

  const renderTrustedContactsHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( trustedContactsBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  const updateHistory = useCallback(
    ( shareHistory ) => {
      const updatedTrustedContactHistory = [ ...trustedContactHistory ]
      if ( shareHistory[ index ].createdAt )
        updatedTrustedContactHistory[ 0 ].date = shareHistory[ index ].createdAt
      if ( shareHistory[ index ].inTransit )
        updatedTrustedContactHistory[ 1 ].date = shareHistory[ index ].inTransit

      if ( shareHistory[ index ].accessible )
        updatedTrustedContactHistory[ 2 ].date = shareHistory[ index ].accessible

      if ( shareHistory[ index ].notAccessible )
        updatedTrustedContactHistory[ 3 ].date =
          shareHistory[ index ].notAccessible
      setTrustedContactHistory( updatedTrustedContactHistory )
    },
    [ trustedContactHistory ],
  )

  const saveInTransitHistory = useCallback( async () => {
    const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
    if ( shareHistory ) {
      const updatedShareHistory = [ ...shareHistory ]
      updatedShareHistory[ index ] = {
        ...updatedShareHistory[ index ],
        inTransit: Date.now(),
      }
      updateHistory( updatedShareHistory )
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify( updatedShareHistory ),
      )
    }
  }, [ updateHistory ] )

  const onOTPShare = useCallback(
    async ( index ) => {
      saveInTransitHistory()
      setIsReshare( true )
    },
    [ saveInTransitHistory, chosenContact ],
  )

  const renderShareOtpWithTrustedContactContent = useCallback( () => {
    return (
      <ShareOtpWithTrustedContact
        renderTimer={renderTimer}
        onPressOk={( index ) => {
          setRenderTimer( false )
          onOTPShare( index )
          setOTP( '' )
          props.navigation.goBack()
        }}
        onPressBack={() => {
          ( shareOtpWithTrustedContactBottomSheet as any ).current.snapTo( 0 )
        }}
        OTP={OTP}
        index={chosenContactIndex}
      />
    )
  }, [ onOTPShare, OTP, chosenContactIndex, renderTimer ] )

  const renderShareOtpWithTrustedContactHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( shareOtpWithTrustedContactBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  const renderConfirmContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ConfirmBottomSheet}
        title={'Confirm Recovery Key\nwith Keeper'}
        note={
          'Your Recovery Keys with contacts get confirmed automatically when the contact opens their app.\nSimply remind them to open their Hexa app and login to confirm your Recovery Key'
        }
        proceedButtonText={'Ok, got it'}
        onPressProceed={() => {
          //communicate();
          ( ConfirmBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressIgnore={() => {
          ( ConfirmBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
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

  const onPressReshare = useCallback( async () => {
    ( shareBottomSheet as any ).current.snapTo( 1 );
    ( ReshareBottomSheet as any ).current.snapTo( 0 )
  }, [ selectedTitle, chosenContact ] )

  const renderReshareContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ReshareBottomSheet}
        title={'Reshare with the same contact?'}
        info={'Proceed if you want to reshare the link/ QR with the same contact'}
        note={'For a different contact, please go back and choose ‘Change contact’'}
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          onPressReshare()
        }}
        onPressIgnore={() => {
          ( ReshareBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  }, [ onPressReshare ] )

  const renderChangeContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ChangeBottomSheet}
        title={'Change your\nKeeper'}
        info={'Having problems with your Keeper'}
        note={
          'You can change the Keeper you selected to send your Recovery Key'
        }
        proceedButtonText={'Change'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          setTimeout( () => {
            setLoadContacts( true )
            setChangeContact( true )
          }, 2 );

          ( trustedContactsBottomSheet as any ).current.snapTo( 1 );
          ( ChangeBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressIgnore={() => {
          ( ChangeBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  }, [] )

  const sortedHistory = useCallback( ( history ) => {
    const currentHistory = history.filter( ( element ) => {
      if ( element.date ) return element
    } )

    const sortedHistory = _.sortBy( currentHistory, 'date' )
    sortedHistory.forEach( ( element ) => {
      element.date = moment( element.date )
        .utc()
        .local()
        .format( 'DD MMMM YYYY HH:mm' )
    } )

    return sortedHistory
  }, [] )

  const getImageIcon = () => {
    if ( chosenContact && chosenContact.name ) {
      if ( chosenContact.imageAvailable ) {
        return (
          <View style={styles.imageBackground}>
            <Image source={chosenContact.image} style={styles.contactImage} />
          </View>
        )
      } else {
        return (
          <View style={styles.imageBackground}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: RFValue( 16 ),
              }}
            >
              {chosenContact &&
              chosenContact.firstName === 'F&F request' &&
              chosenContact.contactsWalletName !== undefined &&
              chosenContact.contactsWalletName !== ''
                ? nameToInitials( `${chosenContact.contactsWalletName}'s wallet` )
                : chosenContact && chosenContact.name
                  ? nameToInitials(
                    chosenContact &&
                      chosenContact.firstName &&
                      chosenContact.lastName
                      ? chosenContact.firstName + ' ' + chosenContact.lastName
                      : chosenContact.firstName && !chosenContact.lastName
                        ? chosenContact.firstName
                        : !chosenContact.firstName && chosenContact.lastName
                          ? chosenContact.lastName
                          : '',
                  )
                  : ''}
            </Text>
          </View>
        )
      }
    }
    return (
      <Image
        style={styles.contactImageAvatar}
        source={require( '../../assets/images/icons/icon_user.png' )}
      />
    )
  }

  const createDeepLink = useCallback( () => {
    try {
      if ( !SHARES_TRANSFER_DETAILS[ index ] ) {
        setTimeout( () => {
          setErrorMessageHeader( 'Failed to share' )
          setErrorMessage(
            'There was some error while sharing the Recovery Key, please try again',
          )
        }, 2 );
        ( ErrorBottomSheet as any ).current.snapTo( 1 )
        return
      }

      if ( !chosenContact ) {
        console.log( 'Err: Contact missing' )
        return
      }

      const contactName = `${chosenContact.firstName} ${
        chosenContact.lastName ? chosenContact.lastName : ''
      }`
        .toLowerCase()
        .trim()
      if (
        !trustedContacts.tc.trustedContacts[ contactName ] &&
        !trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
      ) {
        console.log(
          'Err: Trusted Contact/Ephemeral Channel does not exists for contact: ',
          contactName,
        )
        return
      }
      const {
        publicKey,
        symmetricKey,
        otp,
      } = trustedContacts.tc.trustedContacts[ contactName ]
      const requester = WALLET_SETUP.walletName
      const appVersion = DeviceInfo.getVersion()
      if ( chosenContact.phoneNumbers && chosenContact.phoneNumbers.length ) {
        const phoneNumber = chosenContact.phoneNumbers[ 0 ].number
        console.log( {
          phoneNumber
        } )
        let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
        number = number.slice( number.length - 10 ) // last 10 digits only
        const numHintType = 'num'
        const numHint = number[ 0 ] + number.slice( number.length - 2 )
        const numberEncPubKey = TrustedContactsService.encryptPub(
          publicKey,
          number,
        ).encryptedPub
        const uploadedAt = symmetricKey
          ? SHARES_TRANSFER_DETAILS[ index ].UPLOADED_AT
          : trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
            .initiatedAt

        const numberDL =
          `https://hexawallet.io/${config.APP_STAGE}/${
            symmetricKey ? 'atcg' : 'tcg'
          }` +
          `/${requester}` +
          `/${numberEncPubKey}` +
          `/${numHintType}` +
          `/${numHint}_keeper` +
          `/${uploadedAt}` +
          `/v${appVersion}`
        console.log( {
          numberDL
        } )
        setIsOTPType( false )
        setTrustedLink( numberDL )
        setIsReshare( true )
      } else if ( chosenContact.emails && chosenContact.emails.length ) {
        const email = chosenContact.emails[ 0 ].email
        const emailHintType = 'eml'
        const trucatedEmail = email.replace( '.com', '' )
        const emailHint =
          email[ 0 ] + trucatedEmail.slice( trucatedEmail.length - 2 )
        const emailEncPubKey = TrustedContactsService.encryptPub(
          publicKey,
          email,
        ).encryptedPub
        const uploadedAt = symmetricKey
          ? SHARES_TRANSFER_DETAILS[ index ].UPLOADED_AT
          : trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
            .initiatedAt

        const emailDL =
          `https://hexawallet.io/${config.APP_STAGE}/${
            symmetricKey ? 'atcg' : 'tcg'
          }` +
          `/${requester}` +
          `/${emailEncPubKey}` +
          `/${emailHintType}` +
          `/${emailHint}_keeper` +
          `/${uploadedAt}` +
          `/v${appVersion}`
        console.log( {
          emailDL
        } )
        setIsOTPType( false )
        setTrustedLink( emailDL )
        setIsReshare( true )
      } else if ( otp ) {
        const otpHintType = 'otp'
        const otpHint = 'xxx'
        const otpEncPubKey = TrustedContactsService.encryptPub( publicKey, otp )
          .encryptedPub
        const uploadedAt = symmetricKey
          ? SHARES_TRANSFER_DETAILS[ index ].UPLOADED_AT
          : trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
            .initiatedAt

        const otpDL =
          `https://hexawallet.io/${config.APP_STAGE}/${
            symmetricKey ? 'atcg' : 'tcg'
          }` +
          `/${requester}` +
          `/${otpEncPubKey}` +
          `/${otpHintType}` +
          `/${otpHint}_keeper` +
          `/${uploadedAt}` +
          `/v${appVersion}`
        setIsOTPType( true )
        setOTP( otp )
        setTrustedLink( otpDL )
        setIsReshare( true )
      } else {
        Alert.alert( 'Invalid Contact', 'Something went wrong.' )
        return
      }
    } catch ( error ) {
      console.log( 'error TC', error )
    }
  }, [ chosenContact, trustedContacts, SHARES_TRANSFER_DETAILS[ index ] ] )

  useEffect( () => {
    console.log( 'change SHARES_TRANSFER_DETAILS[index]', SHARES_TRANSFER_DETAILS[ index ] )
    if (
      SHARES_TRANSFER_DETAILS[ index ]
    ) {
      console.log( 'change SHARES_TRANSFER_DETAILS[index]', SHARES_TRANSFER_DETAILS[ index ] )
      console.log( '!SHARES_TRANSFER_DETAILS[index]', SHARES_TRANSFER_DETAILS )
      dispatch( uploadSMShareKeeper( index ) )
    }
  },
  [ SHARES_TRANSFER_DETAILS[ index ] ]
  )

  const updateTrustedContactsInfo = useCallback(
    async ( contact ) => {
      let tcInfo = trustedContactsInfo ? [ ...trustedContactsInfo ] : null

      if ( tcInfo ) {
        if ( tcInfo[ index ] ) {
          let found = false
          for ( let i = 3; i < tcInfo.length; i++ ) {
            // push if not present in TC list
            if ( tcInfo[ i ] && tcInfo[ i ].name == tcInfo[ index ].name ) {
              found = true
              break
            }
          }

          if ( !found ) tcInfo.push( tcInfo[ index ] )
        }

        for ( let i = 0; i < tcInfo.length; i++ ) {
          if ( tcInfo[ i ] && tcInfo[ i ].name == contact.name ) {
            tcInfo.splice( i, 1 )
            break
          }
        }

        tcInfo[ index ] = contact
      } else {
        tcInfo = []
        tcInfo[ 0 ] = null // securing initial 3 positions for Guardians
        tcInfo[ 1 ] = null
        tcInfo[ 2 ] = null
        tcInfo[ index ] = contact
      }
      await AsyncStorage.setItem( 'TrustedContactsInfo', JSON.stringify( tcInfo ) )

      dispatch( updateTrustedContactsInfoLocally( tcInfo ) )
      console.log( 'AFTER RESHARE selectedKeeper.shareId', selectedShareId )
      const shareArray = [
        {
          walletId: s3Service.getWalletId().data.walletId,
          shareId: selectedShareId,
          reshareVersion: 0,
          updatedAt: moment( new Date() ).valueOf(),
          name: contact.name,
          shareType: 'contact',
          status: 'notAccessible',
        },
      ]
      dispatch( updateMSharesHealth( shareArray ) )
      dispatch( onApprovalStatusChange( {
        status: false,
        initiatedAt: 0,
        shareId: '',
      } ) )
    },
    [ index, trustedContactsInfo ],
  )

  const createGuardian = useCallback( async () => {
    try {
      if ( !Object.keys( chosenContact ).length ) return

      const walletID = await AsyncStorage.getItem( 'walletID' )
      const FCM = fcmTokenValue
      //await AsyncStorage.getItem('fcmToken');
      console.log( {
        walletID, FCM
      } )

      const contactName = `${chosenContact.firstName} ${
        chosenContact.lastName ? chosenContact.lastName : ''
      }`
        .toLowerCase()
        .trim()

      let info = ''
      if ( chosenContact.phoneNumbers && chosenContact.phoneNumbers.length ) {
        const phoneNumber = chosenContact.phoneNumbers[ 0 ].number
        let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
        number = number.slice( number.length - 10 ) // last 10 digits only
        info = number
      } else if ( chosenContact.emails && chosenContact.emails.length ) {
        info = chosenContact.emails[ 0 ].email
      }

      const contactInfo = {
        contactName,
        info: info.trim(),
      }

      let accountNumber = regularAccount.hdWallet.trustedContactToDA[ contactName ]
      if ( !accountNumber ) {
        // initialize a trusted derivative account against the following account
        const res = regularAccount.getDerivativeAccXpub(
          TRUSTED_CONTACTS,
          null,
          contactName,
        )
        if ( res.status !== 200 ) {
          console.log( 'Err occurred while generating derivative account' )
        } else {
          // refresh the account number
          accountNumber = regularAccount.hdWallet.trustedContactToDA[ contactName ]
        }
      }

      const trustedReceivingAddress = ( regularAccount.hdWallet.derivativeAccounts[
        TRUSTED_CONTACTS
      ][ accountNumber ] as TrustedContactDerivativeAccountElements )
        .receivingAddress

      const data: EphemeralDataElements = {
        walletID,
        FCM,
        trustedAddress: trustedReceivingAddress,
        trustedTestAddress: testAccount.hdWallet.receivingAddress,
      }
      const trustedContact = trustedContacts.tc.trustedContacts[ contactName ]
      const hasTrustedChannel =
        trustedContact && trustedContact.symmetricKey ? true : false
      const obj = {
        shareId: selectedShareId,
        name: chosenContact.name,
        uuid: chosenContact.id,
        publicKey: '',
        ephemeralAddress: '',
        type: 'contact',
        data: {
          ...chosenContact, index
        }
      }
      dispatch( updatedKeeperInfo( obj ) )
      if ( changeContact ) {
        setTrustedLink( '' )
        setTrustedQR( '' )
        // remove the previous TC

        let previousGuardianName
        if ( trustedContactsInfo ) {
          const previousGuardian = trustedContactsInfo[ index ]
          if ( previousGuardian ) {
            previousGuardianName = `${previousGuardian.firstName} ${
              previousGuardian.lastName ? previousGuardian.lastName : ''
            }`
              .toLowerCase()
              .trim()
          } else {
            console.log( 'Previous guardian details missing' )
          }
        }

        dispatch(
          uploadEncMShareKeeper(
            index,
            selectedShareId,
            contactInfo,
            data,
            true,
            previousGuardianName,
          ),
        )
        updateTrustedContactsInfo( chosenContact )
        onOTPShare( index ) // enables reshare
        setChangeContact( false )
      } else if (
        !SHARES_TRANSFER_DETAILS[ index ] ||
        Date.now() - SHARES_TRANSFER_DETAILS[ index ].UPLOADED_AT >
          config.TC_REQUEST_EXPIRY
      ) {
        console.log( '!SHARES_TRANSFER_DETAILS[index]', SHARES_TRANSFER_DETAILS[ index ] )
        setTrustedLink( '' )
        setTrustedQR( '' )
        dispatch(
          uploadEncMShareKeeper( index, selectedShareId, contactInfo, data ),
        )
        updateTrustedContactsInfo( chosenContact )
        onOTPShare( index ) // enables reshare
      } else if (
        trustedContact &&
        !trustedContact.symmetricKey &&
        trustedContact.ephemeralChannel &&
        trustedContact.ephemeralChannel.initiatedAt &&
        Date.now() - trustedContact.ephemeralChannel.initiatedAt >
          config.TC_REQUEST_EXPIRY &&
        !hasTrustedChannel
      ) {
        console.log( 'SHARES_TRANSFER_DETAILS[index]', SHARES_TRANSFER_DETAILS[ index ] )
        setTrustedLink( '' )
        setTrustedQR( '' )
        dispatch(
          updateEphemeralChannel(
            contactInfo,
            trustedContact.ephemeralChannel.data[ 0 ],
          ),
        )
      }
    } catch ( error ) {
      console.log( 'error', error )
    }
  }, [ SHARES_TRANSFER_DETAILS[ index ], chosenContact, changeContact ] )

  useEffect( () => {
    if (
      uploadMetaShare ||
      updateEphemeralChannelLoader ||
      updateTrustedChannelLoader
    ) {
      if ( trustedLink ) setTrustedLink( '' )
      if ( trustedQR ) setTrustedQR( '' )
      return
    }

    if (
      chosenContact &&
      chosenContact.firstName &&
      SHARES_TRANSFER_DETAILS[ index ]
    ) {
      const contactName = `${chosenContact.firstName} ${
        chosenContact.lastName ? chosenContact.lastName : ''
      }`
        .toLowerCase()
        .trim()
      console.log( {
        contactName
      } )
      if ( !trustedContacts.tc.trustedContacts[ contactName ] ) return

      createDeepLink()

      const {
        publicKey,
        symmetricKey,
        otp,
      } = trustedContacts.tc.trustedContacts[ contactName ]

      let info = ''
      if ( chosenContact.phoneNumbers && chosenContact.phoneNumbers.length ) {
        const phoneNumber = chosenContact.phoneNumbers[ 0 ].number
        let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
        number = number.slice( number.length - 10 ) // last 10 digits only
        info = number
      } else if ( chosenContact.emails && chosenContact.emails.length ) {
        info = chosenContact.emails[ 0 ].email
      } else if ( otp ) {
        info = otp
      }

      if ( publicKey )
        setTrustedQR(
          JSON.stringify( {
            approvedTC: symmetricKey ? true : false,
            isGuardian: true,
            requester: WALLET_SETUP.walletName,
            publicKey,
            info: info.trim(),
            uploadedAt:
              trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
                .initiatedAt,
            type: 'trustedGuardian',
            ver: DeviceInfo.getVersion(),
            isFromKeeper: true,
          } ),
        )
    }
  }, [
    SHARES_TRANSFER_DETAILS[ index ],
    chosenContact,
    trustedContacts,
    uploadMetaShare,
    updateEphemeralChannelLoader,
    updateTrustedChannelLoader,
  ] )

  const SendShareModalFunction = useCallback( () => {
    if ( chosenContact && !isEmpty( chosenContact ) ) {
      return (
        <SendShareModal
          contact={chosenContact ? chosenContact : null}
          index={index}
          textHeader={'Sharing Recovery Key with'}
          onPressViaQr={( index ) => {
            createGuardian()
            if ( SendViaQRBottomSheet.current )
              ( SendViaQRBottomSheet as any ).current.snapTo( 1 );
            ( shareBottomSheet as any ).current.snapTo( 0 )
          }}
          onPressViaLink={( index ) => {
            createGuardian()
            if ( SendViaLinkBottomSheet.current )
              ( SendViaLinkBottomSheet as any ).current.snapTo( 1 );
            ( shareBottomSheet as any ).current.snapTo( 0 )
          }}
        />
      )
    }
  }, [ chosenContact, index ] )

  const SendModalFunction = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( shareBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  const renderSendViaLinkContents = useCallback( () => {
    if ( chosenContact && !isEmpty( chosenContact ) ) {
      return (
        <SendViaLink
          headerText={'Send Request'}
          subHeaderText={'Send a Keeper request link'}
          contactText={'Adding as a Keeper:'}
          contact={chosenContact ? chosenContact : null}
          contactEmail={''}
          infoText={`Click here to accept Keeper request for ${
            WALLET_SETUP.walletName
          } Hexa wallet- link will expire in ${
            config.TC_REQUEST_EXPIRY / ( 60000 * 60 )
          } hours`}
          link={trustedLink}
          onPressBack={() => {
            if ( SendViaLinkBottomSheet.current )
              ( SendViaLinkBottomSheet as any ).current.snapTo( 0 )
          }}
          onPressDone={() => {
            if ( isOTPType ) {
              setTimeout( () => {
                setRenderTimer( true )
              }, 2 );
              ( SendViaLinkBottomSheet as any ).current.snapTo( 0 );
              ( shareOtpWithTrustedContactBottomSheet as any ).current.snapTo( 1 )
            }
            else {
              ( SendViaLinkBottomSheet as any ).current.snapTo( 0 )
              const popAction = StackActions.pop( {
                n: 1
              } )
              props.navigation.dispatch( popAction )
              props.navigation.replace( 'ManageBackupNewBHR' )
            }
          }}
        />
      )
    }
  }, [ chosenContact, trustedLink ] )

  const renderSendViaQRContents = useCallback( () => {
    if ( chosenContact && !isEmpty( chosenContact ) ) {
      return (
        <SendViaQR
          contactText={'Adding to Friends and Family:'}
          contact={chosenContact ? chosenContact : null}
          noteHeader={'Scan QR'}
          noteText={
            'On scanning, you will be adding the contact as your Keeper'
          }
          QR={trustedQR}
          contactEmail={''}
          onPressBack={() => {
            if ( SendViaQRBottomSheet.current )
              ( SendViaQRBottomSheet as any ).current.snapTo( 0 )
          }}
          onPressDone={() => {
            ( SendViaQRBottomSheet as any ).current.snapTo( 0 )
          }}
        />
      )
    }
  }, [ chosenContact, trustedQR ] )

  const onPressChangeKeeperType = ( type, name ) => {
    if ( type == 'contact' ) {
      ( ChangeBottomSheet as any ).current.snapTo( 1 )
    }
    if ( type == 'device' ) {
      props.navigation.navigate( 'SecondaryDeviceHistoryNewBHR', {
        ...props.navigation.state.params, selectedTitle: name, isChangeKeeperType: true, prevKeeperType: 'contact', contactIndex: index
      } )
    }
    if ( type == 'pdf' ) {
      props.navigation.navigate(
        'PersonalCopyHistoryNewBHR',
        {
          ...props.navigation.state.params, selectedTitle: name, prevKeeperType: 'contact', contactIndex: index
        }
      )
    }
  }

  const sendApprovalRequestToPK = ( type ) => {
    const PKShareId =
      currentLevel == 2 || currentLevel == 1
        ? levelHealth[ 1 ].levelInfo[ 2 ].shareId
        : currentLevel == 3
          ? levelHealth[ 2 ].levelInfo[ 2 ].shareId
          : levelHealth[ 1 ].levelInfo[ 2 ].shareId
    console.log( 'PKShareId', PKShareId )
    dispatch(
      sendApprovalRequest(
        selectedKeeper.shareId,
        PKShareId,
        type == 'pdf' || type == 'contact'
          ? notificationType.uploadSecondaryShare
          : notificationType.approveKeeper
      )
    )
    if ( keeperApproveStatus.shareId != selectedKeeper.shareId ) {
      dispatch(
        onApprovalStatusChange( {
          status: false,
          initiatedAt: moment( new Date() ).valueOf(),
          shareId: selectedKeeper.shareId,
        } )
      )
    }
    ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 1 );
    ( keeperTypeBottomSheet as any ).current.snapTo( 0 )
  }


  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView
        style={{
          flex: 0, backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <HistoryHeaderComponent
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={selectedTitle}
        selectedTime={selectedTime}
        selectedStatus={selectedStatus}
        moreInfo={selectedTitle}
        headerImage={require( '../../assets/images/icons/icon_secondarydevice.png' )}
        imageIcon={getImageIcon}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          type={'contact'}
          IsReshare={isReshare}
          data={sortedHistory( trustedContactHistory )}
          confirmButtonText={'Confirm'}
          onPressChange={() => {
            ( keeperTypeBottomSheet as any ).current.snapTo( 1 )
          }}
          onPressConfirm={() => {
            setTimeout( () => {
              setLoadContacts( true )
            }, 2 );
            ( trustedContactsBottomSheet as any ).current.snapTo( 1 )
          }}
          onPressReshare={() => {
            ( ReshareBottomSheet as any ).current.snapTo( 1 )
          }}
          reshareButtonText={'Reshare Keeper'}
          changeButtonText={'Change Keeper'}
        />
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={trustedContactsBottomSheet as any}
        snapPoints={[ -30, hp( '85%' ) ]}
        renderContent={renderTrustedContactsContent}
        renderHeader={renderTrustedContactsHeader}
      />
      <BottomSheet
        onCloseEnd={() => {
          if ( Object.keys( chosenContact ).length > 0 ) {
            setRenderTimer( false )
          }
        }}
        enabledInnerScrolling={true}
        ref={shareOtpWithTrustedContactBottomSheet as any}
        snapPoints={[ -30, hp( '65%' ) ]}
        renderContent={renderShareOtpWithTrustedContactContent}
        renderHeader={renderShareOtpWithTrustedContactHeader}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ChangeBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ]}
        renderContent={renderChangeContent}
        renderHeader={() => <ModalHeader />}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ReshareBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ]}
        renderContent={renderReshareContent}
        renderHeader={() => <ModalHeader />}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ConfirmBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
        ]}
        renderContent={renderConfirmContent}
        renderHeader={() => <ModalHeader />}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={() => <ModalHeader />}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={shareBottomSheet as any}
        snapPoints={[
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 0 : 0,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '50%' ) : hp( '65%' ),
        ]}
        renderContent={SendShareModalFunction}
        renderHeader={SendModalFunction}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={SendViaLinkBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '83%' ) : hp( '85%' ),
        ]}
        renderContent={renderSendViaLinkContents}
        renderHeader={() => <ModalHeader />}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={SendViaQRBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '83%' ) : hp( '85%' ),
        ]}
        renderContent={renderSendViaQRContents}
        renderHeader={() => <ModalHeader />}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={HelpBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '87%' ) : hp( '89%' ),
        ]}
        renderContent={() => (
          <FriendsAndFamilyHelpContents
            titleClicked={() => {
              if ( HelpBottomSheet.current )
                ( HelpBottomSheet as any ).current.snapTo( 0 )
            }}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            borderColor={Colors.blue}
            backgroundColor={Colors.blue}
            onPressHeader={() => {
              if ( HelpBottomSheet.current )
                ( HelpBottomSheet as any ).current.snapTo( 0 )
            }}
          />
        )}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={keeperTypeBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '75%' ) : hp( '75%' ),
        ]}
        renderContent={() => (
          <KeeperTypeModalContents
            onPressSetup={async ( type, name ) =>{
              setSelectedKeeperType( type )
              setSelectedKeeperName( name )
              sendApprovalRequestToPK( type )
              // onPressChangeKeeperType(type, name);
              // (keeperTypeBottomSheet as any).current.snapTo(0);
            }}
            onPressBack={() => ( keeperTypeBottomSheet as any ).current.snapTo( 0 )}
            selectedLevelId={selectedLevelId}
            keeper={selectedKeeper}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() => ( keeperTypeBottomSheet as any ).current.snapTo( 0 )}
          />
        )}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ApprovePrimaryKeeperBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '60%' ) : hp( '70' ),
        ]}
        renderContent={() => (
          <ApproveSetup
            isContinueDisabled={
              selectedKeeperType == 'pdf' || selectedKeeperType == 'contact'
                ? !keeperApproveStatus.status
                : false
            }
            onPressContinue={() => {
              onPressChangeKeeperType( selectedKeeperType, selectedKeeperName );
              ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 0 )
            }}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() => {
              ( keeperTypeBottomSheet as any ).current.snapTo( 1 );
              ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 0 )
            }}
          />
        )}
      />
    </View>
  )
}

export default TrustedContactHistoryKeeper

const styles = StyleSheet.create( {
  imageBackground: {
    backgroundColor: Colors.shadowBlue,
    height: wp( '15%' ),
    width: wp( '15%' ),
    borderRadius: wp( '15%' ) / 2,
    borderColor: Colors.white,
    borderWidth: 2.5,
    shadowColor: Colors.textColorGrey,
    shadowOpacity: 0.5,
    shadowOffset: {
      width: 0, height: 3
    },
    shadowRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp( '4%' ),
  },
  contactImageAvatar: {
    width: wp( '15%' ),
    height: wp( '15%' ),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginRight: 8,
    shadowColor: Colors.textColorGrey,
    shadowOpacity: 0.5,
    shadowOffset: {
      width: 0, height: 3
    },
    shadowRadius: 5,
  },
  contactImage: {
    height: wp( '14%' ),
    width: wp( '14%' ),
    resizeMode: 'cover',
    alignSelf: 'center',
    borderRadius: wp( '14%' ) / 2,
  },
} )
