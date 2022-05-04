import React, { useState, useEffect, useCallback, createRef } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import Colors from '../../common/Colors'
import _ from 'underscore'
import ModalContainer from '../../components/home/ModalContainer'
import SeedHeaderComponent from './SeedHeaderComponent'
import SeedPageComponent from './SeedPageComponent'
import SeedBacupModalContents from './SeedBacupModalContents'
import ConfirmSeedWordsModal from './ConfirmSeedWordsModal'
import { useDispatch } from 'react-redux'
import { updateSeedHealth } from '../../store/actions/BHR'

const BackupSeedWordsContent = ( props ) => {
  const [ seedWordModal, setSeedWordModal ] = useState( false )
  const [ confirmSeedWordModal, setConfirmSeedWordModal ] = useState( false )
  const dispatch = useDispatch()

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
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={'Enter Seed Words'}
      />
      <View style={{
        flex: 1
      }}>
        <SeedPageComponent
          infoBoxTitle={'Note'}
          infoBoxInfo={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'}
          onPressConfirm={()=>setConfirmSeedWordModal( true )}
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
      </View>

      <ModalContainer onBackground={() => setConfirmSeedWordModal( false )} visible={confirmSeedWordModal}
        closeBottomSheet={() => setConfirmSeedWordModal( false )}>
        <ConfirmSeedWordsModal
          proceedButtonText={'Next'}
          onPressProceed={() => {
            setConfirmSeedWordModal( false )
            setSeedWordModal( true )
            dispatch( updateSeedHealth() )

          }}
          onPressIgnore={() => setConfirmSeedWordModal( false )}
          isIgnoreButton={true}
          cancelButtonText={'Start Over'}
        />
      </ModalContainer>
      <ModalContainer onBackground={() => setSeedWordModal( false )} visible={seedWordModal}
        closeBottomSheet={() => setSeedWordModal( false )}>
        <SeedBacupModalContents
          title={'Seed Words\nBackup Successful'}
          info={'You have successfully confirmed your backup\n\nMake sure you store the words in a safe place. The app will request you to confirm the words periodically to ensure you have the access'}
          proceedButtonText={'View Health'}
          onPressProceed={() => {
            setSeedWordModal( false )
            props.navigation.goBack()
          }}
          onPressIgnore={() => setSeedWordModal( false )}
          isIgnoreButton={false}
          isBottomImage={true}
          bottomImage={require( '../../assets/images/icons/noInternet.png' )}
        />
      </ModalContainer>
    </View>
  )
}
export default BackupSeedWordsContent
