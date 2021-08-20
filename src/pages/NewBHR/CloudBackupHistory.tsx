import React, { useState, useEffect, useCallback, createRef } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Keyboard,
} from 'react-native'
import Fonts from '../../common/Fonts'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useDispatch } from 'react-redux'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import moment from 'moment'
import _ from 'underscore'
import HistoryPageComponent from './HistoryPageComponent'
import ModalHeader from '../../components/ModalHeader'
import { updateCloudPermission } from '../../store/actions/BHR'
import DeviceInfo from 'react-native-device-info'
import {
  checkMSharesHealth,
} from '../../store/actions/BHR'
import { useSelector } from 'react-redux'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import CloudPermissionModalContents from '../../components/CloudPermissionModalContents'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { getLevelInfo } from '../../common/CommonFunctions'
import { setCloudData, setCloudErrorMessage } from '../../store/actions/cloud'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalContainer from '../../components/home/ModalContainer'
import { LevelHealthInterface } from '../../bitcoin/utilities/Interface'
import ErrorModalContents from '../../components/ErrorModalContents'

export enum BottomSheetKind {
  CLOUD_PERMISSION,
  HEALTH_CHECK
}

export enum BottomSheetState {
  Closed,
  Open,
}

const CloudBackupHistory = ( props ) => {
  const [ cloudBackupHistory, setCloudBackupHistory ] = useState( [] )
  const [ confirmationModal, setConfirmationModal ] = useState( false )
  const [ errorModal, setErrorModal ] = useState( false )
  const [
    bottomSheetRef,
    setBottomSheetRef,
  ] = useState( React.createRef() )
  const HealthCheckSuccessBottomSheet = createRef<BottomSheet>()
  const cloudBackupHistoryArray = useSelector( ( state ) => state.cloud.cloudBackupHistory )

  const cloudErrorMessage = useSelector( ( state ) => state.cloud.cloudErrorMessage )
  const [ errorMsg, setErrorMsg ] = useState( '' )
  const cloudBackupStatus = useSelector( ( state ) => state.cloud.cloudBackupStatus || CloudBackupStatus.PENDING, )
  const currentLevel = useSelector( ( state ) => state.bhr.currentLevel )
  const dispatch = useDispatch()

  const updateCloudData = () => {
    console.log( 'cloudBackupStatus', cloudBackupStatus, currentLevel )
    if( cloudBackupStatus === CloudBackupStatus.IN_PROGRESS ) return
    dispatch( updateCloudData() )
  }

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


  useEffect( () => {
    console.log( cloudBackupHistoryArray )
    if ( cloudBackupHistoryArray ) setCloudBackupHistory( cloudBackupHistoryArray )
  }, [ cloudBackupHistoryArray ] )

  useEffect( () => {
    if ( cloudErrorMessage !== '' ) {
      setErrorMsg( cloudErrorMessage )
      setErrorModal( true )
      dispatch( setCloudErrorMessage( '' ) )
    }
  }, [ cloudErrorMessage ] )

  const renderCloudErrorContent = useCallback( () => {
    return (
      <ErrorModalContents
        title={'Cloud Backup Error'}
        //info={cloudErrorMessage}
        note={errorMsg}
        onPressProceed={()=>{
          setErrorModal( false )
          setConfirmationModal( true )
        }}
        onPressIgnore={()=> {
          setErrorModal( false )
        }}
        proceedButtonText={'Try Again'}
        cancelButtonText={'Skip'}
        isIgnoreButton={true}
        isBottomImage={true}
        isBottomImageStyle={{
          width: wp( '30%' ),
          height: wp( '25%' ),
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
      title={'Automated Cloud Backup'}
      info={'This is the first level of security of your wallet and we encourage you to proceed with this step while setting up the wallet'}
      note={''}
      onPressProceed={( flag )=>{
        // if ( ( bottomSheetRef as any ).current )
        //   ( bottomSheetRef as any ).current.snapTo( 0 )
        setConfirmationModal( false )
        console.log( 'updateCloudPermission', flag )
        dispatch( updateCloudPermission( flag ) )
        updateCloudData()
      }}
      onPressIgnore={( flag )=> {
        // if ( ( bottomSheetRef as any ).current )
        //   ( bottomSheetRef as any ).current.snapTo( 0 )
        setConfirmationModal( false )
        console.log( 'updateCloudPermission', flag )
        dispatch( updateCloudPermission( flag ) )
      }}
      autoClose={()=>{
        // if ( ( bottomSheetRef as any ).current )
        //   ( bottomSheetRef as any ).current.snapTo( 0 )
        setConfirmationModal( false )
        console.log( 'updateCloudPermission', true )
        dispatch( updateCloudPermission( true ) )
      }}
      bottomImage={require( '../../assets/images/icons/cloud_ilustration.png' )}
    /> )
  }, [] )

  const renderCloudPermissionHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (HealthCheckSuccessBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  const renderHealthCheckSuccessModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={HealthCheckSuccessBottomSheet}
        title={'Health Check Successful'}
        info={'Question Successfully Backed Up'}
        note={''}
        proceedButtonText={'View Health'}
        isIgnoreButton={false}
        onPressProceed={() => {
          ( HealthCheckSuccessBottomSheet as any ).current.snapTo( 0 )
          dispatch( checkMSharesHealth() )
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
        selectedTitle={Platform.OS == 'ios' ? 'iCloud backup' : 'Google Drive backup'}
        selectedTime={props.navigation.state.params.selectedTime}
        moreInfo={''}
        tintColor={Colors.deepBlue}
        headerImage={require( '../../assets/images/icons/ico_cloud_backup.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          infoBoxTitle={'Backup History'}
          infoBoxInfo={'The history of your backup will appear here'}
          type={'security'}
          onPressConfirm={() => {
            // ( bottomSheetRef as any ).current.snapTo( 1 )
            setConfirmationModal( true )
          }}
          data={cloudBackupHistory.length ? sortedHistory( cloudBackupHistory ) : []}
          confirmButtonText={'Backup'}
          reshareButtonText={'Backup'}
          disableChange={true}
          onPressReshare={() => {
            // ( cloudBackupBottomSheet as any ).current.snapTo( 1 )
          }}
          onPressChange={() => {
            props.navigation.navigate( 'NewOwnQuestions' )
          }}
        />
      </View>
      <ModalContainer visible={confirmationModal} closeBottomSheet={() => {}}>
        {renderCloudPermissionContent()}
      </ModalContainer>
      <ModalContainer visible={errorModal} closeBottomSheet={() => {setErrorModal( false )}}>
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

    </View>
  )
}
export default CloudBackupHistory


