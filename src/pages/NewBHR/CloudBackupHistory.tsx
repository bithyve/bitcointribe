import React, { useState, useEffect, useCallback, createRef } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useDispatch } from 'react-redux'
import Colors from '../../common/Colors'
import moment from 'moment'
import _ from 'underscore'
import HistoryPageComponent from './HistoryPageComponent'
import ModalHeader from '../../components/ModalHeader'
import { updateCloudPermission } from '../../store/actions/BHR'
import DeviceInfo from 'react-native-device-info'
import { useSelector } from 'react-redux'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import CloudPermissionModalContents from '../../components/CloudPermissionModalContents'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { updateCloudData, setCloudErrorMessage } from '../../store/actions/cloud'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalContainer from '../../components/home/ModalContainer'
import ErrorModalContents from '../../components/ErrorModalContents'
import { translations } from '../../common/content/LocContext'
import { KeeperType, LevelHealthInterface } from '../../bitcoin/utilities/Interface'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import { getIndex } from '../../common/utilities'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import AlertModalContents from '../../components/AlertModalContents'

export enum BottomSheetKind {
  CLOUD_PERMISSION,
  HEALTH_CHECK
}

export enum BottomSheetState {
  Closed,
  Open,
}

const CloudBackupHistory = ( props ) => {
  const strings  = translations[ 'bhr' ]
  const common  = translations[ 'common' ]
  const iCloudErrors  = translations[ 'iCloudErrors' ]
  const driveErrors  = translations[ 'driveErrors' ]

  const [ cloudBackupHistory, setCloudBackupHistory ] = useState( [] )
  const [ confirmationModal, setConfirmationModal ] = useState( false )
  const [ errorModal, setErrorModal ] = useState( false )
  const [ passwordModal, setPasswordModal ] = useState( false )
  const [
    bottomSheetRef,
    setBottomSheetRef,
  ] = useState( React.createRef() )
  const HealthCheckSuccessBottomSheet = createRef<BottomSheet>()
  const cloudBackupHistoryArray = useSelector( ( state ) => state.cloud.cloudBackupHistory )

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
  const [ showAlertModal, setShowAlertModal ]=useState( false )
  const levelData = useSelector( ( state ) => state.bhr.levelData )
  const  keeperInfo = useSelector( ( state ) => state.bhr.keeperInfo )
  const SelectedRecoveryKeyNumber = props.route.params?.SelectedRecoveryKeyNumber
  const selectedKeeper = props.route.params?.selectedKeeper
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
  }, [] )

  useEffect( () =>{
    if( cloudBackupInitiated && cloudBackupStatus === CloudBackupStatus.COMPLETED ) setShowAlertModal( true )
  }, [ cloudBackupStatus, cloudBackupInitiated ] )

  const setInfoOnBackup = () =>{
    if( levelHealth[ 0 ] && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 1 ].status == 'accessible' && currentLevel > 0 ){
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
      setBackupInfo( Platform.OS == 'ios' ? strings.cloudBackupInAccessibleInfo : strings.driveBackupInAccessibleInfo )
    }
  }

  useEffect( ()=>{
    setInfoOnBackup()
  }, [ levelHealth ] )

  useEffect( () => {
    console.log( cloudBackupHistoryArray )
    if ( cloudBackupHistoryArray ) setCloudBackupHistory( cloudBackupHistoryArray )
  }, [ cloudBackupHistoryArray ] )

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
        channelKey: selectedKeeper.channelKey
      },
      index: changeIndex,
      selectedLevelId: props.route.params?.selectedLevelId
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
    if ( type == 'seed' ) {
      props.navigation.navigate( 'BackupSeedWordsContent', {
        ...navigationParams,
        isChangeKeeperType: true,
      } )
    }
  }

  const onEncryptionPasswordClick = () =>{
    if( levelData.length > 0 && levelData[ 0 ].keeper1.shareType == KeeperType.SECURITY_QUESTION ){
      const navigationParams = {
        selectedTitle: selectedKeeper.name,
        SelectedRecoveryKeyNumber,
        selectedKeeper,
        selectedLevelId: 1
      }
      props.navigation.navigate( 'SecurityQuestionHistoryNewBHR', navigationParams )
    } else {
      props.navigation.navigate( 'SetNewPassword' )
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
          // props.navigation.goBack()
          props.navigation.popToTop()
        }}
        selectedTitle={Platform.OS == 'ios' ? 'iCloud Backup' : 'Google Drive Backup'}
        selectedTime={selectedKeeper.updatedAt
          ? getTime( selectedKeeper.updatedAt )
          : 'Never'}
        moreInfo={''}
        tintColor={Colors.deepBlue}
        headerImage={require( '../../assets/images/icons/ico_cloud_backup.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          infoBoxTitle={Platform.OS == 'ios' ? strings.BackupHistory : strings.BackupHistorydrive}
          infoBoxInfo={backupInfo}
          type={'security'}
          onPressConfirm={() => {
            // ( bottomSheetRef as any ).current.snapTo( 1 )
            if( levelData.length > 0 && levelData[ 0 ].keeper1.shareType == KeeperType.SECURITY_QUESTION ){
              setConfirmationModal( true )
            } else {
              setPasswordModal( true )
            }
          }}
          data={cloudBackupHistory.length ? sortedHistory( cloudBackupHistory ) : []}
          confirmButtonText={buttonText}
          disableChange={false}
          onPressReshare={() => {
            // ( cloudBackupBottomSheet as any ).current.snapTo( 1 )
          }}
          onPressChange={() => setKeeperTypeModal( true )}
          showButton={showButton}
          changeButtonText={'Change'}
          isChangeKeeperAllow={( levelData.length > 1 && levelData[ 1 ].keeper1.shareType != '' ) ? false : true }
          showSecurityPassword={true}
          // showSecurityPassword={false}
          onEncryptionPasswordClick={onEncryptionPasswordClick}
          // isChangeKeeperAllow={false}
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
          selectedType='cloud'
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
      <ModalContainer onBackground={() => setPasswordModal( false )} visible={passwordModal} closeBottomSheet={() => setPasswordModal( false )}>
        <ErrorModalContents
          title={strings[ 'PleaseSetPasswordTitle' ]}
          info={strings[ 'PleaseSetPasswordInfo' ]}
          proceedButtonText={'Proceed To Password'}
          cancelButtonText={'Got it'}
          isIgnoreButton={true}
          onPressProceed={() => {
            setPasswordModal( false )
            onEncryptionPasswordClick()
          }}
          onPressIgnore={() => setPasswordModal( false )}
          isBottomImage={true}
          bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
      <ModalContainer onBackground={()=>{setShowAlertModal( false )}} visible={showAlertModal} closeBottomSheet={() => { }}>
        <AlertModalContents
          // modalRef={this.ErrorBottomSheet}
          // title={''}
          info={'Cloud backup is completed you can delete Backup Phrase'}
          proceedButtonText={'Okay'}
          onPressProceed={() => {
            setShowAlertModal( false )
            props.navigation.popToTop()
          }}
          isBottomImage={false}
          // bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
    </View>
  )
}
export default CloudBackupHistory


