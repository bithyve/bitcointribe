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
  ErrorSending,
  updateMSharesHealth,
  updatedKeeperInfo,
  setChannelAssets,
  createChannelAssets,
  setApprovalStatus,
  createOrChangeGuardian,
  downloadSMShare,
} from '../../store/actions/health'
import { useDispatch } from 'react-redux'
import SendViaLink from '../../components/SendViaLink'
import SendViaQR from '../../components/SendViaQR'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import {
  KeeperInfoInterface,
  Keepers,
  LevelHealthInterface,
  MetaShare,
  QRCodeTypes,
  TrustedContact,
  Trusted_Contacts,
  ChannelAssets
} from '../../bitcoin/utilities/Interface'
import config from '../../bitcoin/HexaConfig'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import FriendsAndFamilyHelpContents from '../../components/Helper/FriendsAndFamilyHelpContents'
import { isEmpty } from '../../common/CommonFunctions/index'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import QRModal from '../Accounts/QRModal'
import { StackActions } from 'react-navigation'
import ApproveSetup from './ApproveSetup'
import semver from 'semver'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import SSS from '../../bitcoin/utilities/sss/SSS'
import ModalContainer from '../../components/home/ModalContainer'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import { historyArray } from '../../common/CommonVars/commonVars'
import { getIndex } from '../../common/utilities'

