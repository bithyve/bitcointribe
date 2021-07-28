import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import { createChannelAssets, createOrChangeGuardian, downloadSMShare, ErrorSending, setApprovalStatus, setChannelAssets, updatedKeeperInfo } from '../../store/actions/health'
import { updateMSharesHealth } from '../../store/actions/health'
import Colors from '../../common/Colors'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalHeader from '../../components/ModalHeader'
import HistoryPageComponent from './HistoryPageComponent'
import SecondaryDevice from './SecondaryDeviceNewBHR'
import moment from 'moment'
import _ from 'underscore'
import ErrorModalContents from '../../components/ErrorModalContents'
import DeviceInfo from 'react-native-device-info'
import {
  ChannelAssets,
  KeeperInfoInterface,
  Keepers,
  LevelHealthInterface,
  MetaShare,
  QRCodeTypes,
  TrustedContact,
  Trusted_Contacts,
  Wallet,
} from '../../bitcoin/utilities/Interface'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import config from '../../bitcoin/HexaConfig'
import QRModal from '../Accounts/QRModal'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import KeeperDeviceHelpContents from '../../components/Helper/KeeperDeviceHelpContents'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import ApproveSetup from './ApproveSetup'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'
import semver from 'semver'
import { v4 as uuid } from 'uuid'
import SSS from '../../bitcoin/utilities/sss/SSS'
import ModalContainer from '../../components/home/ModalContainer'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import { historyArray } from '../../common/CommonVars/commonVars'
import { getIndex } from '../../common/utilities'

