import React, { useState, useEffect, useCallback, createRef } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native'
import Colors from '../../common/Colors'
import _ from 'underscore'
import ModalContainer from '../../components/home/ModalContainer'
import SeedHeaderComponent from './SeedHeaderComponent'
import SeedPageComponent from './SeedPageComponent'
import SeedBacupModalContents from './SeedBacupModalContents'
import ConfirmSeedWordsModal from './ConfirmSeedWordsModal'
import RestoreSeedPageComponent from './RestoreSeedPageComponent'
import * as bip39 from 'bip39'
import { useDispatch } from 'react-redux'
import { recoverWalletUsingMnemonic } from '../../store/actions/BHR'

const RestoreSeedWordsContent = ( props ) => {
  const [ seedWordModal, setSeedWordModal ] = useState( false )
  const [ confirmSeedWordModal, setConfirmSeedWordModal ] = useState( false )
  const dispatch = useDispatch()

  const recoverWalletViaSeed = ( mnemonic: string ) => {
    const isValidMnemonic = bip39.validateMnemonic( mnemonic )
    if( !isValidMnemonic ){
      Alert.alert( 'Invalid mnemonic, try again!' )
      return
    }
    dispatch( recoverWalletUsingMnemonic( mnemonic ) )
  }

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.white
    }}>
      <SafeAreaView
        style={{
          flex: 0, backgroundColor: Colors.white
        }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <SeedHeaderComponent
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={'Enter Seed Words'}
        moreInfo={''}
      />
      <View style={{
        flex: 1
      }}>
        <RestoreSeedPageComponent
          infoBoxTitle={'Note'}
          infoBoxInfo={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'}
          onPressConfirm={recoverWalletViaSeed}
          data={[]}
          confirmButtonText={'Next'}
          disableChange={false}
          onPressReshare={() => {
          }}
          onPressChange={() => props.navigation.goBack()}
          showButton={true}
          changeButtonText={'Back'}
          isChangeKeeperAllow={true}
        />
      </View>
    </View>
  )
}
export default RestoreSeedWordsContent
