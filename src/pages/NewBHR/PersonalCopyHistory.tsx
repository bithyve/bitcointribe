import AsyncStorage from '@react-native-async-storage/async-storage'
import { StackActions } from '@react-navigation/native'
import moment from 'moment'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  PermissionsAndroid, Platform, SafeAreaView,
  StatusBar, StyleSheet, View
} from 'react-native'
import {
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import BottomSheet from 'reanimated-bottom-sheet'
import _ from 'underscore'
import { v4 as uuid } from 'uuid'
import config from '../../bitcoin/HexaConfig'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import {
  ChannelAssets,
  KeeperInfoInterface,
  MetaShare,
  Trusted_Contacts,
  Wallet
} from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { isEmpty } from '../../common/CommonFunctions'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import { historyArray } from '../../common/CommonVars/commonVars'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'
import { getIndex } from '../../common/utilities'
import ErrorModalContents from '../../components/ErrorModalContents'
import PersonalCopyHelpContents from '../../components/Helper/PersonalCopyHelpContents'
import ModalContainer from '../../components/home/ModalContainer'
import {
  confirmPDFShared, createChannelAssets, createGuardian, downloadSMShare, emptyShareTransferDetailsForContactChange, getPDFData, keeperProcessStatus, pdfSuccessfullyCreated, setApprovalStatus, setChannelAssets, setPdfUpgrade, updatedKeeperInfo,
  updateMSharesHealth
} from '../../store/actions/BHR'
import { setIsPermissionGiven } from '../../store/actions/preferences'
import QRModal from '../Accounts/QRModal'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import HistoryPageComponent from './HistoryPageComponent'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import PersonalCopyShareModal from './PersonalCopyShareModal'

export type Props = {
  route: any;
  navigation: any;
};

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
  const selectedPersonalCopy = props.route.params.selectedPersonalCopy
  const [ oldChannelKey, setOldChannelKey ] = useState( props.route.params.selectedKeeper.channelKey ? props.route.params.selectedKeeper.channelKey : '' )
  const [ channelKey, setChannelKey ] = useState( props.route.params.selectedKeeper.channelKey ? props.route.params.selectedKeeper.channelKey : '' )
  const [ personalCopyDetails, setPersonalCopyDetails ] = useState( null )
  const [ SelectedRecoveryKeyNumber, setSelectedRecoveryKeyNumber ] = useState(
    props.route.params?.SelectedRecoveryKeyNumber
  )
  const [ selectedKeeper, setSelectedKeeper ] = useState(
    props.route.params?.selectedKeeper
  )
  const [ isReshare, setIsReshare ] = useState( props.route.params.isChangeKeeperType ? false :
    props.route.params.selectedKeeper.status === 'notSetup' ? false : true
  )
  const levelData = useSelector( ( state ) => state.bhr.levelData )

  const currentLevel = useSelector( ( state ) => state.bhr.currentLevel )
  const keeperInfo = useSelector( ( state ) => state.bhr.keeperInfo )
  const pdfInfo = useSelector( ( state ) => state.bhr.pdfInfo )
  const [ isChange, setIsChange ] = useState( props.route.params.isChangeKeeperType
    ?  props.route.params.isChangeKeeperType
    : false )
  const wallet: Wallet = useSelector( ( state ) => state.storage.wallet )
  const pdfDataConfirm = useSelector( ( state ) => state.bhr.loading.pdfDataConfirm )
  const pdfCreatedSuccessfully = useSelector( ( state ) => state.bhr.pdfCreatedSuccessfully )
  const [ confirmDisable, setConfirmDisable ] = useState( true )
  const [ isChangeKeeperAllow, setIsChangeKeeperAllow ] = useState( props.route.params.isChangeKeeperType  ? false : props.route.params.isChangeKeeperAllow )
  const metaSharesKeeper = useSelector( ( state ) => state.bhr.metaSharesKeeper )
  const oldMetaSharesKeeper = useSelector( ( state ) => state.bhr.oldMetaSharesKeeper )

  const MetaShares: MetaShare[] = [ ...metaSharesKeeper ]
  const OldMetaShares: MetaShare[] = [ ...oldMetaSharesKeeper ]
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
  const pdfUpgrade = useSelector( ( state ) => state.bhr.pdfUpgrade )
  const [ pdfUpgradeModal, setPdfUpgradeModal ] = useState( false )

  useEffect( () => {
    setSelectedRecoveryKeyNumber( props.route.params.SelectedRecoveryKeyNumber )
    setSelectedKeeper( props.route.params.selectedKeeper )
    setIsReshare(
      props.route.params.isChangeKeeperType ? false : props.route.params.selectedKeeper.status === 'notSetup' ? false : true
    )
    setIsChange(
      props.route.params.isChangeKeeperType
        ? props.route.params.isChangeKeeperType
        : false
    )
    if( !channelAssets.shareId || ( channelAssets.shareId && channelAssets.shareId != props.route.params.selectedKeeper.shareId ) ){
      dispatch( createChannelAssets( props.route.params.selectedKeeper.shareId ) )
    }
  }, [
    props.route.params
  ] )

  useEffect( ()=>{
    if( pdfUpgrade ){
      setPdfUpgradeModal( true )
    }
    const Contact = {
      id: uuid(),
      name: 'Personal Copy'
    }
    setContact( props.route.params.isChangeKeeperType || pdfUpgrade ? Contact : selectedKeeper.data && selectedKeeper.data.id ? selectedKeeper.data : Contact )
  }, [ ] )

  const sendApprovalRequestToPK = ( ) => {
    setQrBottomSheetsFlag( true )
    setIsConfirm( false )
    setQRModal( true )
    setKeeperTypeModal( false )
  }

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
    if( hasStoragePermission && props.route.params.selectedKeeper.status === 'notSetup' ){
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
  //
  //   }
  // };

  const generatePDF = async() => {
    initiateGuardianCreation( )
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
      setPersonalCopyShareModal( true )
      dispatch( setChannelAssets ( {
      }, null ) )
      dispatch( pdfSuccessfullyCreated( false ) )
      dispatch( setPdfUpgrade( false ) )
      // }
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
            walletId: wallet.walletId,
            shareId: selectedKeeper.shareId,
            reshareVersion: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ?
              MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion:
              OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId )?
                OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion: 0,
            shareType: 'pdf',
            status: selectedKeeper.updatedAt > 0 ? selectedKeeper.status : 'notAccessible',
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
              props.route.params.prevKeeperType &&
              props.route.params.isChange &&
              props.route.params.contactIndex &&
              props.route.params.prevKeeperType ==='contact'&&
              props.route.params.contactIndex !== null
            ) {
              dispatch(
                emptyShareTransferDetailsForContactChange(
                  props.route.params.contactIndex
                )
              )
            }
            setIsReshare( true )
            if( props.route.params.isChangeKeeperType ){
              props.navigation.pop( 2 )
            } else {
              props.navigation.pop( 1 )
            }
          } catch ( err ) {
            dispatch( keeperProcessStatus( '' ) )
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
        title={'Why does the wallet need access to your files and storage?'}
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
        isBottomImageStyle={{
          width: wp( '29%' ),
          height: wp( '30%' ),
          marginLeft: 'auto',
          resizeMode: 'stretch',
          marginRight: wp( -2 ),
          marginBottom: wp( -2 ),
        }}
        bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
      />
    )
  }, [] )

  const initiateGuardianCreation = useCallback(
    async ( payload?: {isChangeTemp?: any, chosenContactTmp?: any} ) => {
      const isChangeKeeper = isChange ? isChange : payload && payload.isChangeTemp ? payload.isChangeTemp : false
      if( ( selectedKeeper.channelKey || isReshare ) && !isChangeKeeper && !pdfUpgrade ) return
      setIsGuardianCreationClicked( true )
      const channelKey: string = isChange || pdfUpgrade ? BHROperations.generateKey( config.CIPHER_SPEC.keyLength ) : selectedKeeper.channelKey ? selectedKeeper.channelKey : BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
      setChannelKey( channelKey )

      const obj: KeeperInfoInterface = {
        shareId: selectedKeeper.shareId,
        name: 'Personal Copy',
        type: 'pdf',
        scheme: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ? MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.scheme : OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ? OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.scheme : '2of3',
        currentLevel: currentLevel,
        createdAt: moment( new Date() ).valueOf(),
        sharePosition: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ?
          MetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId ) :
          OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ?
            OldMetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId ) :
            2,
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
    if( isGuardianCreationClicked && !createChannelAssetsStatus && !isEmpty( channelAssets ) && channelAssets.shareId == selectedKeeper.shareId ){
      dispatch( createGuardian( {
        channelKey, shareId: selectedKeeper.shareId, contact: Contact, isChangeKeeper: isChange, oldChannelKey
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

    if ( channelKey && isGuardianCreationClicked ) {
      setIsGuardianCreationClicked( false )
      dispatch( getPDFData( selectedKeeper.shareId, Contact, channelKey, isChange ) )
    }
  }, [ Contact, trustedContacts ] )

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
        channelKey: selectedKeeper.channelKey
      },
      index: changeIndex,
    }
    if( type == 'cloud' ){
      props.navigation.navigate( 'CloudBackupHistory', {
        ...navigationParams,
        isChangeKeeperType: true,
      } )
    }
    if ( type == 'contact' ) {
      props.navigation.navigate( 'TrustedContactHistoryNewBHR', {
        ...navigationParams,
        isChangeKeeperType: true,
      } )
    }
    if ( type == 'device' ) {
      props.navigation.navigate( 'SecondaryDeviceHistoryNewBHR', {
        ...navigationParams,
        isChangeKeeperType: true,
      } )
    }
    if ( type == 'pdf' ) {
      props.navigation.navigate( 'PersonalCopyHistoryNewBHR', {
        ...navigationParams,
        isChangeKeeperType: true,
      } )
      // initiateGuardianCreation()
    }
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
            const popAction = StackActions.pop( isChange ? 2 : 1 )
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
        onPressContinue={() => {}}
      />
    )
  }

  useEffect( ()=>{
    if( approvalStatus && isChangeClicked ){
      setQRModal( false )
      onPressChangeKeeperType( 'pdf', selectedKeeperName )
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

  const renderPdfUpgradeModal = useCallback( () => {
    return (
      <ErrorModalContents
        // modalRef={ErrorBottomSheet}
        title={'Upgrade PDF'}
        info={'You need to re-share your PDF as there seems to be some issue'}
        proceedButtonText={'Proceed'}
        onPressProceed={() => {
          setIsChangeClicked( true )
          dispatch( pdfSuccessfullyCreated( false ) )
          setQRModal( true )
          // initiateGuardianCreation( )
          setPdfUpgradeModal( false )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ errorMessage, errorMessageHeader ] )

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
        selectedTitle={deviceText( props.route.params?.selectedTitle )}
        selectedTime={selectedKeeper.updatedAt
          ? getTime( selectedKeeper.updatedAt )
          : 'Never'}
        moreInfo={deviceText( props.route.params?.selectedTitle )}
        headerImage={require( '../../assets/images/icons/note.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          showButton={true}
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
          isChangeKeeperAllow={false}
          changeButtonText={'Change'}
          onPressChange={() => {
            // ( keeperTypeBottomSheet as any ).current.snapTo( 1 )
            setKeeperTypeModal( true )
          }}
        />
      </View>
      <ModalContainer onBackground={()=>setPersonalCopyShareModal( false )} visible={personalCopyShareModal} closeBottomSheet={() => setPersonalCopyShareModal( false )} >
        {renderPersonalCopyShareModalContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setErrorModal( false )} visible={errorModal} closeBottomSheet={() => setErrorModal( false )} >
        {renderErrorModalContent()}
      </ModalContainer>

      <ModalContainer onBackground={()=>setHelpModal( false )} visible={HelpModal} closeBottomSheet={() => setHelpModal( false )} >
        {renderHelpContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setKeeperTypeModal( false )} visible={keeperTypeModal} closeBottomSheet={() => setKeeperTypeModal( false )} >
        <KeeperTypeModalContents
          selectedLevelId={props.route.params.selectedLevelId}
          headerText={'Change backup method'}
          subHeader={'Share your Recovery Key with a new contact or a different device'}
          onPressSetup={async ( type, name ) => {
            setSelectedKeeperType( type )
            setSelectedKeeperName( name )
            // note remove PDF flow for level 2 & 3
            // if( type == 'pdf' ) { setIsChangeClicked( true ); sendApprovalRequestToPK( ) }
            // else
            onPressChangeKeeperType( type, name )
          }}
          onPressBack={() => setKeeperTypeModal( false )}
          keeper={selectedKeeper}
        />
      </ModalContainer>
      <ModalContainer onBackground={()=>setQRModal( false )} visible={qrModal} closeBottomSheet={() => setQRModal( false )} >
        {renderQrContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setStoragePermissionModal( false )} visible={storagePermissionModal} closeBottomSheet={()=> setStoragePermissionModal( false )} >
        {renderStoragePermissionModalContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setPdfUpgradeModal( false )} visible={pdfUpgradeModal} closeBottomSheet={()=> setPdfUpgradeModal( false )} >
        {renderPdfUpgradeModal()}
      </ModalContainer>
    </View>
  )
}

export default PersonalCopyHistory

const styles = StyleSheet.create( {
} )
