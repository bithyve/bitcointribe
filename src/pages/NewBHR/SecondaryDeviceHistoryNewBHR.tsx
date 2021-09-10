import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDispatch, useSelector } from 'react-redux'
import { createChannelAssets, createOrChangeGuardian, downloadSMShare, ErrorSending, setApprovalStatus, setChannelAssets, updatedKeeperInfo } from '../../store/actions/BHR'
import { updateMSharesHealth } from '../../store/actions/BHR'
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
  DeepLinkEncryptionType,
  KeeperInfoInterface,
  Keepers,
  LevelHealthInterface,
  MetaShare,
  QRCodeTypes,
  TrustedContact,
  TrustedContactRelationTypes,
  Trusted_Contacts,
  Wallet,
} from '../../bitcoin/utilities/Interface'
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
import ModalContainer from '../../components/home/ModalContainer'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import { historyArray } from '../../common/CommonVars/commonVars'
import { getIndex } from '../../common/utilities'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import dbManager from '../../storage/realm/dbManager'
import { generateDeepLink } from '../../common/CommonFunctions'

const SecondaryDeviceHistoryNewBHR = ( props ) => {
  const [ QrBottomSheet ] = useState( React.createRef<BottomSheet>() )
  // const [ ReshareBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ reshareModal, setReshareModal ] = useState( false )
  const [ ChangeBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ showQr, setShowQr ] = useState( false )
  const [ secondaryDeviceMessageBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ keeperTypeModal, setKeeperTypeModal ] = useState( false )
  const [ qrModal, setQRModal ] = useState( false )
  const [ HelpModal, setHelpModal ] = useState( false )
  const [ ErrorModal, setErrorModal ] = useState( false )
  const [ SecondaryDeviceMessageModal, setSecondaryDeviceMessageModal ] = useState( false )
  const [ ChangeModal, setChangeModal ] = useState( false )

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
  const [ isPrimaryKeeper, setIsPrimaryKeeper ] = useState( props.navigation.getParam( 'isPrimaryKeeper' ) )

  const [ isReshare, setIsReshare ] = useState( props.navigation.getParam( 'isChangeKeeperType' ) ? false : props.navigation.getParam( 'selectedKeeper' ).status === 'notAccessible' && props.navigation.getParam( 'selectedKeeper' ).updatedAt == 0 ? true : false )
  const [ isChange, setIsChange ] = useState( props.navigation.state.params.isChangeKeeperType
    ? props.navigation.state.params.isChangeKeeperType
    : false )
  const [ Contact, setContact ]: [any, any] = useState( null )
  const [ isChangeClicked, setIsChangeClicked ] = useState( false )

  const keeperInfo: KeeperInfoInterface[] = useSelector( ( state ) => state.bhr.keeperInfo )
  const keeperProcessStatusFlag = useSelector( ( state ) => state.bhr.keeperProcessStatus )
  const isErrorSendingFailed = useSelector( ( state ) => state.bhr.errorSending )
  const approvalStatus = useSelector( ( state ) => state.bhr.approvalStatus )
  const wallet: Wallet = useSelector( ( state ) => state.storage.wallet )
  const trustedContacts: Trusted_Contacts = useSelector( ( state ) => state.trustedContacts.contacts )
  const levelHealth:LevelHealthInterface[] = useSelector( ( state ) => state.bhr.levelHealth )
  const currentLevel = useSelector( ( state ) => state.bhr.currentLevel )
  const channelAssets: ChannelAssets = useSelector( ( state ) => state.bhr.channelAssets )
  const createChannelAssetsStatus = useSelector( ( state ) => state.bhr.loading.createChannelAssetsStatus )
  const s3 = dbManager.getBHR()
  const MetaShares: MetaShare[] = [ ...s3.metaSharesKeeper ]
  const dispatch = useDispatch()

  const index = props.navigation.getParam( 'index' )
  const [ isChangeKeeperAllow, setIsChangeKeeperAllow ] = useState( props.navigation.getParam( 'isChangeKeeperType' ) ? false : props.navigation.getParam( 'isChangeKeeperAllow' ) )

  const next = props.navigation.getParam( 'next' )

  useEffect( () => {
    setSelectedLevelId( props.navigation.getParam( 'selectedLevelId' ) )
    setSelectedKeeper( props.navigation.getParam( 'selectedKeeper' ) )
    setIsReshare( props.navigation.getParam( 'isChangeKeeperType' ) ? false : props.navigation.getParam( 'selectedKeeper' ).status === 'notAccessible' && props.navigation.getParam( 'selectedKeeper' ).updatedAt == 0 ? true : false )
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
    if( index === 0 ) lastName = 'Device 1'
    else if( index === 3 ) lastName = 'Device 2'
    else lastName = 'Device 3'

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
      const channelKeyTemp: string = selectedKeeper.shareType == 'existingContact' ? channelKey : isChangeKeeper ? BHROperations.generateKey( config.CIPHER_SPEC.keyLength ) : selectedKeeper.channelKey ? selectedKeeper.channelKey : BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
      setChannelKey( channelKeyTemp )

      const obj: KeeperInfoInterface = {
        shareId: selectedKeeper.shareId,
        name: Contact && Contact.name ? Contact.name : '',
        type: isPrimaryKeeper ? 'primaryKeeper' : 'device',
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
        channelKey, shareId: selectedKeeper.shareId, contact: Contact, index, isChange, oldChannelKey, isPrimaryKeeper
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
      const appVersion = DeviceInfo.getVersion()
      let encryption_key: string
      if( currentContact.deepLinkConfig ){
        const { encryptionType, encryptionKey } = currentContact.deepLinkConfig
        if( DeepLinkEncryptionType.DEFAULT === encryptionType ) encryption_key = encryptionKey
      }

      if( !encryption_key ){
        const { encryptedChannelKeys, encryptionType, encryptionHint } = generateDeepLink( DeepLinkEncryptionType.DEFAULT, encryption_key, currentContact, wallet.walletName )
        const QRData = JSON.stringify( {
          type: currentContact.relationType === TrustedContactRelationTypes.PRIMARY_KEEPER? QRCodeTypes.PRIMARY_KEEPER_REQUEST: QRCodeTypes.KEEPER_REQUEST,
          encryptedChannelKeys: encryptedChannelKeys,
          encryptionType,
          encryptionHint,
          walletName: wallet.walletName,
          version: appVersion,
        } )
        setKeeperQR( QRData )
      }
      if( isGuardianCreationClicked ) {
        const shareObj = {
          walletId: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.walletId,
          shareId: selectedKeeper.shareId,
          reshareVersion: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion,
          shareType: isPrimaryKeeper ? 'primaryKeeper' : 'device',
          status: 'notAccessible',
          name: Contact && Contact.name ? Contact.name : ''
        }

        dispatch( updateMSharesHealth( shareObj, isChange ) )
        dispatch( setChannelAssets( {
        } ) )
      }
    }
  }, [ Contact, trustedContacts ] )

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

  const renderSecondaryDeviceMessageContents = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={secondaryDeviceMessageBottomSheet}
        title={'Keeper Device'}
        note={
          'For confirming your Recovery Key on the Keeper Device, simply open the app on that device and log in'
        }
        proceedButtonText={'Ok, got it'}
        onPressProceed={() => setSecondaryDeviceMessageModal( false )}
        onPressIgnore={() => setSecondaryDeviceMessageModal( false )}
        isBottomImage={false}
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
        modalRef={ErrorModal}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => setErrorModal( false )}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ errorMessage, errorMessageHeader ] )

  useEffect( () => {
    if ( isErrorSendingFailed ) {
      setTimeout( () => {
        setErrorMessageHeader( 'Error sending Recovery Key' )
        setErrorMessage(
          'There was an error while sending your Recovery Key, please try again in a little while',
        )
      }, 2 )
      setErrorModal( true )
      dispatch( ErrorSending( null ) )
    }
  }, [ isErrorSendingFailed ] )

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
          setShowQr( true )
          setChangeModal( false )
          createGuardian( {
            isChangeTemp: true
          } )
        }}
        onPressIgnore={() => setChangeModal( false )}
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
        titleClicked={() => setHelpModal( false )}
      />
    )
  }

  if ( isErrorSendingFailed ) {
    setTimeout( () => {
      setErrorMessageHeader( 'Error sending Recovery Key' )
      setErrorMessage(
        'There was an error while sending your Recovery Key, please try again in a little while',
      )
    }, 2 )
    setErrorModal( true )
    dispatch( ErrorSending( null ) )
  }

  const sendApprovalRequestToPK = ( ) => {
    setQrBottomSheetsFlag( true )
    setQRModal( true )
    setKeeperTypeModal( false )
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
        }}
        onBackPress={() => {
          setQrBottomSheetsFlag( false )
          setQRModal( false )
        }}
        onPressContinue={async() => {
          const qrScannedData = '{"type":"RECOVERY_REQUEST","walletName":"erds","channelId":"28cc7e44b3ca629fe98450412f750d29fcf93d2de5057e841a665e8e73e98cfb","streamId":"b83dea121","secondaryChannelKey":"FLPy5dqRHTFCGqhZibhW9SLH","version":"1.8.0","walletId":"23887039bd673cfaa6fdc5ab9786aa130e010e9bbbc6731890361240ed83a55a"}'
          dispatch( setApprovalStatus( false ) )
          dispatch( downloadSMShare( qrScannedData ) )
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
      }, 2 )
      setChangeModal( true )
    }
    if ( type == 'pdf' ) {
      props.navigation.navigate( 'PersonalCopyHistoryNewBHR', {
        ...props.navigation.state.params,
        selectedTitle: name,
        isChangeKeeperType: true,
      } )
    }
  }

  useEffect( ()=>{
    if( approvalStatus && isChangeClicked ){
      console.log( 'APPROVe SD' )
      setQRModal( false )
      onPressChangeKeeperType( selectedKeeperType, selectedKeeperName )
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
          confirmButtonText={props.navigation.getParam( 'selectedKeeper' ).updatedAt > 0 ? 'Confirm' : 'Share Now' }
          onPressConfirm={() => {
            if( props.navigation.getParam( 'selectedKeeper' ).updatedAt == 0 ){
              setShowQr( true )
              createGuardian()
            } else {
              setSecondaryDeviceMessageModal( true )
            }
          }}
          reshareButtonText={'Reshare'}
          onPressReshare={async () => {
            setReshareModal( true )
          }}
          changeButtonText={'Change'}
          isChangeKeeperAllow={isChangeKeeperAllow && !isPrimaryKeeper && selectedKeeper.updatedAt}
          isVersionMismatch={isVersionMismatch}
          onPressChange={() => { setKeeperTypeModal( true ) }}
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
      <ModalContainer visible={SecondaryDeviceMessageModal} closeBottomSheet={()=>setSecondaryDeviceMessageModal( false )} >
        {renderSecondaryDeviceMessageContents()}
      </ModalContainer>
      <ModalContainer visible={ErrorModal} closeBottomSheet={()=>setErrorModal( false )} >
        {renderErrorModalContent()}
      </ModalContainer>
      <ModalContainer visible={qrModal} closeBottomSheet={()=>{setQRModal( false )}} >
        {renderQrContent()}
      </ModalContainer>
      <ModalContainer visible={HelpModal} closeBottomSheet={()=>{setHelpModal( false )}} >
        {renderHelpContent()}
      </ModalContainer>
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
              setQRModal( true )
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
      <ModalContainer visible={ChangeModal} closeBottomSheet={()=>{setChangeModal( false )}} >
        {renderChangeContent()}
      </ModalContainer>
      <ModalContainer visible={keeperTypeModal} closeBottomSheet={()=>{setKeeperTypeModal( false )}} >
        <KeeperTypeModalContents
          headerText={'Change backup method'}
          subHeader={'Share your Recovery Key with a new contact or a different device'}
          onPressSetup={async ( type, name ) => {
            setSelectedKeeperType( type )
            setSelectedKeeperName( name )
            sendApprovalRequestToPK( )
            setIsChangeClicked( true )
          }}
          onPressBack={() => setKeeperTypeModal( false )}
          selectedLevelId={selectedLevelId}
        />
      </ModalContainer>
    </View>
  )
}

export default SecondaryDeviceHistoryNewBHR
