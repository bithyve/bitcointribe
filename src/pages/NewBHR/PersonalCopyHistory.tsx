import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDispatch, useSelector } from 'react-redux'
import Colors from '../../common/Colors'
import BottomSheet from 'reanimated-bottom-sheet'
import HistoryPageComponent from './HistoryPageComponent'
import PersonalCopyShareModal from './PersonalCopyShareModal'
import moment from 'moment'
import _ from 'underscore'
import ErrorModalContents from '../../components/ErrorModalContents'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import PersonalCopyHelpContents from '../../components/Helper/PersonalCopyHelpContents'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import {
  getPDFData,
  confirmPDFShared,
  emptyShareTransferDetailsForContactChange,
  keeperProcessStatus,
  updatedKeeperInfo,
  updateMSharesHealth,
  createChannelAssets,
  setApprovalStatus,
  createOrChangeGuardian,
  downloadSMShare,
} from '../../store/actions/BHR'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import {
  ChannelAssets,
  KeeperInfoInterface,
  MetaShare,
  Trusted_Contacts,
} from '../../bitcoin/utilities/Interface'
import { StackActions } from 'react-navigation'
import QRModal from '../Accounts/QRModal'
import ApproveSetup from './ApproveSetup'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'
import { setIsPermissionGiven } from '../../store/actions/preferences'
import { v4 as uuid } from 'uuid'
import config from '../../bitcoin/HexaConfig'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import { historyArray } from '../../common/CommonVars/commonVars'
import ModalContainer from '../../components/home/ModalContainer'
import { getIndex } from '../../common/utilities'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import dbManager from '../../storage/realm/dbManager'