const TrustedContactHistoryKeeper = ( props ) => {
  const [ ErrorBottomSheet, setErrorBottomSheet ] = useState( React.createRef() )
  const [ HelpBottomSheet, setHelpBottomSheet ] = useState( React.createRef() )
  const [ ChangeBottomSheet, setChangeBottomSheet ] = useState( React.createRef() )
  const [ SendViaLinkBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ SendViaQRBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ keeperTypeBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ shareOtpWithTrustedContactBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ QrBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ ApprovePrimaryKeeperBottomSheet ] = useState( React.createRef<BottomSheet>() )

  const [ oldChannelKey, setOldChannelKey ] = useState( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  const [ channelKey, setChannelKey ] = useState( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  const [ changeContact, setChangeContact ] = useState( false )
  const [ QrBottomSheetsFlag, setQrBottomSheetsFlag ] = useState( false )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const [ reshareModal, setReshareModal ] = useState( false )
  const [ ReshareBottomSheet, setReshareBottomSheet ] = useState(
    React.createRef(),
  )
  const [ ConfirmBottomSheet, setConfirmBottomSheet ] = useState(
    React.createRef(),
  )
  const [ OTP, setOTP ] = useState( '' )
  const [ renderTimer, setRenderTimer ] = useState( false )
  const [ showTrustedContactModal, setTrustedContactModal ] = useState( false )
  const [ LoadContacts, setLoadContacts ] = useState( false )
  const [ isOTPType, setIsOTPType ] = useState( false )
  const [ trustedLink, setTrustedLink ] = useState( '' )
  const [ trustedQR, setTrustedQR ] = useState( '' )
  const [ trustedContactHistory, setTrustedContactHistory ] = useState( historyArray )
  const [ selectedKeeperType, setSelectedKeeperType ] = useState( '' )
  const [ selectedKeeperName, setSelectedKeeperName ] = useState( '' )
  const [ isVersionMismatch, setIsVersionMismatch ] = useState( false )
  const [ isGuardianCreationClicked, setIsGuardianCreationClicked ] = useState( false )
  const [ isReshare, setIsReshare ] = useState( props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ? false : true )
  const [ selectedTitle, setSelectedTitle ] = useState( props.navigation.getParam( 'selectedTitle' ) )
  const [ selectedLevelId, setSelectedLevelId ] = useState( props.navigation.getParam( 'selectedLevelId' ) )
  const [ selectedKeeper, setSelectedKeeper ] = useState( props.navigation.getParam( 'selectedKeeper' ) )
  const [ isChange, setIsChange ] = useState( props.navigation.getParam( 'isChangeKeeperType' )
    ? props.navigation.getParam( 'isChangeKeeperType' )
    : false )
  const [ chosenContact, setChosenContact ] = useState(
    props.navigation.state.params.selectedKeeper && props.navigation.state.params.selectedKeeper.data && props.navigation.state.params.selectedKeeper.data.index
      ? props.navigation.state.params.selectedKeeper.data
      : null,
  )
  const [ showQRCode, setShowQRCode ] = useState( false )

  const createChannelAssetsStatus = useSelector( ( state ) => state.health.loading.createChannelAssetsStatus )
  const isErrorSendingFailed = useSelector( ( state ) => state.health.errorSending )
  const channelAssets: ChannelAssets = useSelector( ( state ) => state.health.channelAssets )
  const approvalStatus = useSelector( ( state ) => state.health.approvalStatus )
  const MetaShares: MetaShare[] = useSelector( ( state ) => state.health.service.levelhealth.metaSharesKeeper )
  const keeperInfo = useSelector( ( state ) => state.health.keeperInfo )
  const levelHealth: LevelHealthInterface[] = useSelector( ( state ) => state.health.levelHealth )
  const currentLevel = useSelector( ( state ) => state.health.currentLevel )
  const trustedContacts: TrustedContactsService = useSelector( ( state ) => state.trustedContacts.service )
  const { WALLET_SETUP } = useSelector( ( state ) => state.storage.database )
  const index = props.navigation.getParam( 'index' )
  const isChangeKeeperAllow = props.navigation.getParam( 'isChangeKeeperAllow' )
  const dispatch = useDispatch()

  useEffect( () => {
    setSelectedLevelId( props.navigation.getParam( 'selectedLevelId' ) )
    setSelectedKeeper( props.navigation.getParam( 'selectedKeeper' ) )
    setIsReshare( props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ? false : true )
    setIsChange(
      props.navigation.getParam( 'isChangeKeeperType' )
        ? props.navigation.getParam( 'isChangeKeeperType' )
        : false
    )
    setOldChannelKey( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  }, [ props.navigation.state.params ] )

  useEffect( () => {
    if ( isChange ) {
      setTimeout( () => {
        setLoadContacts( true )
      }, 2 )
      props.navigation.navigate( 'TrustedContactNewBHR', {
        LoadContacts: true,
        onPressContinue:async ( selectedContacts ) => {
          Keyboard.dismiss()
          createGuardian( getContacts( selectedContacts ) )
        }
      } )
    }
  }, [ isChange ] )

  useEffect( () => {
    ( async () => {
      if( props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ) {
        setTimeout( () => {
          setLoadContacts( true )
        }, 2 )
        props.navigation.navigate( 'TrustedContactNewBHR', {
          LoadContacts: true,
          onPressContinue:async ( selectedContacts ) => {
            Keyboard.dismiss()
            createGuardian( {
              chosenContactTmp:  getContacts( selectedContacts )
            } )
          }
        } )
      }
      const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
      if ( shareHistory ) updateHistory( shareHistory )
    } )()
    const trustedContactsInfo: Keepers = trustedContacts.tc.trustedContacts
    const contactName = props.navigation.getParam( 'selectedKeeper' ).name.toLowerCase().trim()
    const trustedData = trustedContactsInfo[ contactName ]

    if( trustedData && trustedData.trustedChannel && trustedData.trustedChannel.data.length == 2 ){
      if( trustedData.trustedChannel.data[ 1 ] && semver.lt( trustedData.trustedChannel.data[ 1 ].data.version, '1.6.0' ) ) {
        setTimeout( () => {
          setErrorMessageHeader( 'Error sending Recovery Key' )
          setErrorMessage(
            'your keeper need to update app / come online',
          )
          setIsVersionMismatch( true )
        }, 2 );
        ( ErrorBottomSheet as any ).current.snapTo( 1 )
      }
    }
  }, [] )

  const getContacts = useCallback(
    ( selectedContacts ) => {
      setTimeout( () => {
        if ( selectedContacts[ 0 ] ) {
          setChosenContact( selectedContacts[ 0 ] )
          setSelectedTitle(
            selectedContacts[ 0 ].firstName && selectedContacts[ 0 ].lastName
              ? selectedContacts[ 0 ].firstName + ' ' + selectedContacts[ 0 ].lastName
              : selectedContacts[ 0 ].firstName && !selectedContacts[ 0 ].lastName
                ? selectedContacts[ 0 ].firstName
                : !selectedContacts[ 0 ].firstName && selectedContacts[ 0 ].lastName
                  ? selectedContacts[ 0 ].lastName
                  : 'Friends and Family',
          )
        }
      }, 2 )
      setShowQRCode( true )
      return selectedContacts[ 0 ]
    },
    [ chosenContact ],
  )

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
    async ( ) => {
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
          onOTPShare( )
          setOTP( '' )
          props.navigation.goBack()
        }}
        onPressBack={() => {
          ( shareOtpWithTrustedContactBottomSheet as any ).current.snapTo( 0 )
        }}
        OTP={OTP}
        index={index}
      />
    )
  }, [ onOTPShare, OTP, renderTimer ] )

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
    setReshareModal( false )
    setShowQRCode( true )
  }, [ selectedTitle, chosenContact, getContacts ] )

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
          }, 2 )
          props.navigation.navigate( 'TrustedContactNewBHR', {
            LoadContacts: true,
            onPressContinue:async ( selectedContacts ) => {
              Keyboard.dismiss()
              createGuardian( getContacts( selectedContacts ) )
            }
          } );
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

  const createGuardian = useCallback(
    async ( payload: {isChangeTemp?: any, chosenContactTmp?: any} ) => {
      const { chosenContactTmp } = payload
      const isChangeKeeper = isChange ? isChange : payload && payload.isChangeTemp ? payload.isChangeTemp : false
      const Contact = ( chosenContact && !Object.keys( chosenContact ).length ) || chosenContact == null ? chosenContactTmp : chosenContact
      if( ( trustedQR || isReshare ) && !isChangeKeeper ) return
      setIsGuardianCreationClicked( true )
      const channelKey: string = isChange ? SSS.generateKey( config.CIPHER_SPEC.keyLength ) : selectedKeeper.channelKey ? selectedKeeper.channelKey : SSS.generateKey( config.CIPHER_SPEC.keyLength )
      setChannelKey( channelKey )

      const obj: KeeperInfoInterface = {
        shareId: selectedKeeper.shareId,
        name: Contact && Contact.name ? Contact.name : '',
        type: 'contact',
        scheme: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.scheme,
        currentLevel: currentLevel,
        createdAt: moment( new Date() ).valueOf(),
        sharePosition: MetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId ),
        data: {
          ...Contact, index
        },
        channelKey: channelKey
      }
      dispatch( updatedKeeperInfo( obj ) )
      dispatch( createChannelAssets( selectedKeeper.shareId ) )
    },
    [ trustedContacts, chosenContact ],
  )

  useEffect( ()=> {
    if( isGuardianCreationClicked && !createChannelAssetsStatus && channelAssets.shareId == selectedKeeper.shareId ){
      dispatch( createOrChangeGuardian( channelKey, selectedKeeper.shareId, chosenContact, index, isChange, oldChannelKey ) )
    }
  }, [ createChannelAssetsStatus, channelAssets ] )

  useEffect( () => {
    if( !chosenContact ) return

    const contacts: Trusted_Contacts = trustedContacts.tc.trustedContacts
    let currentContact: TrustedContact
    let channelKey: string
    if( contacts )
      for( const ck of Object.keys( contacts ) ){
        if ( contacts[ ck ].contactDetails.id === chosenContact.id ){
          currentContact = contacts[ ck ]
          channelKey = ck
          break
        }
      }
    if ( currentContact ) {
      const { secondaryChannelKey } = currentContact
      const appVersion = DeviceInfo.getVersion()
      // setTrustedLink( numberDL )
      console.log( JSON.stringify( {
        type: QRCodeTypes.KEEPER_REQUEST,
        channelKey,
        walletName: WALLET_SETUP.walletName,
        secondaryChannelKey,
        version: appVersion,
      } ) )
      setTrustedQR(
        JSON.stringify( {
          type: QRCodeTypes.KEEPER_REQUEST,
          channelKey,
          walletName: WALLET_SETUP.walletName,
          secondaryChannelKey,
          version: appVersion,
        } ),
      )
      if( isGuardianCreationClicked ) {
        const shareObj = {
          walletId: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.walletId,
          shareId: selectedKeeper.shareId,
          reshareVersion: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion,
          shareType: 'contact',
          status: 'notAccessible',
          name: chosenContact && chosenContact.name ? chosenContact.name : ''
        }
        dispatch( updateMSharesHealth( shareObj, isChange ) )
        dispatch( setChannelAssets( {
        } ) )
        saveInTransitHistory()
      }
    }
  }, [ chosenContact, trustedContacts ] )

  const renderSendViaLinkContents = useCallback( () => {
    if ( chosenContact && !isEmpty( chosenContact ) ) {
      return (
        <SendViaLink
          headerText={'Send Request'}
          subHeaderText={'Send request to help backup your wallet'}
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
                n: isChange ? 2 : 1
              } )
              props.navigation.dispatch( popAction )
              // props.navigation.replace( 'ManageBackupNewBHR' )
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
    const changeIndex = getIndex( levelHealth, type, selectedKeeper, keeperInfo )
    if ( type == 'contact' ) {
      ( ChangeBottomSheet as any ).current.snapTo( 1 )
    }
    if ( type == 'device' ) {
      props.navigation.navigate( 'SecondaryDeviceHistoryNewBHR', {
        ...props.navigation.state.params,
        selectedTitle: name,
        isChangeKeeperType: true,
        index: changeIndex
      } )
    }
    if ( type == 'pdf' ) {
      props.navigation.navigate( 'PersonalCopyHistoryNewBHR', {
        ...props.navigation.state.params,
        selectedTitle: name,
        isChangeKeeperType: true,
      } )
    }
  }

  const sendApprovalRequestToPK = ( ) => {
    setQrBottomSheetsFlag( true );
    ( QrBottomSheet as any ).current.snapTo( 1 );
    ( keeperTypeBottomSheet as any ).current.snapTo( 0 )
  }

  const renderQrContent = () => {
    return (
      <QRModal
        isFromKeeperDeviceHistory={false}
        QRModalHeader={'QR scanner'}
        title={'Note'}
        infoText={
          'Please approve this request by scanning the Secondary Key stored with any of the other backups'
        }
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={async( qrScannedData ) => {
          dispatch( setApprovalStatus( false ) )
          dispatch( downloadSMShare( qrScannedData ) )
          setQrBottomSheetsFlag( false )
        }}
        onBackPress={() => {
          setQrBottomSheetsFlag( false )
          if ( QrBottomSheet ) ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressContinue={async() => {
          const qrScannedData = '{"type":"RECOVERY_REQUEST","walletName":"Sfsf","channelId":"fd237d38f5ae70cd3afdf6b6d497ff11515bc3ff39bfe6e26e05575c31f302d8","streamId":"2b014b778","secondaryChannelKey":"Mjs8x1vCLF5XuOWbAgU0oJq2","version":"1.7.5"}'
          dispatch( setApprovalStatus( false ) )
          dispatch( downloadSMShare( qrScannedData ) )
          setQrBottomSheetsFlag( false )
        }}
      />
    )
  }

  const renderQrHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setQrBottomSheetsFlag( false );
          ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

  useEffect( ()=>{
    if( approvalStatus && channelAssets.shareId && channelAssets.shareId == selectedKeeper.shareId ){
      ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 1 );
      ( QrBottomSheet as any ).current.snapTo( 0 )
    }
  }, [ approvalStatus ] )

  useEffect( ()=>{
    if( isChange && channelAssets.shareId && channelAssets.shareId == selectedKeeper.shareId ){
      dispatch( setApprovalStatus( true ) )
    }
  }, [ channelAssets ] )

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
        selectedTime={selectedKeeper.updatedAt
          ? getTime( selectedKeeper.updatedAt )
          : 'never'}
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
          confirmButtonText={'Share Now'}
          onPressChange={() => {
            ( keeperTypeBottomSheet as any ).current.snapTo( 1 )
          }}
          onPressConfirm={() => {
            setTimeout( () => {
              setLoadContacts( true )
            }, 2 )
            props.navigation.navigate( 'TrustedContactNewBHR', {
              LoadContacts: true,
              onPressContinue:async ( selectedContacts ) => {
                Keyboard.dismiss()
                createGuardian( getContacts( selectedContacts ) )
              }
            } )
          }}
          onPressReshare={() => {
            setReshareModal( true )
          }}
          isVersionMismatch={isVersionMismatch}
          isChangeKeeperAllow={isChangeKeeperAllow}
          reshareButtonText={'Reshare'}
          changeButtonText={'Change'}
        />
      </View>
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
      {/* <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ReshareBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ]}
        renderContent={renderReshareContent}
        renderHeader={() => <ModalHeader />}
      /> */}
      <ModalContainer visible={reshareModal} closeBottomSheet={() => setReshareModal( false )}>
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
            // ( ReshareBottomSheet as any ).current.snapTo( 0 )
            setReshareModal( false )
          }}
          isBottomImage={false}
        />
      </ModalContainer>
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
      <ModalContainer visible={showQRCode} closeBottomSheet={() => setShowQRCode( false )}>
        <RequestKeyFromContact
          isModal={true}
          headerText={`Send Recovery Key${'\n'}to contact`}
          subHeaderText={'Send Key to Keeper, you can change your Keeper, or their primary mode of contact'}
          contactText={'Sharing Recovery Key with'}
          contact={chosenContact}
          QR={trustedQR}
          link={trustedLink}
          contactEmail={''}
          onPressBack={() => {
            props.navigation.goBack()
          }}
          onPressDone={() => {
            props.navigation.goBack()
          }}
          onPressShare={() => {
            if ( isOTPType ) {
              setTimeout( () => {
                setRenderTimer( true )
              }, 2 )
              props.navigation.goBack();
              ( shareOtpWithTrustedContactBottomSheet as any ).current.snapTo( 1 )
            }
            else {
              props.navigation.goBack()
              const popAction = StackActions.pop( {
                n: isChange ? 2 : 1
              } )
              props.navigation.dispatch( popAction )
            }
          }}
        />
      </ModalContainer>
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
            headerText={'Change backup method'}
            subHeader={'Share your Recovery Key with a new contact or a different device'}
            onPressSetup={async ( type, name ) =>{
              setSelectedKeeperType( type )
              setSelectedKeeperName( name )
              sendApprovalRequestToPK( )
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
            isContinueDisabled={false}
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
      <BottomSheet
        onOpenEnd={() => {
          setQrBottomSheetsFlag( true )
        }}
        onCloseEnd={() => {
          setQrBottomSheetsFlag( false );
          ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
        onCloseStart={() => { }}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={QrBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '92%' ) : hp( '91%' ),
        ]}
        renderContent={renderQrContent}
        renderHeader={renderQrHeader}
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