const SecondaryDeviceHistoryNewBHR = ( props ) => {
  const [ ErrorBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ HelpBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ QrBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ keeperTypeBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ ApprovePrimaryKeeperBottomSheet ] = useState( React.createRef<BottomSheet>() )
  // const [ ReshareBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ reshareModal, setReshareModal ] = useState( false )
  const [ ChangeBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ secondaryDeviceBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ showQr, setShowQr ] = useState( false )
  const [ secondaryDeviceMessageBottomSheet ] = useState( React.createRef<BottomSheet>() )

  const [ oldChannelKey, setOldChannelKey ] = useState( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  const [ channelKey, setChannelKey ] = useState( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const [ QrBottomSheetsFlag, setQrBottomSheetsFlag ] = useState( false )
  const [ blockReshare, setBlockReshare ] = useState( '' )
  const [ selectedKeeperType, setSelectedKeeperType ] = useState( '' )
  const [ selectedKeeperName, setSelectedKeeperName ] = useState( '' )
  const [ isGuardianCreationClicked, setIsGuardianCreationClicked ] = useState( false )
  const [ isVersionMismatch, setIsVersionMismatch ] = useState( false )
  const [ keeperQR, setKeeperQR ] = useState( '' )
  const [ secondaryDeviceHistory, setSecondaryDeviceHistory ] = useState( historyArray )
  const [ selectedLevelId, setSelectedLevelId ] = useState( props.navigation.getParam( 'selectedLevelId' ) )
  const [ selectedKeeper, setSelectedKeeper ] = useState( props.navigation.getParam( 'selectedKeeper' ) )
  const [ isReshare, setIsReshare ] = useState( props.navigation.getParam( 'isChangeKeeperType' ) ? false : props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ? false : true
  )
  const [ isChange, setIsChange ] = useState( props.navigation.state.params.isChangeKeeperType
    ? props.navigation.state.params.isChangeKeeperType
    : false )
  const [ Contact, setContact ]: [any, any] = useState( null )
  const [ isChangeClicked, setIsChangeClicked ] = useState( false )

  const keeperInfo: KeeperInfoInterface[] = useSelector( ( state ) => state.health.keeperInfo )
  const keeperProcessStatusFlag = useSelector( ( state ) => state.health.keeperProcessStatus )
  const isErrorSendingFailed = useSelector( ( state ) => state.health.errorSending )
  const approvalStatus = useSelector( ( state ) => state.health.approvalStatus )
  const wallet: Wallet = useSelector( ( state ) => state.storage.wallet )
  const trustedContacts: Trusted_Contacts = useSelector( ( state ) => state.trustedContacts.contacts )
  const levelHealth:LevelHealthInterface[] = useSelector( ( state ) => state.health.levelHealth )
  const currentLevel = useSelector( ( state ) => state.health.currentLevel )
  const channelAssets: ChannelAssets = useSelector( ( state ) => state.health.channelAssets )
  const createChannelAssetsStatus = useSelector( ( state ) => state.health.loading.createChannelAssetsStatus )
  const MetaShares: MetaShare[] = useSelector( ( state ) => state.health.service.levelhealth.metaSharesKeeper )
  const dispatch = useDispatch()

  const index = props.navigation.getParam( 'index' )
  const [ isChangeKeeperAllow, setIsChangeKeeperAllow ] = useState( props.navigation.getParam( 'isChangeKeeperType' ) ? false : props.navigation.getParam( 'isChangeKeeperAllow' ) )

  const next = props.navigation.getParam( 'next' )

  useEffect( () => {
    setSelectedLevelId( props.navigation.getParam( 'selectedLevelId' ) )
    setSelectedKeeper( props.navigation.getParam( 'selectedKeeper' ) )
    setIsReshare( props.navigation.getParam( 'isChangeKeeperType' ) ? false : props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ? false : true )
    setIsChange(
      props.navigation.getParam( 'isChangeKeeperType' )
        ? props.navigation.getParam( 'isChangeKeeperType' )
        : false
    )
    setChannelKey( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
    setOldChannelKey( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  }, [ props.navigation.state.params ] )

  useEffect( ()=>{
    const firstName = 'Personal'
    let lastName = 'Device'
    if( index === 0 ) lastName = 'Device1'
    else if( index === 3 ) lastName = 'Device2'
    else lastName = 'Device3'

    const Contact = {
      id: uuid(),
      name: `${firstName} ${lastName ? lastName : ''}`
    }
    setContact( props.navigation.getParam( 'isChangeKeeperType' ) ? Contact : selectedKeeper.data && selectedKeeper.data.id ? selectedKeeper.data : Contact )
  }, [ ] )

  const saveInTransitHistory = async () => {
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
  }

  const createGuardian = useCallback(
    async ( payload?: {isChangeTemp?: any, chosenContactTmp?: any} ) => {
      const isChangeKeeper = isChange ? isChange : payload && payload.isChangeTemp ? payload.isChangeTemp : false
      if( ( keeperQR || isReshare ) && !isChangeKeeper ) return
      setIsGuardianCreationClicked( true )
      const channelKeyTemp: string = selectedKeeper.shareType == 'existingContact' ? channelKey : isChangeKeeper ? SSS.generateKey( config.CIPHER_SPEC.keyLength ) : selectedKeeper.channelKey ? selectedKeeper.channelKey : SSS.generateKey( config.CIPHER_SPEC.keyLength )
      setChannelKey( channelKeyTemp )

      const obj: KeeperInfoInterface = {
        shareId: selectedKeeper.shareId,
        name: Contact && Contact.name ? Contact.name : '',
        type: 'device',
        scheme: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.scheme,
        currentLevel: currentLevel,
        createdAt: moment( new Date() ).valueOf(),
        sharePosition: MetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId ),
        data: {
          ...Contact, index
        },
        channelKey: channelKeyTemp
      }

      dispatch( updatedKeeperInfo( obj ) )
      dispatch( createChannelAssets( selectedKeeper.shareId ) )
    },
    [ trustedContacts, Contact ],
  )

  useEffect( ()=> {
    if( isGuardianCreationClicked && !createChannelAssetsStatus && channelAssets.shareId == selectedKeeper.shareId ){
      dispatch( createOrChangeGuardian( {
        channelKey, shareId: selectedKeeper.shareId, contact: Contact, index, isChange, oldChannelKey
      } ) )
    }
  }, [ createChannelAssetsStatus, channelAssets ] )

  useEffect( () => {
    if( !Contact ) return

    const contacts: Trusted_Contacts = trustedContacts
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

      setKeeperQR(
        JSON.stringify( {
          type: QRCodeTypes.KEEPER_REQUEST,
          channelKey,
          walletName: wallet.walletName,
          secondaryChannelKey,
          version: appVersion,
        } ),
      )
      if( isGuardianCreationClicked ) {
        const shareObj = {
          walletId: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.walletId,
          shareId: selectedKeeper.shareId,
          reshareVersion: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion,
          shareType: 'device',
          status: 'notAccessible',
          name: Contact && Contact.name ? Contact.name : ''
        }
        dispatch( updateMSharesHealth( shareObj, isChange ) )
        dispatch( setChannelAssets( {
        } ) )
      }
    }
  }, [ Contact, trustedContacts ] )

  useEffect( () => {
    ( async () => {
      const contactName = props.navigation.getParam( 'selectedKeeper' ).name.toLowerCase().trim()
      const trustedData = trustedContacts[ contactName ]

      // console.log( 'trustedData.trustedChannel', trustedData.trustedChannel.data[ 1 ] )
      // if( trustedData && trustedData.trustedChannel && trustedData.trustedChannel.data.length == 2 ){
      //   if( trustedData.trustedChannel.data[ 1 ] && semver.lt( trustedData.trustedChannel.data[ 1 ].data.version, '1.6.0' ) ) {
      //     setTimeout( () => {
      //       setErrorMessageHeader( 'Error sending Recovery Key' )
      //       setErrorMessage(
      //         'your keeper need to update app / come online',
      //       )
      //       setIsVersionMismatch( true )
      //     }, 2 );
      //     ( ErrorBottomSheet as any ).current.snapTo( 1 )
      //   }
      // }
      return () => console.log( 'unmounting...' )
    } )()
  }, [] )


  const renderSecondaryDeviceContents = useCallback( () => {
    console.log( keeperQR )
    return (
      <SecondaryDevice
        secondaryQR={keeperQR}
        onPressOk={async () => {
          saveInTransitHistory()
          // dispatch(checkMSharesHealth());
          // ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
          setShowQr( false )
          if( props.navigation.getParam( 'isChangeKeeperType' ) ){
            props.navigation.pop( 2 )
          } else {
            props.navigation.pop( 1 )
          }
          setTimeout( () => {
            setIsReshare( true )
          }, 2 )
        }}
        onPressBack={() => {
          // ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
          setShowQr( false )
        }}
      />
    )
  }, [ keeperQR ] )

  const renderSecondaryDeviceHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          // ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
          setShowQr( false )
        }}
      />
    )
  }, [] )

  const renderSecondaryDeviceMessageContents = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={secondaryDeviceMessageBottomSheet}
        title={'Keeper Device'}
        note={
          'For confirming your Recovery Key on the Keeper Device, simply open the app on that device and log in'
        }
        proceedButtonText={'Ok, got it'}
        onPressProceed={() => {
          if ( secondaryDeviceMessageBottomSheet.current )
            ( secondaryDeviceMessageBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressIgnore={() => {
          if ( secondaryDeviceMessageBottomSheet.current )
            ( secondaryDeviceMessageBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  }, [] )

  const renderSecondaryDeviceMessageHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (secondaryDeviceMessageBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  useEffect( () => {
    if ( next ) setShowQr( true )
  }, [ next ] )

  const sortedHistory = ( history ) => {
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
  }

  const updateHistory = ( shareHistory ) => {
    const updatedSecondaryHistory = [ ...secondaryDeviceHistory ]
    if ( shareHistory[ index ].createdAt )
      updatedSecondaryHistory[ 0 ].date = shareHistory[ index ].createdAt
    if ( shareHistory[ index ].inTransit )
      updatedSecondaryHistory[ 1 ].date = shareHistory[ index ].inTransit

    if ( shareHistory[ index ].accessible )
      updatedSecondaryHistory[ 2 ].date = shareHistory[ index ].accessible

    if ( shareHistory[ index ].notAccessible )
      updatedSecondaryHistory[ 3 ].date = shareHistory[ index ].notAccessible
    setSecondaryDeviceHistory( updatedSecondaryHistory )
  }

  useEffect( () => {
    ( async () => {
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem( 'shareHistory' ),
      )
      if ( shareHistory[ index ].inTransit || shareHistory[ index ].accessible ) {
        setIsReshare( true )
      }
      if ( shareHistory ) updateHistory( shareHistory )
    } )()
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

  useEffect( () => {
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
  }, [ isErrorSendingFailed ] )

  const renderHelpHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if ( HelpBottomSheet.current )
            ( HelpBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }


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
          setIsChange( true )
          setKeeperQR( '' )
          setIsReshare( false )
          // ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 );
          setShowQr( true );
          ( ChangeBottomSheet as any ).current.snapTo( 0 )
          createGuardian( {
            isChangeTemp: true
          } )
        }}
        onPressIgnore={() => {
          ( ChangeBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  }, [] )

  const renderChangeHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (ChangeBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  const renderHelpContent = () => {
    return (
      <KeeperDeviceHelpContents
        titleClicked={() => {
          if ( HelpBottomSheet.current )
            ( HelpBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

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
          // ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 1 )
          dispatch( setApprovalStatus( false ) )
          dispatch( downloadSMShare( qrScannedData ) )
          setQrBottomSheetsFlag( false )
        }}
        onBackPress={() => {
          setQrBottomSheetsFlag( false )
          if ( QrBottomSheet ) ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressContinue={async() => {
          const qrScannedData = '{"type":"RECOVERY_REQUEST","walletName":"erds","channelId":"28cc7e44b3ca629fe98450412f750d29fcf93d2de5057e841a665e8e73e98cfb","streamId":"b83dea121","secondaryChannelKey":"FLPy5dqRHTFCGqhZibhW9SLH","version":"1.8.0","walletId":"23887039bd673cfaa6fdc5ab9786aa130e010e9bbbc6731890361240ed83a55a"}'
          dispatch( setApprovalStatus( false ) )
          // ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 1 )
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

  const onPressChangeKeeperType = ( type, name ) => {
    const changeIndex = getIndex( levelHealth, type, selectedKeeper, keeperInfo )
    setIsChangeClicked( false )
    if ( type == 'contact' ) {
      props.navigation.navigate( 'TrustedContactHistoryNewBHR', {
        ...props.navigation.state.params,
        selectedTitle: name,
        index: changeIndex,
        isChangeKeeperType: true,
      } )
    }
    if ( type == 'device' ) {
      setTimeout( () => {
        setIsChange( true )
        setKeeperQR( '' )
        setIsReshare( false )
      }, 2 );
      ( ChangeBottomSheet as any ).current.snapTo( 1 )
    }
    if ( type == 'pdf' ) {
      console.log( 'type', type )
      props.navigation.navigate( 'PersonalCopyHistoryNewBHR', {
        ...props.navigation.state.params,
        selectedTitle: name,
        isChangeKeeperType: true,
      } )
    }
  }

  useEffect( ()=>{
    if( approvalStatus && isChangeClicked ){
      console.log( 'APPROVe SD' );
      ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 1 );
      ( QrBottomSheet as any ).current.snapTo( 0 )
    }
  }, [ approvalStatus ] )

  useEffect( ()=> {
    if( isChange && channelAssets.shareId && channelAssets.shareId == selectedKeeper.shareId ){
      dispatch( setApprovalStatus( true ) )
    }
  }, [ channelAssets ] )

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView style={{
        flex: 0, backgroundColor: Colors.backgroundColor
      }}/>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <HistoryHeaderComponent
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={props.navigation.state.params.selectedTitle}
        selectedTime={selectedKeeper.updatedAt
          ? getTime( selectedKeeper.updatedAt )
          : 'never'}
        moreInfo={props.navigation.state.params.selectedTitle}
        headerImage={require( '../../assets/images/icons/icon_secondarydevice.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          type={'secondaryDevice'}
          IsReshare={isReshare}
          data={sortedHistory( secondaryDeviceHistory )}
          confirmButtonText={'Share Now'}
          onPressConfirm={() => {
            // ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 )
            setShowQr( true )
            createGuardian()
          }}
          reshareButtonText={'Reshare'}
          onPressReshare={async () => {
            // ( ReshareBottomSheet as any ).current.snapTo( 1 )
            setReshareModal( true )
          }}
          changeButtonText={'Change'}
          isChangeKeeperAllow={isChangeKeeperAllow}
          isVersionMismatch={isVersionMismatch}
          onPressChange={() => { ( keeperTypeBottomSheet as any ).current.snapTo( 1 ) }}
        />
      </View>
      <ModalContainer visible={showQr} closeBottomSheet={() => {}} >
        {renderSecondaryDeviceContents()}
      </ModalContainer>
      {/* <BottomSheet
        onCloseEnd={() => {
          if( keeperProcessStatusFlag == KeeperProcessStatus.COMPLETED ){
            saveInTransitHistory()
            // ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
            setShowQr( false )
            if ( next ) {
              props.navigation.goBack()
            }
            setTimeout( () => {
              setIsReshare( true )
            }, 2 )
          }
        }}
        onCloseStart={() => {
          // ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
          setShowQr( false )
        }}
        enabledInnerScrolling={true}
        ref={secondaryDeviceBottomSheet as any}
        snapPoints={[ -30, hp( '85%' ) ]}
        renderContent={renderSecondaryDeviceContents}
        renderHeader={renderSecondaryDeviceHeader}
      /> */}
      <BottomSheet
        onCloseStart={() => {
          ( secondaryDeviceMessageBottomSheet.current as any ).current.snapTo( 0 )
        }}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={secondaryDeviceMessageBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
        ]}
        renderContent={renderSecondaryDeviceMessageContents}
        renderHeader={renderSecondaryDeviceMessageHeader}
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
        renderHeader={renderErrorModalHeader}
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
      <BottomSheet
        enabledInnerScrolling={true}
        ref={HelpBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '87%' ) : hp( '89%' ),
        ]}
        renderContent={renderHelpContent}
        renderHeader={renderHelpHeader}
      />
      <ModalContainer visible={reshareModal} closeBottomSheet={() => setReshareModal( false )}>
        <ErrorModalContents
          // modalRef={ReshareBottomSheet}
          title={'Reshare with the same device?'}
          info={
            'Proceed if you want to reshare the link/ QR with the same device'
          }
          note={
            'For a different device, please go back and choose ‘Change device'
          }
          proceedButtonText={'Reshare'}
          cancelButtonText={'Back'}
          isIgnoreButton={true}
          onPressProceed={() => {
            // ( ReshareBottomSheet as any ).current.snapTo( 0 )
            setReshareModal( false )
            if ( blockReshare ) {
              ( QrBottomSheet.current as any ).snapTo( 1 )
            } else {
              // ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 )
              setShowQr( true )
              createGuardian()
            }
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
        ref={ChangeBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ]}
        renderContent={renderChangeContent}
        renderHeader={renderChangeHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={keeperTypeBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch()
            ? hp( '75%' )
            : hp( '75%' ),
        ]}
        renderContent={() => (
          <KeeperTypeModalContents
            headerText={'Change backup method'}
            subHeader={'Share your Recovery Key with a new contact or a different device'}
            onPressSetup={async ( type, name ) => {
              setSelectedKeeperType( type )
              setSelectedKeeperName( name )
              sendApprovalRequestToPK( )
              setIsChangeClicked( true )
            }}
            onPressBack={() =>
              ( keeperTypeBottomSheet as any ).current.snapTo( 0 )
            }
            selectedLevelId={selectedLevelId}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() =>
              ( keeperTypeBottomSheet as any ).current.snapTo( 0 )
            }
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
            isContinueDisabled={approvalStatus}
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

export default SecondaryDeviceHistoryNewBHR