const PersonalCopyHistory = ( props ) => {
  const dispatch = useDispatch()
  // const [ ErrorBottomSheet, setErrorBottomSheet ] = useState( React.createRef() )
  const [ errorModal, setErrorModal ] = useState( false )
  const [ keeperTypeModal, setKeeperTypeModal ] = useState( false )
  const storagePermissionBottomSheet = useRef<BottomSheet>()
  const [ hasStoragePermission, setHasStoragePermission ] = useState( false )
  const [ storagePermissionModal, setStoragePermissionModal ] = useState( false )
  const [ selectedKeeperType, setSelectedKeeperType ] = useState( '' )
  const [ selectedKeeperName, setSelectedKeeperName ] = useState( '' )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const [ QrBottomSheet, setQrBottomSheet ] = useState( React.useRef() )
  const [ HelpModal, setHelpModal ] = useState( false )

  const [ qrModal, setQRModal ] = useState( false )
  const [ QrBottomSheetsFlag, setQrBottomSheetsFlag ] = useState( false )
  const [ isChangeClicked, setIsChangeClicked ] = useState( false )
  const [ personalCopyHistory, setPersonalCopyHistory ] = useState( historyArray )
  // const [
  //   PersonalCopyShareBottomSheet,
  //   setPersonalCopyShareBottomSheet,
  // ] = useState( React.createRef() )

  const [ personalCopyShareModal, setPersonalCopyShareModal ] = useState( false )
  const selectedPersonalCopy = props.navigation.getParam(
    'selectedPersonalCopy'
  )
  const [ oldChannelKey, setOldChannelKey ] = useState( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  const [ channelKey, setChannelKey ] = useState( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  const [ personalCopyDetails, setPersonalCopyDetails ] = useState( null )
  const [ selectedLevelId, setSelectedLevelId ] = useState(
    props.navigation.state.params.selectedLevelId
  )
  const [ selectedKeeper, setSelectedKeeper ] = useState(
    props.navigation.state.params.selectedKeeper
  )
  const [ isReshare, setIsReshare ] = useState( props.navigation.getParam( 'isChangeKeeperType' ) ? false :
    props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ? false : true
  )
  const levelHealth = useSelector( ( state ) => state.bhr.levelHealth )
  const currentLevel = useSelector( ( state ) => state.bhr.currentLevel )
  const keeperInfo = useSelector( ( state ) => state.bhr.keeperInfo )
  const pdfInfo = useSelector( ( state ) => state.bhr.pdfInfo )
  const [ isChange, setIsChange ] = useState( props.navigation.getParam( 'isChangeKeeperType' )
    ? props.navigation.getParam( 'isChangeKeeperType' )
    : false )
  const pdfDataConfirm = useSelector( ( state ) => state.bhr.loading.pdfDataConfirm )
  const pdfCreatedSuccessfully = useSelector( ( state ) => state.bhr.pdfCreatedSuccessfully )
  const [ confirmDisable, setConfirmDisable ] = useState( true )
  const [ isChangeKeeperAllow, setIsChangeKeeperAllow ] = useState( props.navigation.getParam( 'isChangeKeeperType' ) ? false : props.navigation.getParam( 'isChangeKeeperAllow' ) )
  const s3 = dbManager.getBHR()
  const MetaShares: MetaShare[] = [ ...s3.metaSharesKeeper ]
  const trustedContacts: Trusted_Contacts = useSelector(
    ( state ) => state.trustedContacts.contacts,
  )
  const [ Contact, setContact ]:[any, any] = useState( {
  } )
  const index = 5
  const channelAssets: ChannelAssets = useSelector( ( state ) => state.bhr.channelAssets )
  const approvalStatus = useSelector( ( state ) => state.bhr.approvalStatus )
  const createChannelAssetsStatus = useSelector( ( state ) => state.bhr.loading.createChannelAssetsStatus )
  const [ isGuardianCreationClicked, setIsGuardianCreationClicked ] = useState( false )
  const [ isConfirm, setIsConfirm ] = useState( false )

  useEffect( () => {
    setSelectedLevelId( props.navigation.getParam( 'selectedLevelId' ) )
    setSelectedKeeper( props.navigation.getParam( 'selectedKeeper' ) )
    setIsReshare(
      props.navigation.getParam( 'isChangeKeeperType' ) ? false : props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ? false : true
    )
    setIsChange(
      props.navigation.getParam( 'isChangeKeeperType' )
        ? props.navigation.getParam( 'isChangeKeeperType' )
        : false
    )
    if( !channelAssets.shareId || ( channelAssets.shareId && channelAssets.shareId != props.navigation.getParam( 'selectedKeeper' ).shareId ) ){
      dispatch( createChannelAssets( props.navigation.getParam( 'selectedKeeper' ).shareId ) )
    }
  }, [
    props.navigation.state.params
  ] )

  useEffect( ()=>{
    const Contact = {
      id: uuid(),
      name: 'Personal Copy'
    }
    setContact( props.navigation.getParam( 'isChangeKeeperType' ) ? Contact : selectedKeeper.data && selectedKeeper.data.id ? selectedKeeper.data : Contact )
  }, [ ] )

  useEffect( ()=>  {
    if( Platform.OS === 'ios' ) {
      // ( storagePermissionBottomSheet as any ).current.snapTo( 0 )
      setStoragePermissionModal( false )
      setHasStoragePermission( true )
    } else {
      hasStoragePermission
        ? setStoragePermissionModal( false )
        : setStoragePermissionModal( true )
    }
    if( hasStoragePermission ){
      generatePDF()
    }
  }, [ hasStoragePermission ] )
  // const saveInTransitHistory = async () => {
  //   try{
  //       const shareHistory = JSON.parse(await AsyncStorage.getItem("shareHistory"));
  //     if (shareHistory) {
  //       let updatedShareHistory = [...shareHistory];
  //       // updatedShareHistory = {
  //       //   ...updatedShareHistory,
  //       //   inTransit: Date.now(),
  //       // };
  //       updateHistory(updatedShareHistory);
  //       await AsyncStorage.setItem(
  //         "shareHistory",
  //         JSON.stringify(updatedShareHistory)
  //       );
  //     }
  //   }catch(e){
  //     console.log('e', e)
  //   }
  // };

  const generatePDF = async() => {
    createGuardian( )
    const shareHistory = JSON.parse(
      await AsyncStorage.getItem( 'shareHistory' )
    )
    if ( shareHistory ) updateHistory( shareHistory )
  }

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
    const updatedPersonalCopyHistory = [ ...personalCopyHistory ]
    if ( shareHistory.createdAt )
      updatedPersonalCopyHistory[ 0 ].date = shareHistory.createdAt
    if ( shareHistory.inTransit )
      updatedPersonalCopyHistory[ 1 ].date = shareHistory.inTransit

    if ( shareHistory.accessible )
      updatedPersonalCopyHistory[ 2 ].date = shareHistory.accessible

    if ( shareHistory.notAccessible )
      updatedPersonalCopyHistory[ 3 ].date = shareHistory.notAccessible

    setPersonalCopyHistory( updatedPersonalCopyHistory )
  }

  useEffect( () => {
    if( pdfCreatedSuccessfully ){
      setConfirmDisable( false )

      if( props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ) {
        // ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
        setPersonalCopyShareModal( true )
      }
    }
  }, [ pdfCreatedSuccessfully ] )

  useEffect( () => {
    if( pdfInfo.filePath ){
      setConfirmDisable( false )
    }
  }, [ pdfInfo ] )

  useEffect( () => {
    if( !pdfDataConfirm ){
      dispatch( keeperProcessStatus( KeeperProcessStatus.COMPLETED ) )
    }
  }, [ pdfDataConfirm ] )

  const renderErrorModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        // modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          // ( ErrorBottomSheet as any ).current.snapTo( 0 )
          setErrorModal( false )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ errorMessage, errorMessageHeader ] )

  const renderPersonalCopyShareModalContent = useCallback( () => {
    return (
      <PersonalCopyShareModal
        removeHighlightingFromCard={() => {}}
        selectedPersonalCopy={selectedPersonalCopy}
        personalCopyDetails={personalCopyDetails}
        onPressBack={() => {
          // ( PersonalCopyShareBottomSheet as any ).current.snapTo( 0 )
          setPersonalCopyShareModal( false )
        }}
        onPressShare={() => {
          const shareObj = {
            walletId: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.walletId,
            shareId: selectedKeeper.shareId,
            reshareVersion: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion,
            shareType: 'pdf',
            status: 'notAccessible',
            name: 'Personal Copy'
          }
          dispatch( updateMSharesHealth( shareObj, false ) )
        }}
        onPressConfirm={() => {
          try {
            dispatch( keeperProcessStatus( KeeperProcessStatus.IN_PROGRESS ) )
            // ( PersonalCopyShareBottomSheet as any ).current.snapTo( 0 )
            setPersonalCopyShareModal( false )
            if (
              props.navigation.getParam( 'prevKeeperType' ) &&
              props.navigation.getParam( 'isChange' ) &&
              props.navigation.getParam( 'contactIndex' ) &&
              props.navigation.getParam( 'prevKeeperType' ) == 'contact' &&
              props.navigation.getParam( 'contactIndex' ) != null
            ) {
              dispatch(
                emptyShareTransferDetailsForContactChange(
                  props.navigation.getParam( 'contactIndex' )
                )
              )
            }
            setIsReshare( true )
            if( props.navigation.getParam( 'isChangeKeeperType' ) ){
              props.navigation.pop( 2 )
            } else {
              props.navigation.pop( 1 )
            }
          } catch ( err ) {
            dispatch( keeperProcessStatus( '' ) )
            console.log( 'error', err )
          }
        }}
      />
    )
  }, [ selectedPersonalCopy, personalCopyDetails ] )



  const renderHelpContent = () => {
    return (
      <PersonalCopyHelpContents
        titleClicked={() => setHelpModal( false )}
      />
    )
  }

  const getStoragePermission = async () => {
    // await checkStoragePermission()
    if ( Platform.OS === 'android' ) {
      const granted = await requestStoragePermission()
      if ( !granted ) {
        setErrorMessage(
          'Cannot access files and storage. Permission denied.\nYou can enable files and storage from the phone settings page \n\n Settings > Hexa > Storage',
        )
        setHasStoragePermission( false )
        // ( storagePermissionBottomSheet as any ).current.snapTo( 0 );
        setStoragePermissionModal( false )
        // ( ErrorBottomSheet as any ).current.snapTo( 1 )
        setErrorModal( true )
        return
      }
      else {
        // ( storagePermissionBottomSheet as any ).current.snapTo( 0 )
        setStoragePermissionModal( false )
        setHasStoragePermission( true )
      }
    }

    if ( Platform.OS === 'ios' ) {
      setHasStoragePermission( true )
      return
    }
  }

  const requestStoragePermission = async () => {
    try {
      dispatch( setIsPermissionGiven( true ) )
      const result = await PermissionsAndroid.requestMultiple( [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ] )
      if(
        result[ 'android.permission.READ_EXTERNAL_STORAGE' ] === PermissionsAndroid.RESULTS.GRANTED
        &&
        result[ 'android.permission.WRITE_EXTERNAL_STORAGE' ] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true
      }
      else {
        return false
      }
    } catch ( err ) {
      console.warn( err )
      return false
    }
  }

  const checkStoragePermission = async () =>  {
    dispatch( setIsPermissionGiven( true ) )
    if( Platform.OS==='android' ) {
      const [ read, write ] = [
        await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE ),
        await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE )
      ]
      if( read && write ) {
        setHasStoragePermission( true )
        return true
      }
      else {
        setHasStoragePermission( false )
        return false
      }
    }

  }

  const renderStoragePermissionModalContent = useCallback( () => {
    checkStoragePermission()
    return (
      <ErrorModalContents
        modalRef={storagePermissionBottomSheet}
        title={'Why do we need access to your files and storage?'}
        info={'File and Storage access will let Hexa save a pdf with your Recovery Keys. This will also let Hexa attach the pdf to emails, messages and to print in case you want to.\n\n'}
        otherText={'Don’t worry these are only sent to the email address you choose, in the next steps you will be able to choose how the pdf is shared.'}
        proceedButtonText={'Continue'}
        isIgnoreButton={false}
        onPressProceed={() => {
          getStoragePermission()
        }}
        onPressIgnore={() => {
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
      />
    )
  }, [] )

  const createGuardian = useCallback(
    async ( payload?: {isChangeTemp?: any, chosenContactTmp?: any} ) => {
      const isChangeKeeper = isChange ? isChange : payload && payload.isChangeTemp ? payload.isChangeTemp : false
      if( ( selectedKeeper.channelKey || isReshare ) && !isChangeKeeper ) return
      setIsGuardianCreationClicked( true )
      const channelKey: string = isChange ? BHROperations.generateKey( config.CIPHER_SPEC.keyLength ) : selectedKeeper.channelKey ? selectedKeeper.channelKey : BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
      setChannelKey( channelKey )

      const obj: KeeperInfoInterface = {
        shareId: selectedKeeper.shareId,
        name: 'Personal Copy',
        type: 'pdf',
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
    let channelKey: string

    if( contacts )
      for( const ck of Object.keys( contacts ) ){
        if ( contacts[ ck ].contactDetails.id === Contact.id ){
          channelKey = ck
          break
        }
      }

    if ( channelKey ) {
      dispatch( getPDFData( selectedKeeper.shareId, Contact, channelKey, isChange ) )
    }
  }, [ Contact, trustedContacts ] )

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
      props.navigation.navigate( 'SecondaryDeviceHistoryNewBHR', {
        ...props.navigation.state.params,
        selectedTitle: name,
        index: changeIndex,
        isChangeKeeperType: true,
      } )
    }
    if ( type == 'pdf' ) {
      // ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
      setPersonalCopyShareModal( true )
    }
  }
  const sendApprovalRequestToPK = ( ) => {
    setQrBottomSheetsFlag( true )
    setIsConfirm( false )
    // ( QrBottomSheet as any ).current.snapTo( 1 )
    setQRModal( true )
    // ( keeperTypeBottomSheet as any ).current.snapTo( 0 )
    setKeeperTypeModal( false )
  }

  const renderQrContent = () => {
    return (
      <QRModal
        isFromKeeperDeviceHistory={false}
        QRModalHeader={'QR scanner'}
        title={'Note'}
        infoText={'Open your PDF copy and scan the first QR for approval.'}
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={async( qrScannedData ) => {
          if( isConfirm ){
            dispatch( confirmPDFShared( selectedKeeper.shareId, qrScannedData ) )
            setQrBottomSheetsFlag( false )
            // ( QrBottomSheet as any ).current.snapTo( 0 )
            setQRModal( false )
            const popAction = StackActions.pop( {
              n: isChange ? 2 : 1
            } )
            props.navigation.dispatch( popAction )
          } else {
            dispatch( setApprovalStatus( false ) )
            dispatch( downloadSMShare( qrScannedData ) )
          }
        }}
        onBackPress={() => {
          setQrBottomSheetsFlag( false )
          // if ( QrBottomSheet ) ( QrBottomSheet as any ).current.snapTo( 0 )
          setQRModal( false )
        }}
        onPressContinue={async() => {
          if( isConfirm ) {
            const qrScannedData = '{"type":"RECOVERY_REQUEST","walletName":"Assa","channelId":"71a5d2b39c9396f8023c19070d70d0f78594d31d9eb137c524ab20ccc653b8f6","streamId":"def0d8970","channelKey":"lSiTUPAsqBCdgH6P6PzXzJ50","secondaryChannelKey":"lRm8RJ3vdm6dFvM6iNtrveoe","version":"1.9.5","walletId":"8a428172e0983cc1425aaaa122c74333022e9fad12bd30f28969659b03f2b3ed","encryptedKey":"6e8282c13d1f33cabad34fc8e5c91ad941944fa11e2207e907e6ef8b57c0966c092fd3e5bf5c99e7ed8a2dd3ac87eed377c31779f3c261927c415775dfed42c72ceb9d927c5fce69020b43c6ff71a635"}'
            dispatch( confirmPDFShared( selectedKeeper.shareId, qrScannedData ) )
            setQrBottomSheetsFlag( false )
            const popAction = StackActions.pop( {
              n: isChange ? 2 : 1
            } )
            props.navigation.dispatch( popAction )
          } else {
            setQRModal( false )
            const qrScannedData = '{"type":"RECOVERY_REQUEST","walletName":"Sadads","channelId":"189c1ef57ac3bddb906d3b4767572bf806ac975c9d5d2d1bf83d533e0c08f1c0","streamId":"4d2d8092d","secondaryChannelKey":"itwTFQ3AiIQWqfUlAUCuW03h","version":"1.8.0","walletId":"00cc552934e207d722a197bbb3c71330fc765de9647833e28c14447d010d9810"}'
            dispatch( setApprovalStatus( false ) )
            dispatch( downloadSMShare( qrScannedData ) )
          }
        }}
      />
    )
  }


  useEffect( ()=>{
    if( approvalStatus && isChangeClicked ){
      console.log( 'APPROVe' )
      setQRModal( false )
      onPressChangeKeeperType( selectedKeeperType, selectedKeeperName )
    }
  }, [ approvalStatus ] )

  useEffect( ()=>{
    if( isChange && channelAssets.shareId && channelAssets.shareId == selectedKeeper.shareId ){
      dispatch( setApprovalStatus( true ) )
    }
  }, [ channelAssets ] )

  const deviceText = ( text ) => {
    switch ( text ) {
        case 'Keeper PDF': return 'PDF Backup'

        default:
          return text
    }
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
        selectedTitle={deviceText( props.navigation.state.params.selectedTitle )}
        selectedTime={selectedKeeper.updatedAt
          ? getTime( selectedKeeper.updatedAt )
          : 'never'}
        moreInfo={deviceText( props.navigation.state.params.selectedTitle )}
        headerImage={require( '../../assets/images/icons/note.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          type={'copy'}
          IsReshare={isReshare}
          data={sortedHistory( personalCopyHistory )}
          confirmDisable={confirmDisable}
          onConfirm={ isReshare && ( selectedKeeper.status == 'notSetup' || selectedKeeper.status == 'notAccessible' ) ? ()=>{
            setIsConfirm( true )
            setQrBottomSheetsFlag( true )
            // ( QrBottomSheet as any ).current.snapTo( 1 )
            setQRModal( true )
          } : null}
          confirmButtonText={'Share Now'}
          onPressConfirm={() => {
            // ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
            setPersonalCopyShareModal( true )
          }}
          reshareButtonText={'Reshare'}
          onPressReshare={async () => {
            // ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
            setPersonalCopyShareModal( true )
          }}
          isChangeKeeperAllow={isChangeKeeperAllow}
          changeButtonText={'Change'}
          onPressChange={() => {
            // ( keeperTypeBottomSheet as any ).current.snapTo( 1 )
            setKeeperTypeModal( true )
          }}
        />
      </View>
      <ModalContainer visible={personalCopyShareModal} closeBottomSheet={() => {}} >
        {renderPersonalCopyShareModalContent()}
      </ModalContainer>
      <ModalContainer visible={errorModal} closeBottomSheet={() => {}} >
        {renderErrorModalContent()}
      </ModalContainer>

      <ModalContainer visible={HelpModal} closeBottomSheet={() => setHelpModal( false )} >
        {renderHelpContent()}
      </ModalContainer>
      <ModalContainer visible={keeperTypeModal} closeBottomSheet={() => {}} >
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
          keeper={selectedKeeper}
        />
      </ModalContainer>
      <ModalContainer visible={qrModal} closeBottomSheet={() => {}} >
        {renderQrContent()}
      </ModalContainer>
      <ModalContainer visible={storagePermissionModal} closeBottomSheet={()=>{}} >
        {renderStoragePermissionModalContent()}
      </ModalContainer>
    </View>
  )
}

export default PersonalCopyHistory

const styles = StyleSheet.create( {
} )
