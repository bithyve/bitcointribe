import React, { useState, useEffect, useCallback, createRef } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native'
import Colors from '../../common/Colors'
import _ from 'underscore'
import ModalContainer from '../../components/home/ModalContainer'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'
import SeedPageComponent from '../NewBHR/SeedPageComponent'
import SeedBacupModalContents from '../NewBHR/SeedBacupModalContents'
import ConfirmSeedWordsModal from '../NewBHR/ConfirmSeedWordsModal'
import RestoreSeedPageComponent from './RestoreSeedPageComponent'
import RestoreSeedHeaderComponent from './RestoreSeedHeaderComponent'
import * as bip39 from 'bip39'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux'
import { recoverWalletUsingMnemonic } from '../../store/actions/BHR'
import { completedWalletSetup } from '../../store/actions/setupAndAuth'
import { setVersion } from '../../store/actions/versionHistory'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Wallet } from '../../bitcoin/utilities/Interface'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import ErrorModalContents from '../../components/ErrorModalContents'
import { NavigationContext } from 'react-navigation'

const RestoreSeedWordsContent = ( props ) => {
  const [ seedWordModal, setSeedWordModal ] = useState( false )
  const [ confirmSeedWordModal, setConfirmSeedWordModal ] = useState( false )
  const [ showSeedError, setShowSeedError ]= useState(false)
  const [ showLoader, setShowLoader ] = useState( false )
  const dispatch = useDispatch()
  const wallet: Wallet = useSelector( ( state: RootStateOrAny ) => state.storage.wallet )

  useEffect( () => {
    if( wallet ){
      dispatch( completedWalletSetup() )
      AsyncStorage.setItem( 'walletRecovered', 'true' )
      dispatch( setVersion( 'Restored' ) )
      props.navigation.navigate( 'HomeNav' )
    }
  }, [ wallet ] )

  const renderSeedErrorModal = () =>{
    return(
      <ErrorModalContents
        title='Invalid Seed'
        info='Please recheck your seeds and try again'
        proceedButtonText={'Go back'}
        onPressProceed={() =>  props.navigation.goBack()}
      />
    )
  }

  const recoverWalletViaSeed = ( mnemonic: string ) => {
    setShowLoader( true )
    const isValidMnemonic = bip39.validateMnemonic( mnemonic )
    if( !isValidMnemonic ){
      setShowLoader( false )
      setShowSeedError( true )
      // Alert.alert( 'Invalid mnemonic, try again!' )

      return
    }
    dispatch( recoverWalletUsingMnemonic( mnemonic ) )
    setShowLoader( false )
  }

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      {
        showLoader &&
      <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <ActivityIndicator size="large" color={Colors.babyGray} />
      </View>
      }
      <SafeAreaView
        style={{
          flex: 0, backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <RestoreSeedHeaderComponent
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={'Enter Seed Words'}
        moreInfo={''}
      />
      <View style={{
        flex: 1,
      }}>
        <RestoreSeedPageComponent
          // infoBoxTitle={'Note'}
          // infoBoxInfo={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'}
          onPressConfirm={recoverWalletViaSeed}
          data={[]}
          confirmButtonText={'Next'}
          proceedButtonText={'Proceed'}
          disableChange={false}
          onPressReshare={() => {
          }}
          onPressChange={() => props.navigation.goBack()}
          showButton={true}
          changeButtonText={'Back'}
          previousButtonText={'Previous'}
          isChangeKeeperAllow={true}
        />
        <ModalContainer visible={(showSeedError)} onBackground={()=> setShowSeedError}>
          {renderSeedErrorModal()}
        </ModalContainer>
      </View>
    </View>
  )
}
export default RestoreSeedWordsContent