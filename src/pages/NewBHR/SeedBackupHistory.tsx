import moment from 'moment'
import React, { createRef, useCallback, useEffect, useState } from 'react'
import {
  Platform, SafeAreaView,
  StatusBar, View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import BottomSheet from 'reanimated-bottom-sheet'
import _ from 'underscore'
import { KeeperType, LevelHealthInterface } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import { translations } from '../../common/content/LocContext'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { getIndex } from '../../common/utilities'
import AlertModalContents from '../../components/AlertModalContents'
import CloudPermissionModalContents from '../../components/CloudPermissionModalContents'
import ErrorModalContents from '../../components/ErrorModalContents'
import BottomInputModalContainer from '../../components/home/BottomInputModalContainer'
import ModalContainer from '../../components/home/ModalContainer'
import ModalHeader from '../../components/ModalHeader'
import dbManager from '../../storage/realm/dbManager'
import { updateCloudPermission, updateSeedHealth } from '../../store/actions/BHR'
import { setCloudErrorMessage, updateCloudData } from '../../store/actions/cloud'
import ConfirmSeedWordsModal from './ConfirmSeedWordsModal'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import HistoryPageComponent from './HistoryPageComponent'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import SeedBacupModalContents from './SeedBacupModalContents'

export enum BottomSheetKind {
  CLOUD_PERMISSION,
  HEALTH_CHECK
}

export enum BottomSheetState {
  Closed,
  Open,
}

const SeedBackupHistory = ( props ) => {
  const strings  = translations[ 'bhr' ]
  const common  = translations[ 'common' ]
  const iCloudErrors  = translations[ 'iCloudErrors' ]
  const driveErrors  = translations[ 'driveErrors' ]

  const [ seedBackupHistory, setSeedBackupHistory ] = useState( [] )
  const [ confirmationModal, setConfirmationModal ] = useState( false )
  const [ errorModal, setErrorModal ] = useState( false )
  const [
    bottomSheetRef,
    setBottomSheetRef,
  ] = useState( React.createRef() )
  const HealthCheckSuccessBottomSheet = createRef<BottomSheet>()
  const seedBackupHistoryArray = useSelector( ( state ) => state.bhr.seedBackupHistory )

  const cloudErrorMessage = useSelector( ( state ) => state.cloud.cloudErrorMessage )
  const [ errorMsg, setErrorMsg ] = useState( '' )
  const cloudBackupStatus = useSelector( ( state ) => state.cloud.cloudBackupStatus || CloudBackupStatus.PENDING, )
  const [ cloudBackupInitiated, setCloudBackupInitiated ] = useState( false )
  const currentLevel = useSelector( ( state ) => state.bhr.currentLevel )
  const levelHealth: LevelHealthInterface[] = useSelector( ( state ) => state.bhr.levelHealth )
  const dispatch = useDispatch()
  const [ backupInfo, setBackupInfo ] = useState( '' )
  const [ buttonText, setButtonText ] = useState( common.backup )
  const [ showButton, setShowButton ] = useState( false )
  const [ keeperTypeModal, setKeeperTypeModal ] = useState( false )
  const levelData = useSelector( ( state ) => state.bhr.levelData )
  const  keeperInfo = useSelector( ( state ) => state.bhr.keeperInfo )
  const SelectedRecoveryKeyNumber = props.route.params?.SelectedRecoveryKeyNumber
  const selectedKeeper = props.route.params?.selectedKeeper
  const [ seedWordModal, setSeedWordModal ] = useState( false )
  const [ confirmSeedWordModal, setConfirmSeedWordModal ] = useState( false )
  const [ seedRandomNumber, setSeedRandomNumber ] = useState( [] )
  const [ seedData, setSeedData ] = useState( [] )
  const [ seedPosition, setSeedPosition ] = useState( 0 )
  const [ showAlertModal, setShowAlertModal ] = useState( false )
  const [ seedBackupModal, setSeedBackupModal ] = useState( false )
  const [ info, setInfo ] = useState( '' )
  const sortedHistory = ( history ) => {
    if( !history ) return
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

  useEffect( ()=>{
    setInfoOnBackup()

    //set random number
    const i = 12, ranNums = []
    for( let j=0; j<2; j++ ){
      const tempNumber = ( Math.floor( Math.random() * ( i ) ) )
      if( ranNums.length == 0 || ( ranNums.length > 0 && ranNums[ j ] != tempNumber ) ){
        if( tempNumber == undefined || tempNumber == 0 )
          ranNums.push( 1 )
        else ranNums.push( tempNumber )
      } else j--
    }
    setSeedRandomNumber( ranNums )

    if ( ( levelHealth.length == 0 ) ||
    ( levelHealth.length && levelHealth[ 0 ].levelInfo.length &&
      levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' )  ||
      ( levelHealth.length && levelHealth[ 0 ].levelInfo.length &&
        levelHealth[ 0 ].levelInfo[ 0 ].shareType == KeeperType.SECURITY_QUESTION ) ) {
      setSeedBackupModal( true )
    }
  }, [] )

  useEffect( () =>{
    if( cloudBackupInitiated && cloudBackupStatus === CloudBackupStatus.COMPLETED ) props.navigation.popToTop()
  }, [ cloudBackupStatus, cloudBackupInitiated ] )

  const setInfoOnBackup = () =>{
    // if( levelHealth[ 0 ] && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 1 ].status == 'accessible' && currentLevel > 0 ){
    if( levelHealth[ 0 ] && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status == 'accessible' ){
      setButtonText( common.backup )
      setShowButton( true )
      setBackupInfo( Platform.OS == 'ios' ? strings.cloudBackupSuccessInfo : strings.driveBackupSuccessInfo )
    } else if( currentLevel == 0 ) {
      setButtonText( common.backup )
      setShowButton( true )
      setBackupInfo( Platform.OS == 'ios' ? strings.cloudBackupNotSetupInfo : strings.driveBackupNotSetupInfo )
    } else if( currentLevel > 0 && levelHealth[ 0 ].levelInfo[ 1 ].status == 'notAccessible' ) {
      setButtonText( common.confirm )
      setShowButton( true )
      setBackupInfo( strings.cloudBackupInAccessibleInfo )
    }
  }

  useEffect( ()=>{
    setInfoOnBackup()
  }, [ levelHealth ] )

  useEffect( () => {
    if ( seedBackupHistoryArray ) setSeedBackupHistory( seedBackupHistoryArray )
  }, [ seedBackupHistoryArray ] )

  useEffect( () => {
    if ( cloudErrorMessage !== '' ) {
      const message = Platform.select( {
        ios: iCloudErrors[ cloudErrorMessage ],
        android: driveErrors[ cloudErrorMessage ],
      } )
      setErrorMsg( message )
      setErrorModal( true )
      dispatch( setCloudErrorMessage( '' ) )
    }
  }, [ cloudErrorMessage ] )

  const renderCloudErrorContent = useCallback( () => {
    return (
      <ErrorModalContents
        title={strings.CloudBackupError}
        //info={cloudErrorMessage}
        note={errorMsg}
        onPressProceed={()=>{
          setErrorModal( false )
          setConfirmationModal( true )
        }}
        onPressIgnore={()=> {
          setErrorModal( false )
        }}
        proceedButtonText={common.tryAgain}
        cancelButtonText={common.skip}
        isIgnoreButton={true}
        isBottomImage={true}
        isBottomImageStyle={{
          width: wp( '27%' ),
          height: wp( '27%' ),
          marginLeft: 'auto',
          resizeMode: 'stretch',
          marginBottom: hp( '-3%' ),
        }}
        bottomImage={require( '../../assets/images/icons/cloud_ilustration.png' )}
      />
    )
  }, [ errorMsg ] )

  const renderCloudPermissionContent = useCallback( () => {
    return ( <CloudPermissionModalContents
      modalRef={bottomSheetRef}
      title={Platform.OS == 'ios' ? strings.AutomatedCloudBackup : strings.AutomatedDriveBackup}
      // info={strings.Thisisthefirstlevel}
      info={strings.Backupthewalletto}
      note={''}
      onPressProceed={( flag )=> {
        setConfirmationModal( false )
        dispatch( updateCloudPermission( flag ) )
        dispatch( updateCloudData() )
        setCloudBackupInitiated( true )
      }}
      onPressIgnore={( flag )=> {
        setConfirmationModal( false )
        dispatch( updateCloudPermission( flag ) )
      }}
      autoClose={()=>{
        setConfirmationModal( false )
        dispatch( updateCloudPermission( true ) )
      }}
      bottomImage={require( '../../assets/images/icons/cloud_ilustration.png' )}
    /> )
  }, [] )

  const renderHealthCheckSuccessModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={HealthCheckSuccessBottomSheet}
        title={strings.HealthCheckSuccessful}
        info={strings.QuestionBackedUp}
        note={''}
        proceedButtonText={strings.ViewHealth}
        isIgnoreButton={false}
        onPressProceed={() => {
          ( HealthCheckSuccessBottomSheet as any ).current.snapTo( 0 )
          props.navigation.goBack()
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/success.png' )}
      />
    )
  }, [] )

  const renderHealthCheckSuccessModalHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (HealthCheckSuccessBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  const onPressChangeKeeperType = ( type, name ) => {
    selectedKeeper.shareType = type
    selectedKeeper.name = name
    const changeIndex = getIndex( levelData, type, selectedKeeper, keeperInfo )
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
        channelKey: selectedKeeper.channelKey,
      },
      selectedLevelId: props.route.params?.selectedLevelId,
      index: changeIndex,
    }
    if ( type == 'contact' ) {
      props.navigation.goBack()
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
    }
    if( type == 'cloud' ){
      props.navigation.navigate( 'CloudBackupHistory', {
        ...navigationParams,
        isChangeKeeperType: true,
      } )
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
        onPressBack={() => {
          // props.navigation.navigate( 'MoreOptionsContainerScreen' )
          props.navigation.popToTop()
        }}
        selectedTitle={'Wallet backup'}
        selectedTime={selectedKeeper?.updatedAt
          ? getTime( selectedKeeper?.updatedAt )
          : 'Never'}
        moreInfo={''}
        tintColor={Colors.blue}
        headerImage={require( '../../assets/images/icons/seedwords.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          infoBoxTitle={strings.BackupHistory}
          infoBoxInfo={backupInfo}
          type={'security'}
          onPressConfirm={() => {
            // ( bottomSheetRef as any ).current.snapTo( 1 )
            // setConfirmationModal( true )
            // props.navigation.navigate( 'BackupSeedWordsContent', {
            // fromHistory: true
            // } )
            const dbWallet =  dbManager.getWallet()
            const walletObj = JSON.parse( JSON.stringify( dbWallet ) )
            const primaryMnemonic = walletObj.primaryMnemonic
            const seed = primaryMnemonic.split( ' ' )
            const seedData = seed.map( ( word, index ) => {
              return {
                name: word, id: ( index+1 )
              }
            } )

            // let seed = ''
            // seedData.forEach( ( { name } ) => {
            //   if( !seed ) seed = name
            //   else seed = seed + ' ' + name
            // } )
            setSeedPosition( 0 )
            setSeedData( seedData )

            setTimeout( () => {
              setConfirmSeedWordModal( true )
            }, 1000 )
          }}
          data={seedBackupHistory.length ? sortedHistory( seedBackupHistory ) : []}
          confirmButtonText={'Confirm'}
          disableChange={props.route.params?.from === 'receive'}
          onPressReshare={() => {
            // ( cloudBackupBottomSheet as any ).current.snapTo( 1 )
          }}
          // onPressChange={() => setKeeperTypeModal( true )}
          onPressChange={() => {
            props.navigation.navigate( 'CheckPasscode', {
              backupType: 'seed'
            } )
          }}
          showButton={showButton}
          changeButtonText={'Forgot'}
          showSeedHistoryNote={true}
          isChangeKeeperAllow={true}
        />
      </View>
      <ModalContainer onBackground={()=>setConfirmationModal( false )} visible={confirmationModal} closeBottomSheet={() => {}}>
        {renderCloudPermissionContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setErrorModal( false )} visible={errorModal} closeBottomSheet={() => {setErrorModal( false )}}>
        {renderCloudErrorContent()}
      </ModalContainer>
      {/* <BottomSheet
        enabledInnerScrolling={true}
        ref={bottomSheetRef as any}
        snapPoints={[ -30, Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '40%' ) : hp( '35%' ), ]}
        renderContent={renderCloudPermissionContent}
        renderHeader={renderCloudPermissionHeader}
      /> */}
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={HealthCheckSuccessBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '27%' ) : hp( '35%' ),
        ]}
        renderContent={renderHealthCheckSuccessModalContent}
        renderHeader={renderHealthCheckSuccessModalHeader}
      />
      <ModalContainer onBackground={()=>setKeeperTypeModal( false )} visible={keeperTypeModal} closeBottomSheet={() => {setKeeperTypeModal( false )}} >
        <KeeperTypeModalContents
          selectedType={'seed'}
          selectedLevelId={props.route.params?.selectedLevelId}
          headerText={'Change backup method'}
          subHeader={'Share your Recovery Key with a new contact or a different device or Cloud'}
          onPressSetup={async ( type, name ) => {
            onPressChangeKeeperType( type, name )
          }}
          onPressBack={() => setKeeperTypeModal( false )}
          keeper={selectedKeeper}
          isCloud={true}
        />
      </ModalContainer>
      <BottomInputModalContainer onBackground={() => setConfirmSeedWordModal( false )} visible={confirmSeedWordModal}
        closeBottomSheet={() => setConfirmSeedWordModal( false )} >
        <ConfirmSeedWordsModal
          proceedButtonText={'Next'}
          seedNumber={seedRandomNumber ? seedRandomNumber[ seedPosition ] : 0}
          onPressProceed={( word ) => {
            setConfirmSeedWordModal( false )
            if( word == '' ){
              setTimeout( () => {
                setInfo( 'Please enter backup phrase' )
                setShowAlertModal( true )
              }, 500 )
            } else if( word !=  seedData[ ( seedRandomNumber[ seedPosition ]-1 ) ].name  ){
              setTimeout( () => {
                setInfo( 'Please enter valid backup phrase' )
                setShowAlertModal( true )
              }, 500 )
            } else {
              setSeedWordModal( true )
              dispatch( updateSeedHealth() )
              // dispatch(setSeedBackupHistory())

              // props.navigation.navigate( 'BackupSeedWordsContent' )

              // AsyncStorage.setItem( 'walletBackupDate', JSON.stringify( moment( Date() ) ) )

            // const a = moment( moment( Date() ) )
            // const b = moment( '2022-10-10T11:27:25.000Z' )
            }
          }}
          bottomBoxInfo={false}
          onPressIgnore={() => {
            setConfirmSeedWordModal( false )
            // props.navigation.navigate( 'BackupSeedWordsContent' )
            // props.navigation.navigate( 'CheckPasscode' )
          }}
          isIgnoreButton={true}
          cancelButtonText={'Cancel'}
        />
      </BottomInputModalContainer>
      <ModalContainer onBackground={() => setSeedWordModal( false )} visible={seedWordModal}
        closeBottomSheet={() => setSeedWordModal( false )}>
        <SeedBacupModalContents
          title={'Backup phrase\nSuccessful'}
          info={'You have successfully confirmed your backup\n\nMake sure you store the words in a safe place. The app will request you to confirm the words periodically to ensure you have the access'}
          proceedButtonText={'View Health'}
          onPressProceed={() => {
            setSeedWordModal( false )
            // props.navigation.goBack()
            // setInfo( 'please delete icloud backup' )
            // setShowAlertModal( true )
          }}
          onPressIgnore={() => setSeedWordModal( false )}
          isIgnoreButton={false}
          isBottomImage={true}
          bottomImage={require( '../../assets/images/icons/success.png' )}
        />
      </ModalContainer>
      <ModalContainer onBackground={()=>{setShowAlertModal( false )}} visible={showAlertModal} closeBottomSheet={() => { }}>
        <AlertModalContents
          // modalRef={this.ErrorBottomSheet}
          // title={''}
          info={info}
          proceedButtonText={'Okay'}
          onPressProceed={() => {
            setShowAlertModal( false )
          }}
          isBottomImage={false}
          // bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
      <ModalContainer onBackground={() => setSeedBackupModal( false )} visible={seedBackupModal}
        closeBottomSheet={() => setSeedBackupModal( false )}>
        <SeedBacupModalContents
          // title={'Backup using \nSeed Words'}
          title={'Backup Phrase (Seed Words)'}
          // info={'You will be shown 12 English words that you need to write down privately\n\nMake sure you keep them safe'}
          info={'Make sure you note down the twelve-word phrase in private and keep it secure.\n'}
          note={'If someone gets access to these, they can withdraw all the funds. If you lose them, you will not be able to restore the wallet.'}
          proceedButtonText={'Proceed'}
          bottomBoxInfo={true}
          cancelButtonText={'Cancel'}
          onPressProceed={() => {
            setSeedBackupModal( false )
            props.navigation.navigate( 'BackupSeedWordsContent' )
          }}
          onPressIgnore={() => {
            setSeedBackupModal( false )
            props.navigation.goBack()
            // props.navigation.navigate( 'MoreOptionsContainerScreen' )
          }}
          isIgnoreButton={true}
        />
      </ModalContainer>
    </View>
  )
}
export default SeedBackupHistory


