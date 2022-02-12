import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux'
import { createChannelAssets, createGuardian, ErrorSending, modifyLevelData, setChannelAssets, updatedKeeperInfo, downloadSMShare, setApprovalStatus } from '../../store/actions/BHR'
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
  KeeperType,
  LevelData,
  MetaShare,
  QRCodeTypes,
  ShareSplitScheme,
  TrustedContact,
  TrustedContactRelationTypes,
  Trusted_Contacts,
  Wallet,
} from '../../bitcoin/utilities/Interface'
import config from '../../bitcoin/HexaConfig'
import KeeperDeviceHelpContents from '../../components/Helper/KeeperDeviceHelpContents'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import { v4 as uuid } from 'uuid'
import ModalContainer from '../../components/home/ModalContainer'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import { historyArray } from '../../common/CommonVars/commonVars'
import { getIndex } from '../../common/utilities'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import { generateDeepLink, getDeepLinkKindFromContactsRelationType } from '../../common/CommonFunctions'
import { translations } from '../../common/content/LocContext'
import { PermanentChannelsSyncKind, syncPermanentChannels } from '../../store/actions/trustedContacts'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'
import QRModal from '../Accounts/QRModal'

const SecondaryDeviceHistoryNewBHR = ( props ) => {
  const strings  = translations[ 'bhr' ]
  const common  = translations[ 'common' ]
  const levelData: LevelData[] = useSelector( ( state: RootStateOrAny ) => state.bhr.levelData )
  const [ qrModal, setQRModal ] = useState( false )
  const [ QrBottomSheetsFlag, setQrBottomSheetsFlag ] = useState( false )
  const approvalStatus = useSelector( ( state: RootStateOrAny ) => state.bhr.approvalStatus )
  // const [ ReshareBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ reshareModal, setReshareModal ] = useState( false )
  const [ ChangeBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ showQr, setShowQr ] = useState( false )
  const [ secondaryDeviceMessageBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ keeperTypeModal, setKeeperTypeModal ] = useState( false )
  const [ HelpModal, setHelpModal ] = useState( false )
  const [ ErrorModal, setErrorModal ] = useState( false )
  const [ ConfirmFromSecondaryDeviceModal, setConfirmFromSecondaryDeviceModal ] = useState( false )
  const [ ChangeModal, setChangeModal ] = useState( false )
  const [ selectedKeeper, setSelectedKeeper ] = useState( props.navigation.getParam( 'selectedKeeper' ) )

  const [ oldChannelKey, setOldChannelKey ] = useState( selectedKeeper.channelKey ? selectedKeeper.channelKey : '' )
  const [ channelKey, setChannelKey ] = useState( selectedKeeper.channelKey ? selectedKeeper.channelKey : '' )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const [ selectedKeeperType, setSelectedKeeperType ] = useState( '' )
  const [ selectedKeeperName, setSelectedKeeperName ] = useState( '' )
  const [ isGuardianCreationClicked, setIsGuardianCreationClicked ] = useState( false )
  const [ isVersionMismatch, setIsVersionMismatch ] = useState( false )
  const [ keeperQR, setKeeperQR ] = useState( '' )
  const [ secondaryDeviceHistory, setSecondaryDeviceHistory ] = useState( historyArray )
  const [ SelectedRecoveryKeyNumber, setSelectedRecoveryKeyNumber ] = useState( props.navigation.getParam( 'SelectedRecoveryKeyNumber' ) )
  const [ isPrimaryKeeper, setIsPrimaryKeeper ] = useState( props.navigation.getParam( 'isPrimaryKeeper' ) )

  const isChangeKeeper = props.navigation.getParam( 'isChangeKeeperType' )
  const [ isChange, setIsChange ] = useState( isChangeKeeper ? isChangeKeeper : false )
  const [ isReshare, setIsReshare ] = useState( isChangeKeeper ? false : selectedKeeper.status === 'notAccessible' && selectedKeeper.updatedAt == 0 ? true : false )
  const [ Contact, setContact ]: [any, any] = useState( null )
  const [ isChangeClicked, setIsChangeClicked ] = useState( false )
  const [ isShareClicked, setIsShareClicked ] = useState( false )

  const keeperInfo: KeeperInfoInterface[] = useSelector( ( state: RootStateOrAny ) => state.bhr.keeperInfo )
  const isErrorSendingFailed = useSelector( ( state: RootStateOrAny ) => state.bhr.errorSending )
  const wallet: Wallet = useSelector( ( state: RootStateOrAny ) => state.storage.wallet )
  const trustedContacts: Trusted_Contacts = useSelector( ( state: RootStateOrAny ) => state.trustedContacts.contacts )
  const currentLevel = useSelector( ( state: RootStateOrAny ) => state.bhr.currentLevel )
  const channelAssets: ChannelAssets = useSelector( ( state: RootStateOrAny ) => state.bhr.channelAssets )
  const createChannelAssetsStatus = useSelector( ( state: RootStateOrAny ) => state.bhr.loading.createChannelAssetsStatus )
  const metaSharesKeeper = useSelector( ( state: RootStateOrAny ) => state.bhr.metaSharesKeeper )
  const oldMetaSharesKeeper = useSelector( ( state: RootStateOrAny ) => state.bhr.oldMetaSharesKeeper )

  const MetaShares: MetaShare[] = [ ...metaSharesKeeper ]
  const OldMetaShares: MetaShare[] = [ ...oldMetaSharesKeeper ]
  const dispatch = useDispatch()

  const index = props.navigation.getParam( 'index' )
  const [ approvalErrorModal, setApprovalErrorModal ] = useState( false )
  const next = props.navigation.getParam( 'next' )

  useEffect( () => {
    const selectedKeeper = props.navigation.getParam( 'selectedKeeper' )
    const isChangeKeeper = props.navigation.getParam( 'isChangeKeeperType' )
    const selectedRecoveryKeyNum = props.navigation.getParam( 'SelectedRecoveryKeyNumber' )

    setSelectedRecoveryKeyNumber( selectedRecoveryKeyNum )
    setSelectedKeeper( selectedKeeper )
    setIsReshare( isChangeKeeper ? false : selectedKeeper.status === 'notAccessible' && selectedKeeper.updatedAt == 0 ? true : false )
    setIsChange(
      isChangeKeeper
        ? isChangeKeeper
        : false
    )
    setChannelKey( selectedKeeper.channelKey ? selectedKeeper.channelKey : '' )
    setOldChannelKey( selectedKeeper.channelKey ? selectedKeeper.channelKey : '' )
  }, [ props.navigation.state.params ] )

  //DidMount
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
    setContact( isChangeKeeper ? Contact : selectedKeeper.data && selectedKeeper.data.id ? selectedKeeper.data : Contact )
    approvalCheck()
  }, [ ] )

  const sendApprovalRequestToPK = ( ) => {
    setQrBottomSheetsFlag( true )
    setQRModal( true )
    setKeeperTypeModal( false )
  }

  const renderQrContent = () => {
    return (
      <QRModal
        isFromKeeperDeviceHistory={false}
        QRModalHeader={strings.QRscanner}
        title={common.note}
        infoText={
          strings.approvethisrequest
        }
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

  useEffect( ()=>{
    if( approvalStatus && isChangeClicked ){
      setQRModal( false )
      onPressChangeKeeperType( selectedKeeperType, selectedKeeperName )
    }
  }, [ approvalStatus ] )

  useEffect( ()=> {
    if( isChange && channelAssets.shareId && channelAssets.shareId == selectedKeeper.shareId ){
      dispatch( setApprovalStatus( true ) )
    }
  }, [ channelAssets ] )

  const approvalCheck = async() => {
    if( selectedKeeper.channelKey ){
      const instream = useStreamFromContact( trustedContacts[ selectedKeeper.channelKey ], wallet.walletId, true )
      const flag = await TrustedContactsOperations.checkSecondaryUpdated(
        {
          walletId: wallet.walletId,
          options:{
            retrieveSecondaryData: true
          },
          channelKey: selectedKeeper.channelKey,
          StreamId: instream.streamId
        }
      )
      if( !flag ){
        setApprovalErrorModal( true )
      }
    }
  }

  const initiateGuardianCreation = useCallback(
    async ( { isChangeTemp, chosenContactTmp, isReshare }: {isChangeTemp?: any, chosenContactTmp?: any, isReshare?: any} ) => {
      const isChangeKeeper = isChange ? isChange : isChangeTemp ? isChangeTemp : false
      setIsChange( isChangeKeeper )
      const isReshareTemp = isReshare ? isReshare : null
      if( ( keeperQR || isReshare ) && !isChangeKeeper && !isReshareTemp ) return
      setIsGuardianCreationClicked( true )
      const channelKeyTemp: string = isReshareTemp ? BHROperations.generateKey( config.CIPHER_SPEC.keyLength ) : selectedKeeper.shareType == 'existingContact' ? channelKey : isChangeKeeper ? BHROperations.generateKey( config.CIPHER_SPEC.keyLength ) : selectedKeeper.channelKey ? selectedKeeper.channelKey : BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
      setChannelKey( channelKeyTemp )
      const contactDetails = chosenContactTmp ? chosenContactTmp : Contact
      setContact( contactDetails )

      let sharePosition: number
      if( currentLevel === 0 ) sharePosition = -1
      else{
        const metaShareIndex = MetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId )
        if( metaShareIndex >= 0 ) sharePosition = metaShareIndex
        else {
          const oldMetaShareIndex = OldMetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId )
          if( oldMetaShareIndex >= 0 ) sharePosition = oldMetaShareIndex
          else sharePosition = 2
        }
      }

      const keeperInfo: KeeperInfoInterface = {
        shareId: selectedKeeper.shareId,
        name: contactDetails ? ( contactDetails.name? contactDetails.name: contactDetails.displayedName ? contactDetails.displayedName: '' ): '',
        type: isPrimaryKeeper ? KeeperType.PRIMARY_KEEPER : KeeperType.DEVICE,
        scheme: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ? MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.scheme : OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ? OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.scheme : currentLevel == 0 ? ShareSplitScheme.OneOfOne : ShareSplitScheme.TwoOfThree,
        currentLevel: currentLevel == 0 ? 1 : currentLevel,
        createdAt: moment( new Date() ).valueOf(),
        sharePosition,
        data: {
          ...( contactDetails? contactDetails: {
          } ),
          index
        },
        channelKey: channelKeyTemp
      }

      dispatch( updatedKeeperInfo( keeperInfo ) ) // updates keeper-info in the reducer
      dispatch( createChannelAssets( selectedKeeper.shareId ) )
    },
    [ trustedContacts, Contact, isChange ],
  )

  useEffect( ()=> {
    // invoke create/change guardian saga, once channel assets have been created
    const channelAssetsCreated = !createChannelAssetsStatus
    if( isGuardianCreationClicked && channelAssetsCreated && channelAssets.shareId == selectedKeeper.shareId ){
      dispatch( createGuardian( {
        channelKey, shareId: selectedKeeper.shareId, contact: Contact, index, isChange, oldChannelKey, isPrimaryKeeper
      } ) )
    }
  }, [ createChannelAssetsStatus, channelAssets ] )

  useEffect( () => {
    if( !keeperQR ) generate()  // prevents multiple generation as trusted-contact updates twice during init
  }, [ Contact, trustedContacts ] )

  const generate = async () => {
    if( !Contact ) return

    const contacts: Trusted_Contacts = trustedContacts
    const currentContact: TrustedContact = contacts[ channelKey ]

    if ( currentContact ) {
      const appVersion = DeviceInfo.getVersion()
      let encryption_key: string
      if( currentContact.deepLinkConfig ){
        const { encryptionType, encryptionKey } = currentContact.deepLinkConfig
        if( DeepLinkEncryptionType.DEFAULT === encryptionType ) encryption_key = encryptionKey
      }
      if( !encryption_key ){
        const keysToEncrypt = currentContact.channelKey + '-' + ( currentContact.secondaryChannelKey ? currentContact.secondaryChannelKey : '' )
        const { encryptedChannelKeys, encryptionType, encryptionHint } = await generateDeepLink( {
          deepLinkKind: getDeepLinkKindFromContactsRelationType( currentContact.relationType ),
          encryptionType: DeepLinkEncryptionType.DEFAULT,
          encryptionKey: encryption_key,
          walletName: wallet.walletName,
          keysToEncrypt,
          currentLevel
        } )

        const QRData = JSON.stringify( {
          type: currentContact.relationType === TrustedContactRelationTypes.PRIMARY_KEEPER? QRCodeTypes.PRIMARY_KEEPER_REQUEST: QRCodeTypes.KEEPER_REQUEST,
          encryptedChannelKeys: encryptedChannelKeys,
          encryptionType,
          encryptionHint,
          walletName: wallet.walletName,
          version: appVersion,
          currentLevel
        } )
        setKeeperQR( QRData )
      }
      if( isGuardianCreationClicked ) {
        const shareObj = {
          walletId: wallet.walletId,
          shareId: selectedKeeper.shareId,
          reshareVersion: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ?
            MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion :
            OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ?
              OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion : 0,
          shareType: isPrimaryKeeper ? 'primaryKeeper' : 'device',
          status: 'notAccessible',
          name: Contact && Contact.name ? Contact.name : '',
          updatedAt: 0
        }

        dispatch( updateMSharesHealth( shareObj, isChange ) )
        dispatch( setChannelAssets( {
        }, null ) )
      }
    }
  }

  const renderSecondaryDeviceContents = useCallback( () => {
    return (
      <SecondaryDevice
        qrTitle={`Recovery Key ${SelectedRecoveryKeyNumber}`}
        secondaryQR={keeperQR}
        onPressOk={async () => {
          setIsShareClicked( true )
          if( trustedContacts ) {
            let channelUpdate
            if ( channelKey && trustedContacts[ channelKey ] && trustedContacts[ channelKey ].contactDetails.id === Contact.id ) {
              channelUpdate =  {
                contactInfo: {
                  channelKey: channelKey,
                }
              }
            }
            if( channelUpdate )
              dispatch( syncPermanentChannels( {
                permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
                channelUpdates: [ channelUpdate ],
                metaSync: true
              } ) )
          }
          setShowQr( false )
          setTimeout( () => {
            setIsReshare( true )
          }, 2 )
        }}
        onPressBack={() => {
          setShowQr( false )
        }}
      />
    )
  }, [ keeperQR ] )

  useEffect( ()=>{
    if( isShareClicked ) dispatch( modifyLevelData() )
  }, [ trustedContacts, isShareClicked ] )

  useEffect( ()=>{
    if( isShareClicked ){
      if( levelData.find( value=>( value.keeper1.shareId == selectedKeeper.shareId && value.keeper1.status !== 'notSetup' ) || ( value.keeper2.shareId == selectedKeeper.shareId && value.keeper2.status !== 'notSetup' ) ) ) {
        setTimeout( () => {
          if( isChangeKeeper ) {
            props.navigation.pop( 2 )
          } else {
            props.navigation.pop( 1 )
          }
          setShowQr( false )
        }, 500 )
      }
    }
  }, [ levelData, isShareClicked ] )

  const renderConfirmFromSecondaryDeviceModal = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={secondaryDeviceMessageBottomSheet}
        title={'Personal Device'}
        note={
          strings.confirmingyourRecovery
        }
        proceedButtonText={strings.ok}
        onPressProceed={() => setConfirmFromSecondaryDeviceModal( false )}
        onPressIgnore={() => setConfirmFromSecondaryDeviceModal( false )}
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
        proceedButtonText={common.tryAgain}
        onPressProceed={() => setErrorModal( false )}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ errorMessage, errorMessageHeader ] )

  useEffect( () => {
    if ( isErrorSendingFailed ) {
      setTimeout( () => {
        setErrorMessageHeader( strings.ErrorsendingRecovery )
        setErrorMessage(
          strings.errorwhilesendingyourRecovery,
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
        info={strings.problemswithyourKeeper}
        note={
          strings.changetheKeeper
        }
        proceedButtonText={common.change}
        cancelButtonText={common.back}
        isIgnoreButton={true}
        onPressProceed={() => {
          setIsChange( true )
          setKeeperQR( '' )
          setIsReshare( false )
          // ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 );
          setShowQr( true )
          setChangeModal( false )
          props.navigation.navigate( 'ContactsListForAssociateContact', {
            postAssociation: ( contact ) => {
              setShowQr( true )
              setContact( contact )
              initiateGuardianCreation( {
                isChangeTemp: true, chosenContactTmp: contact
              } )
            }
          } )

        }}
        onPressIgnore={() => setChangeModal( false )}
        isBottomImage={false}
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
      setErrorMessageHeader( strings.ErrorsendingRecovery )
      setErrorMessage(
        strings.errorwhilesendingyourRecovery,
      )
    }, 2 )
    setErrorModal( true )
    dispatch( ErrorSending( null ) )
  }

  const onPressChangeKeeperType = ( type, name ) => {
    const changeIndex = getIndex( levelData, type, selectedKeeper, keeperInfo )
    setIsChangeClicked( false )
    setKeeperTypeModal( false )
    const navigationParams = {
      selectedTitle: name,
      SelectedRecoveryKeyNumber: SelectedRecoveryKeyNumber,
      selectedKeeper: {
        shareType: type,
        name: name,
        reshareVersion: 0,
        status: 'notSetup',
        updatedAt: 0,
        shareId: selectedKeeper.shareId,
        data: {
        },
      },
      index: changeIndex,
    }
    if ( type == 'contact' ) {
      props.navigation.navigate( 'TrustedContactHistoryNewBHR', {
        ...navigationParams,
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
        ...navigationParams,
        isChangeKeeperType: true,
      } )
    }
  }

  const onPressReshare = () => {
    let currentContact: TrustedContact
    if( trustedContacts )
      for( const ck of Object.keys( trustedContacts ) ){
        if ( trustedContacts[ ck ].contactDetails.id === Contact.id ){
          currentContact = trustedContacts[ ck ]
          break
        }
      }

    if ( currentContact && currentContact.isActive ){
      setReshareModal( false )
      setShowQr( true )
      initiateGuardianCreation( {
      } )
    }
    else {
      setReshareModal( false )

      props.navigation.navigate( 'ContactsListForAssociateContact', {
        postAssociation: ( contact ) => {
          setShowQr( true )
          setContact( contact )
          initiateGuardianCreation( {
            isReshare: true, chosenContactTmp: contact
          } )
        }
      } )
      setShowQr( true )
    }
  }

  const initiateBackupWithDeviceFlow = useCallback( () => {
    if( isChange || selectedKeeper.updatedAt == 0 ){
      // associate a contact and create guardian
      props.navigation.navigate( 'ContactsListForAssociateContact', {
        postAssociation: ( contact ) => {
          setShowQr( true )
          initiateGuardianCreation( {
            chosenContactTmp: contact
          } )
        }
      } )

    } else {
      // already shared: show message(confirm from secondary device)
      setConfirmFromSecondaryDeviceModal( true )
    }
  }, [ isChange, selectedKeeper ] )

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
          : 'Never'}
        moreInfo={props.navigation.state.params.selectedTitle}
        headerImage={require( '../../assets/images/icons/icon_secondarydevice.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          showButton={true}
          type={'secondaryDevice'}
          IsReshare={isReshare}
          data={sortedHistory( secondaryDeviceHistory )}
          confirmButtonText={isChange ? 'Share Now' : selectedKeeper.updatedAt > 0 ? 'Confirm' : 'Share Now' }
          onPressConfirm={initiateBackupWithDeviceFlow}
          reshareButtonText={'Reshare'}
          onPressReshare={async () => {
            setReshareModal( true )
          }}
          changeButtonText={'Change'}
          isChangeKeeperAllow={isChange ? false : selectedKeeper.status != 'notSetup' && ( ( selectedKeeper.updatedAt == 0 && isPrimaryKeeper ) || ( selectedKeeper.updatedAt > 0 && !isPrimaryKeeper ) ) ? true : false}
          isVersionMismatch={isVersionMismatch}
          onPressChange={() => {
            if( isPrimaryKeeper ){
              setTimeout( () => {
                setIsChange( true )
                setKeeperQR( '' )
                setIsReshare( false )
              }, 2 )
              setChangeModal( true )
            } else setKeeperTypeModal( true )
          }}
        />
      </View>
      <ModalContainer onBackground={()=>setShowQr( false )} visible={showQr} closeBottomSheet={() => setShowQr( false )} >
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
      <ModalContainer onBackground={()=>setConfirmFromSecondaryDeviceModal( false )} visible={ConfirmFromSecondaryDeviceModal} closeBottomSheet={()=>setConfirmFromSecondaryDeviceModal( false )} >
        {renderConfirmFromSecondaryDeviceModal()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setErrorModal( false )} visible={ErrorModal} closeBottomSheet={()=>setErrorModal( false )} >
        {renderErrorModalContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setHelpModal( false )} visible={HelpModal} closeBottomSheet={()=>{setHelpModal( false )}} >
        {renderHelpContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setReshareModal( false )} visible={reshareModal} closeBottomSheet={() => setReshareModal( false )}>
        <ErrorModalContents
          title={strings.Resharewithsamedevice}
          info={
            strings.ifyouwanttoreshare
          }
          note={
            strings.differentdevice
          }
          proceedButtonText={strings.reshare}
          cancelButtonText={common.back}
          isIgnoreButton={true}
          onPressProceed={() => onPressReshare() }
          onPressIgnore={() => {
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
          selectedLevelId={props.navigation.getParam( 'selectedLevelId' )}
          headerText={strings.Changebackupmethod}
          subHeader={strings.withanewcontact}
          onPressSetup={async ( type, name ) => {
            setSelectedKeeperType( type )
            setSelectedKeeperName( name )
            if( type == 'pdf' ) { setIsChangeClicked( true ); sendApprovalRequestToPK( ) }
            else onPressChangeKeeperType( type, name )
          }}
          onPressBack={() => setKeeperTypeModal( false )}
        />
      </ModalContainer>
      <ModalContainer visible={approvalErrorModal} closeBottomSheet={()=>{setApprovalErrorModal( false )}} >
        <ErrorModalContents
          title={'Need Approval'}
          note={'Scan the Approval Key stored on Personal Device 1 in: Security and Privacy> I am the Keeper of > Contact'}
          proceedButtonText={strings.ok}
          onPressProceed={() => setApprovalErrorModal( false )}
          isBottomImage={false}
        />
      </ModalContainer>
      <ModalContainer visible={qrModal} closeBottomSheet={()=>{setQRModal( false )}} >
        {renderQrContent()}
      </ModalContainer>
    </View>
  )
}

export default SecondaryDeviceHistoryNewBHR
