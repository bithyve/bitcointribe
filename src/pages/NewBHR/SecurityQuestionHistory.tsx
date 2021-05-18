import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Keyboard,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
import BottomSheet from 'reanimated-bottom-sheet'
import SecurityQuestion from './SecurityQuestion'
import DeviceInfo from 'react-native-device-info'
import ErrorModalContents from '../../components/ErrorModalContents'
import {
  checkMSharesHealth,
  updateMSharesHealth,
} from '../../store/actions/health'
import { useSelector } from 'react-redux'
import HistoryHeaderComponent from './HistoryHeaderComponent'

const SecurityQuestionHistory = ( props ) => {
  const [ securityQuestionsHistory, setSecuirtyQuestionHistory ] = useState( [
    {
      id: 1,
      title: 'Security Questions created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Security Questions confirmed',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Security Questions unconfirmed',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
  ] )
  const [
    SecurityQuestionBottomSheet,
    setSecurityQuestionBottomSheet,
  ] = useState( React.createRef() )
  const [
    HealthCheckSuccessBottomSheet,
    setHealthCheckSuccessBottomSheet,
  ] = useState( React.createRef() )
  const levelHealth: {
    level: number;
    levelInfo: {
      shareType: string;
      updatedAt: string;
      status: string;
      shareId: string;
      reshareVersion?: number;
      name?: string;
    }[];
  }[] = useSelector( ( state ) => state.health.levelHealth )
  const currentLevel: Number = useSelector(
    ( state ) => state.health.currentLevel,
  )
  const s3Service = useSelector( ( state ) => state.health.service )
  const next = props.navigation.getParam( 'next' )
  const dispatch = useDispatch()

  const renderSecurityQuestionContent = useCallback( () => {
    return (
      <SecurityQuestion
        onFocus={() => {
          if ( Platform.OS == 'ios' )
            ( SecurityQuestionBottomSheet as any ).current.snapTo( 2 )
        }}
        onBlur={() => {
          if ( Platform.OS == 'ios' )
            ( SecurityQuestionBottomSheet as any ).current.snapTo( 1 )
        }}
        onPressConfirm={async () => {
          Keyboard.dismiss()
          saveConfirmationHistory()
          updateHealthForSQ();
          ( SecurityQuestionBottomSheet as any ).current.snapTo( 0 );
          ( HealthCheckSuccessBottomSheet as any ).current.snapTo( 1 )
        }}
      />
    )
  }, [] )

  const renderSecurityQuestionHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( SecurityQuestionBottomSheet as any ).current.snapTo( 0 )
        }}
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

  const updateHistory = ( securityQuestionHistory ) => {
    const updatedSecurityQuestionsHistory = [ ...securityQuestionsHistory ]
    if ( securityQuestionHistory.created )
      updatedSecurityQuestionsHistory[ 0 ].date = securityQuestionHistory.created

    if ( securityQuestionHistory.confirmed )
      updatedSecurityQuestionsHistory[ 1 ].date =
        securityQuestionHistory.confirmed

    if ( securityQuestionHistory.unconfirmed )
      updatedSecurityQuestionsHistory[ 2 ].date =
        securityQuestionHistory.unconfirmed
    setSecuirtyQuestionHistory( updatedSecurityQuestionsHistory )
  }

  const saveConfirmationHistory = async () => {
    const securityQuestionHistory = JSON.parse(
      await AsyncStorage.getItem( 'securityQuestionHistory' ),
    )
    if ( securityQuestionHistory ) {
      const updatedSecurityQuestionsHistory = {
        ...securityQuestionHistory,
        confirmed: Date.now(),
      }
      updateHistory( updatedSecurityQuestionsHistory )
      await AsyncStorage.setItem(
        'securityQuestionHistory',
        JSON.stringify( updatedSecurityQuestionsHistory ),
      )
    }
  }

  useEffect( () => {
    if ( next ) ( SecurityQuestionBottomSheet as any ).current.snapTo( 1 )
  }, [ next ] )

  useEffect( () => {
    ( async () => {
      const securityQuestionHistory = JSON.parse(
        await AsyncStorage.getItem( 'securityQuestionHistory' ),
      )
      console.log( {
        securityQuestionHistory
      } )
      if ( securityQuestionHistory ) updateHistory( securityQuestionHistory )
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
      dispatch( updateMSharesHealth( shareArray, true ) )
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
        selectedTitle={'Security Question'}
        selectedTime={props.navigation.state.params.selectedTime}
        selectedStatus={props.navigation.state.params.selectedStatus}
        moreInfo={''}
        headerImage={require( '../../assets/images/icons/icon_question_bold.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          infoBoxTitle={'Security Question History'}
          infoBoxInfo={'The history of your Security Question will appear here'}
          type={'security'}
          IsReshare
          onPressConfirm={() => {
            ( SecurityQuestionBottomSheet as any ).current.snapTo( 1 )
          }}
          data={sortedHistory( securityQuestionsHistory )}
          confirmButtonText={'Confirm Answer'}
          reshareButtonText={'Confirm Answer'}
          // changeButtonText={'Change Question'}
          disableChange={true}
          onPressReshare={() => {
            ( SecurityQuestionBottomSheet as any ).current.snapTo( 1 )
          }}
          onPressChange={() => {
            props.navigation.navigate( 'NewOwnQuestions' )
          }}
        />
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SecurityQuestionBottomSheet as any}
        snapPoints={[ -30, hp( '75%' ), hp( '90%' ) ]}
        renderContent={renderSecurityQuestionContent}
        renderHeader={renderSecurityQuestionHeader}
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

export default SecurityQuestionHistory

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
