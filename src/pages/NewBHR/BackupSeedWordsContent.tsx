import React, { useEffect, useState } from 'react'
import {
  SafeAreaView,
  StatusBar, View
} from 'react-native'
import Colors from '../../common/Colors'
import BottomInputModalContainer from '../../components/home/BottomInputModalContainer'
import ModalContainer from '../../components/home/ModalContainer'

import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import RNPreventScreenshot from 'react-native-screenshot-prevent'
import { useDispatch } from 'react-redux'
import AlertModalContents from '../../components/AlertModalContents'
import dbManager from '../../storage/realm/dbManager'
import { updateSeedHealth } from '../../store/actions/BHR'
import ConfirmSeedWordsModal from './ConfirmSeedWordsModal'
import SeedBacupModalContents from './SeedBacupModalContents'
import SeedHeaderComponent from './SeedHeaderComponent'
import SeedPageComponent from './SeedPageComponent'

const BackupSeedWordsContent = ( props ) => {
  const [ seedWordModal, setSeedWordModal ] = useState( false )
  const [ confirmSeedWordModal, setConfirmSeedWordModal ] = useState( false )
  const [ showAlertModal, setShowAlertModal ] = useState( false )
  const [ info, setInfo ] = useState( '' )
  const [ seedRandomNumber, setSeedRandomNumber ] = useState( [] )
  const [ seedData, setSeedData ] = useState( [] )
  const [ seedPosition, setSeedPosition ] = useState( 0 )
  const [ headerTitle, setHeaderTitle ]=useState( 'Backup phrase' )
  // const [ headerTitle, setHeaderTitle ]=useState( 'First 6 Backup Phrase' )

  const dispatch = useDispatch()
  const fromHistory = props.route.params?.fromHistory
  const isChangeKeeperType =  props.route.params?.isChangeKeeperType
  useEffect( ()=>{
    // RNPreventScreenshot.enabled( true )

    //set random number
    const i = 12, ranNums = []
    for( let j=0; j<2; j++ ){
      const tempNumber = ( Math.floor( Math.random() * ( i ) ) )
      if( ranNums.length == 0 || ( ranNums.length > 0 && ranNums[ j ] != tempNumber ) ){
        if ( tempNumber == undefined || tempNumber == 0 ) {
          ranNums.push( 1 )
        }
        else {
          ranNums.push( tempNumber )
        }
      } else j--
    }
    setSeedRandomNumber( ranNums )
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
      <SeedHeaderComponent
        onPressBack={() => {
          // RNPreventScreenshot.enabled( false )
          props.navigation.goBack()
          // props.navigation.navigate( 'Home' )
        }}
        info={'Make sure you keep them safe'}
        selectedTitle={headerTitle}
      />
      <KeyboardAwareScrollView
        // scrollEnabled={false}
        contentContainerStyle={{
          // flex: 1,
          // backgroundColor: background,
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          // alignItems: 'center',
          // paddingBottom: Platform.OS === 'ios' ? hp( '6%' ) : 2,
          // paddingHorizontal: wp( '2%' ),
          // borderRadius: 20
        }}
        extraScrollHeight={100} enableOnAndroid={true}
        resetScrollToCoords={{
          x: 0, y: 0
        }}
        keyboardShouldPersistTaps='always'
      >
        <SeedPageComponent
          infoBoxTitle={'Note'}
          infoBoxInfo={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'}
          onPressConfirm={( seed, seedData )=>{
            setSeedPosition( 0 )
            setSeedData( seedData )

            setTimeout( () => {
              setConfirmSeedWordModal( true )
            }, 500 )
          }}
          data={[]}
          confirmButtonText={'Next'}
          proceedButtonText={'Proceed'}
          disableChange={false}
          onPressReshare={() => {
          }}
          onPressChange={() => {
            RNPreventScreenshot.enabled( false )
            // props.navigation.goBack()
            props.navigation.pop()
          }}
          showButton={true}
          changeButtonText={'Back'}
          previousButtonText={'Previous'}
          isChangeKeeperAllow={true}
          setHeaderMessage={( message )=>setHeaderTitle( message )}
        />
      </KeyboardAwareScrollView>

      <BottomInputModalContainer onBackground={() => setConfirmSeedWordModal( false )} visible={confirmSeedWordModal}
        closeBottomSheet={() => {}} showBlurView={true}>
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
            } else if( !fromHistory && seedPosition == 0 ){
              setConfirmSeedWordModal( false )
              setSeedPosition( 1 )
              setTimeout( () => {
                setConfirmSeedWordModal( true )
              }, 500 )
            }else {
              setSeedWordModal( true )
              const dbWallet =  dbManager.getWallet()
              if( dbWallet!=undefined && dbWallet!=null ){
                const walletObj = JSON.parse( JSON.stringify( dbWallet ) )
                const primaryMnemonic = walletObj.primaryMnemonic
                const seed = primaryMnemonic.split( ' ' )
                const seedData = seed.map( ( word, index ) => {
                  return {
                    name: word, id: ( index+1 )
                  }
                } )
                const i = 12
                let ranNums = 1
                const tempNumber = ( Math.floor( Math.random() * ( i ) ) )
                if( tempNumber == undefined || tempNumber == 0 )
                  ranNums = 1
                else ranNums = tempNumber
                const asyncSeedData=seedData[ ranNums ]
                AsyncStorage.setItem( 'randomSeedWord', JSON.stringify( asyncSeedData ) )
              }
              dispatch( updateSeedHealth() )
              AsyncStorage.setItem( 'walletBackupDate', JSON.stringify( moment( Date() ) ) )

              // dispatch(setSeedBackupHistory())
            }
          }}
          bottomBoxInfo={true}
          onPressIgnore={() => {
            setConfirmSeedWordModal( false )
            props.navigation.goBack()

          } }
          isIgnoreButton={true}
          cancelButtonText={'Start Over'}
        />
      </BottomInputModalContainer>
      <ModalContainer onBackground={() => setSeedWordModal( false )} visible={seedWordModal}
        closeBottomSheet={() => setSeedWordModal( false )}>
        <SeedBacupModalContents
          title={'Backup phrase \nSuccessful'}
          info={'You have successfully confirmed your backup\n\nMake sure you store the words in a safe place. The app will request you to confirm the words periodically to ensure you have the access'}
          proceedButtonText={'View Health'}
          onPressProceed={() => {
            RNPreventScreenshot.enabled( false )
            setSeedWordModal( false )
            const navigationParams =  props.route.params?.navigationParams
            if ( isChangeKeeperType ) {
              props.navigation.navigate( 'SeedBackup',  {
                navigationParams,
                isChangeKeeperType: true,
              } )
            } else {
              props.navigation.navigate( 'SeedBackup', {
                navigationParams,
                // isChangeKeeperType: true,
              }
              )
            }
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
            if ( info == 'please delete icloud backup' ) {

              props.navigation.popToTop()
            }
          }}
          isBottomImage={false}
          // bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
    </View>
  )
}
export default BackupSeedWordsContent
