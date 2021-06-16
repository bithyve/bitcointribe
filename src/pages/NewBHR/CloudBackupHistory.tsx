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
import { updateCloudPermission } from '../../store/actions/health'
import DeviceInfo from 'react-native-device-info'
import ErrorModalContents from '../../components/ErrorModalContents'
import {
  checkMSharesHealth,
} from '../../store/actions/health'
import { useSelector } from 'react-redux'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import CloudPermissionModalContents from '../../components/CloudPermissionModalContents'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { getLevelInfo } from '../../common/CommonFunctions'
import { setCloudData } from '../../store/actions/cloud'
import BottomSheet from 'reanimated-bottom-sheet'
import { LevelHealthInterface } from '../../bitcoin/utilities/Interface'

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
  const [
    bottomSheetRef,
    setBottomSheetRef,
  ] = useState( React.createRef() )
  const HealthCheckSuccessBottomSheet = createRef<BottomSheet>()

  const cloudBackupHistoryArray = useSelector( ( state ) => state.cloud.cloudBackupHistory )

  const s3Service = useSelector( ( state ) => state.health.service )
  const cloudBackupStatus = useSelector( ( state ) => state.cloud.cloudBackupStatus || CloudBackupStatus.PENDING, )

  const keeperInfo = useSelector( ( state ) => state.health.keeperInfo )

  const levelHealth: LevelHealthInterface[] = useSelector( ( state ) => state.health.levelHealth )
  const currentLevel = useSelector( ( state ) => state.health.currentLevel )

  const next = props.navigation.getParam( 'next' )
  const dispatch = useDispatch()

  const updateCloudData = () => {
    console.log( 'cloudBackupStatus', cloudBackupStatus, currentLevel )
    if( cloudBackupStatus === CloudBackupStatus.IN_PROGRESS ) return
    let share = levelHealth[ 0 ].levelInfo[ 0 ]
    if( levelHealth[ 0 ] && !levelHealth[ 1 ] ){
      share = levelHealth[ 0 ].levelInfo[ 0 ]
    } else if( levelHealth[ 0 ] && levelHealth[ 1 ] ){
      if( levelHealth[ 1 ].levelInfo.length == 4 && levelHealth[ 1 ].levelInfo[ 2 ].updatedAt > 0 && levelHealth[ 1 ].levelInfo[ 3 ].updatedAt > 0 ){
        share = levelHealth[ 1 ].levelInfo[ 0 ]
      } else if( levelHealth[ 1 ].levelInfo.length == 6 && levelHealth[ 1 ].levelInfo[ 2 ].updatedAt > 0 && levelHealth[ 1 ].levelInfo[ 3 ].updatedAt > 0 && levelHealth[ 1 ].levelInfo[ 4 ].updatedAt > 0 && levelHealth[ 1 ].levelInfo[ 5 ].updatedAt > 0 ){
        share = levelHealth[ 1 ].levelInfo[ 0 ]
      }
    }
    console.log( 'share', share )
    dispatch( setCloudData(
      keeperInfo,
      currentLevel === 0 ? currentLevel + 1 : currentLevel,
      share
    ) )
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

  const renderCloudPermissionContent = useCallback( () => {
    return ( <CloudPermissionModalContents
      modalRef={bottomSheetRef}
      title={'Automated Cloud Backup'}
      info={'This is the first level of security of your wallet and we encourage you to proceed with this step while setting up the wallet'}
      note={''}
      onPressProceed={( flag )=>{
        if ( ( bottomSheetRef as any ).current )
          ( bottomSheetRef as any ).current.snapTo( 0 )
        console.log( 'updateCloudPermission', flag )
        dispatch( updateCloudPermission( flag ) )
        updateCloudData()
      }}
      onPressIgnore={( flag )=> {
        if ( ( bottomSheetRef as any ).current )
          ( bottomSheetRef as any ).current.snapTo( 0 )
        console.log( 'updateCloudPermission', flag )
        dispatch( updateCloudPermission( flag ) )
      }}
      autoClose={()=>{
        if ( ( bottomSheetRef as any ).current )
          ( bottomSheetRef as any ).current.snapTo( 0 )
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
            ( bottomSheetRef as any ).current.snapTo( 1 )
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

      <BottomSheet
        enabledInnerScrolling={true}
        ref={bottomSheetRef as any}
        snapPoints={[ -30, Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '40%' ) : hp( '35%' ), ]}
        renderContent={renderCloudPermissionContent}
        renderHeader={renderCloudPermissionHeader}
      />
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


