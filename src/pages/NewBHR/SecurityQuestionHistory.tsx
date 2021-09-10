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
  updateMSharesHealth,
} from '../../store/actions/BHR'
import { useSelector } from 'react-redux'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import ModalContainer from '../../components/home/ModalContainer'
import { Wallet } from '../../bitcoin/utilities/Interface'

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
      title: 'Security Password confirmed',
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
    questionModal,
    showQuestionModal,
  ] = useState( false )
  const [
    successModal,
    showSuccessModal,
  ] = useState( false )
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
  }[] = useSelector( ( state ) => state.bhr.levelHealth )
  const currentLevel: Number = useSelector(
    ( state ) => state.bhr.currentLevel,
  )
  const wallet: Wallet = useSelector( ( state ) => state.storage.wallet )
  const next = props.navigation.getParam( 'next' )
  const dispatch = useDispatch()

  const renderSecurityQuestionContent = useCallback( () => {
    return (
      <SecurityQuestion
        onClose={() => showQuestionModal( false )}
        onPressConfirm={async () => {
          Keyboard.dismiss()
          saveConfirmationHistory()
          updateHealthForSQ()
          // ( SecurityQuestionBottomSheet as any ).current.snapTo( 0 )
          showQuestionModal( false )
          // ( HealthCheckSuccessBottomSheet as any ).current.snapTo( 1 )
          showSuccessModal( true )
        }}
      />
    )
  }, [] )


  const renderHealthCheckSuccessModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={HealthCheckSuccessBottomSheet}
        title={'Health Check Successful'}
        info={'Password backed up successfully'}
        note={''}
        proceedButtonText={'View Health'}
        isIgnoreButton={false}
        onPressProceed={() => {
          // ( HealthCheckSuccessBottomSheet as any ).current.snapTo( 0 )
          showSuccessModal( false )
          props.navigation.goBack()
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/success.png' )}
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
    if ( next )showQuestionModal( true )
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
      const shareObj =
        {
          walletId: wallet.walletId,
          shareId: levelHealth[ 0 ].levelInfo[ 0 ].shareId,
          reshareVersion: levelHealth[ 0 ].levelInfo[ 0 ].reshareVersion,
          updatedAt: moment( new Date() ).valueOf(),
          status: 'accessible',
          shareType: 'securityQuestion',
          name: 'Encryption Password'
        }
      dispatch( updateMSharesHealth( shareObj, true ) )
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
        selectedTitle={'Encryption Password'}
        selectedTime={props.navigation.state.params.selectedTime}
        moreInfo={''}
        headerImage={require( '../../assets/images/icons/icon_password.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          infoBoxTitle={'Password History'}
          infoBoxInfo={'The history of your Password will appear here'}
          type={'security'}
          IsReshare
          onPressConfirm={() => {
            // ( SecurityQuestionBottomSheet as any ).current.snapTo( 1 )
            showQuestionModal( true )
          }}
          data={sortedHistory( securityQuestionsHistory )}
          confirmButtonText={'Confirm Password'}
          reshareButtonText={'Confirm Password'}
          // changeButtonText={'Change Question'}
          disableChange={true}
          onPressReshare={() => {
            // ( SecurityQuestionBottomSheet as any ).current.snapTo( 1 )
            showQuestionModal( true )
          }}
          onPressChange={() => {
            props.navigation.navigate( 'NewOwnQuestions' )
          }}
        />
      </View>
      <ModalContainer visible={questionModal} closeBottomSheet={() => {}} >
        {renderSecurityQuestionContent()}
      </ModalContainer>
      <ModalContainer visible={successModal} closeBottomSheet={() => {}} >
        {renderHealthCheckSuccessModalContent()}
      </ModalContainer>
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
