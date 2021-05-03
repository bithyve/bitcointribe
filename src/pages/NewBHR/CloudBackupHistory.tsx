import React, { useState, useEffect, useCallback, createRef } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
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
  updateMSharesHealth,
} from '../../store/actions/health'
import { useSelector } from 'react-redux'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import CloudPermissionModalContents from '../../components/CloudPermissionModalContents'
import BottomSheet from '@gorhom/bottom-sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import defaultBottomSheetConfigs from '../../common/configs/BottomSheetConfigs'
import { Easing } from 'react-native-reanimated'
import BottomSheetBackground from '../../components/bottom-sheets/BottomSheetBackground'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { getLevelInfo } from '../../common/CommonFunctions'
import { setCloudData } from '../../store/actions/cloud'

export enum BottomSheetKind {
  CLOUD_PERMISSION,
  HEALTH_CHECK
}

export enum BottomSheetState {
  Closed,
  Open,
}

export default function CloudBackupHistory ( props ) {
  const [ cloudBackupHistory, setCloudBackupHistory ] = useState( [
    {
      id: 1,
      title: Platform.OS == 'ios' ? 'iCloud backup created' : 'GoogleDrive backup created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: Platform.OS == 'ios' ? 'iCloud backup confirmed' : 'GoogleDrive backup confirmed',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: Platform.OS == 'ios' ? 'iCloud backup unconfirmed' : 'GoogleDrive backup unconfirmed',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
  ] )
  const [ currentBottomSheetKind, setCurrentBottomSheetKind ]: [BottomSheetKind, any] = useState()
  const [ bottomSheetState, setBottomSheetState ] = useState( BottomSheetState.Closed )
  const bottomSheetRef = createRef<BottomSheet>()
  const [ isCloudPermissionRender, setIsCloudPermissionRender ] = useState( false )
  const HealthCheckSuccessBottomSheet = createRef<BottomSheet>()
  // const levelHealth: {
  //   level: number;
  //   levelInfo: {
  //     shareType: string;
  //     updatedAt: string;
  //     status: string;
  //     shareId: string;
  //     reshareVersion?: number;
  //     name?: string;
  //   }[];
  // }[] = useSelector( ( state ) => state.health.levelHealth )

  const s3Service = useSelector( ( state ) => state.health.service )
  const cloudBackupStatus = useSelector( ( state ) => state.cloud.cloudBackupStatus || CloudBackupStatus.PENDING, )

  const keeperInfo = useSelector( ( state ) => state.health.keeperInfo )

  const levelHealth = useSelector( ( state ) => state.health.levelHealth )
  const currentLevel = useSelector( ( state ) => state.health.currentLevel )

  const next = props.navigation.getParam( 'next' )
  const dispatch = useDispatch()

  const updateCloudData = () => {
    if( cloudBackupStatus === CloudBackupStatus.IN_PROGRESS ) return
    // if( this.props.cloudPermissionGranted === false ) return
    let secretShare = {
    }
    if ( levelHealth.length > 0 ) {
      const levelInfo = getLevelInfo( levelHealth, currentLevel )

      if ( levelInfo ) {
        if (
          levelInfo[ 2 ] &&
          levelInfo[ 3 ] &&
          levelInfo[ 2 ].status == 'accessible' &&
          levelInfo[ 3 ].status == 'accessible'
        ) {
          for (
            let i = 0;
            i < s3Service.levelhealth.metaSharesKeeper.length;
            i++
          ) {
            const element = s3Service.levelhealth.metaSharesKeeper[ i ]

            if ( levelInfo[ 0 ].shareId == element.shareId ) {
              secretShare = element
              break
            }
          }
        }
      }
    }
    setCloudData(
      keeperInfo,
      currentLevel == 3 ? 3 : currentLevel + 1,
      secretShare
    )
  }

  const renderBottomSheetContent = () =>{
    console.log( 'currentBottomSheetKind', currentBottomSheetKind )
    switch ( currentBottomSheetKind ) {
        case BottomSheetKind.CLOUD_PERMISSION:
          return (
            <CloudPermissionModalContents
              title={'Automated Cloud Backup'}
              info={'This is the first level of security of your wallet and we encourage you to proceed with this step while setting up the wallet'}
              note={''}
              onPressProceed={( flag )=>{
                closeBottomSheet()
                console.log( 'updateCloudPermission', flag )
                dispatch( updateCloudPermission( flag ) )
                updateCloudData()
              }}
              onPressIgnore={( flag )=> {
                closeBottomSheet()
                console.log( 'updateCloudPermission', flag )
                dispatch( updateCloudPermission( flag ) )
              }}
              autoClose={()=>{
                closeBottomSheet()
                console.log( 'updateCloudPermission', true )
                dispatch( updateCloudPermission( true ) )
              }}
              bottomImage={require( '../../assets/images/icons/cloud_ilustration.png' )}
            />
          )

        case BottomSheetKind.HEALTH_CHECK:
          return (
            <ErrorModalContents
              title={'Health Check Successful'}
              info={'Question Successfully Backed Up'}
              note={''}
              proceedButtonText={'View Health'}
              isIgnoreButton={false}
              onPressProceed={() => {
                closeBottomSheet()
                dispatch( checkMSharesHealth() )
                props.navigation.goBack()
              }}
              isBottomImage={true}
              bottomImage={require( '../../assets/images/icons/illustration.png' )}
            />
          )

        default:
          break
    }
  }

  const openBottomSheet = (
    kind: BottomSheetKind,
    snapIndex: number | null = null
  ) => {
    console.log( 'KIND', kind, snapIndex )

    setBottomSheetState( BottomSheetState.Open )
    setCurrentBottomSheetKind( kind )
    if ( snapIndex === null ) {
      console.log( 'inside if', bottomSheetRef )
      setTimeout( () => {
        bottomSheetRef.current?.expand()
      }, 2 )
    } else {
      setTimeout( () => {
        bottomSheetRef.current?.snapTo( snapIndex )      }, 2 )

    }
  }

  const getBottomSheetSnapPoints = (): any[] => {
    switch ( currentBottomSheetKind ) {
        case BottomSheetKind.CLOUD_PERMISSION:
          return [
            -50,
            hp(
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? 40 : 35,
            ),
          ]

        case BottomSheetKind.HEALTH_CHECK:
          return [
            -50,
            hp(
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? 27 : 35,
            ),
          ]

        default:
          return defaultBottomSheetConfigs.snapPoints
    }
  }

  const handleBottomSheetPositionChange = ( newIndex: number ) => {
    if ( newIndex === 0 ) {
      onBottomSheetClosed()
    }
  }

  const onBottomSheetClosed =()=> {
    setBottomSheetState( BottomSheetState.Closed )
    setCurrentBottomSheetKind( null )
  }

  const closeBottomSheet = () => {
    bottomSheetRef.current?.snapTo( 0 )
    onBottomSheetClosed()
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

  const updateHistory = ( cloudBackupHistory ) => {
    const updatedCloudBackupHistory = [ ...cloudBackupHistory ]
    if ( cloudBackupHistory.created )
      updatedCloudBackupHistory[ 0 ].date = cloudBackupHistory.created

    if ( cloudBackupHistory.confirmed )
      updatedCloudBackupHistory[ 1 ].date =
    cloudBackupHistory.confirmed

    if ( cloudBackupHistory.unconfirmed )
      updatedCloudBackupHistory[ 2 ].date =
    cloudBackupHistory.unconfirmed
    setCloudBackupHistory( updatedCloudBackupHistory )
  }

  const saveConfirmationHistory = async () => {
    const cloudBackupHistory = JSON.parse(
      await AsyncStorage.getItem( 'cloudBackupHistory' ),
    )
    if ( cloudBackupHistory ) {
      const updatedCloudBackupHistoryHistory = {
        ...cloudBackupHistory,
        confirmed: Date.now(),
      }
      updateHistory( updatedCloudBackupHistoryHistory )
      await AsyncStorage.setItem(
        'cloudBackupHistory',
        JSON.stringify( updatedCloudBackupHistoryHistory ),
      )
    }
  }

  // useEffect( () => {
  //   if ( next ){ setIsCloudPermissionRender( true )
  //     openBottomSheet( BottomSheetKind.CLOUD_PERMISSION )}
  // }, [ next ] )

  useEffect( () => {
    ( async () => {
      const cloudBackupHistory = JSON.parse(
        await AsyncStorage.getItem( 'cloudBackupHistory' ),
      )
      console.log( {
        cloudBackupHistory
      } )
      if ( cloudBackupHistory ) updateHistory( cloudBackupHistory )
    } )()
  }, [] )

  const updateHealthForSQ = () => {
    if ( levelHealth.length > 0 && levelHealth[ 0 ].levelInfo.length > 0 ) {
      const levelHealthVar =
        currentLevel == 0 || currentLevel == 1
          ? levelHealth[ 0 ].levelInfo[ 1 ]
          : currentLevel == 2
            ? levelHealth[ 1 ].levelInfo[ 1 ]
            : levelHealth[ 2 ].levelInfo[ 1 ]
      // health update for 1st upload to cloud
      if ( levelHealthVar.shareType == 'cloud' ) {
        levelHealthVar.updatedAt = '' + moment( new Date() ).valueOf()
        levelHealthVar.status = 'accessible'
        levelHealthVar.reshareVersion = 1
        levelHealthVar.name = 'Cloud'
      }
      const shareArray = [
        {
          walletId: s3Service.getWalletId().data.walletId,
          shareId: levelHealthVar.shareId,
          reshareVersion: levelHealthVar.reshareVersion,
          updatedAt: moment( new Date() ).valueOf(),
          status: 'accessible',
          shareType: 'securityQuestion',
        },
      ]
      dispatch( updateMSharesHealth( shareArray ) )
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
        selectedTitle={Platform.OS == 'ios' ? 'iCloud backup' : 'GoogleDrive backup'}
        selectedTime={props.navigation.state.params.selectedTime}
        selectedStatus={props.navigation.state.params.selectedStatus}
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
            saveConfirmationHistory()
            openBottomSheet( BottomSheetKind.CLOUD_PERMISSION )
          }}
          data={sortedHistory( cloudBackupHistory )}
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
      <BottomSheetBackground
        isVisible={bottomSheetState === BottomSheetState.Open}
        onPress={closeBottomSheet}
      />
      {currentBottomSheetKind != null && (
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={getBottomSheetSnapPoints()}
          initialSnapIndex={-1}
          animationDuration={defaultBottomSheetConfigs.animationDuration}
          animationEasing={Easing.out( Easing.back( 1 ) )}
          handleComponent={defaultBottomSheetConfigs.handleComponent}
          onChange={handleBottomSheetPositionChange}
        >
          <BottomSheetView>{renderBottomSheetContent()}</BottomSheetView>
        </BottomSheet>
      )}
      {/* <BottomSheet
        enabledInnerScrolling={true}
        ref={cloudBackupBottomSheet as any}
        snapPoints={[ -30, hp( '75%' ), hp( '90%' ) ]}
        renderContent={renderSecurityQuestionContent}
        renderHeader={renderSecurityQuestionHeader}
      /> */}
      {/* {currentBottomSheetKind != null && (
        <BottomSheet
          ref={HealthCheckSuccessBottomSheet}
          snapPoints={getBottomSheetSnapPoints()}
          initialSnapIndex={-1}
          animationDuration={defaultBottomSheetConfigs.animationDuration}
          animationEasing={Easing.out( Easing.back( 1 ) )}
          handleComponent={defaultBottomSheetConfigs.handleComponent}
          onChange={handleBottomSheetPositionChange}

        >
          <BottomSheetView>{renderBottomSheetContent()}</BottomSheetView>
        </BottomSheet> )} */}
    </View>
  )
}



const styles = StyleSheet.create( {
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp( '3%' ),
    marginTop: 20,
    marginBottom: 15,
  },
} )
