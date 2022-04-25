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
import { KeeperInfoInterface, KeeperType, ShareSplitScheme } from '../../bitcoin/utilities/Interface'
import { generateRandomString } from '../../common/CommonFunctions'
import moment from 'moment'
import { updatedKeeperInfo } from '../../store/actions/BHR'

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
        selectedTitle={'Backup Seed Words'}
        moreInfo={'Note down the words 1 to 24'}
      />
      <View style={{
        flex: 1
      }}>
        <SeedPageComponent
          infoBoxTitle={''}
          infoBoxInfo={'You will be asked to confirm some of these, to ensure you have all the seed words written'}
          onPressConfirm={() => {
            setConfirmSeedWordModal( true )
          }}
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

      <ModalContainer onBackground={() => setConfirmSeedWordModal( false )} visible={confirmSeedWordModal}
        closeBottomSheet={() => setConfirmSeedWordModal( false )}>
        <ConfirmSeedWordsModal
          proceedButtonText={'Next'}
          onPressProceed={() => {
            setConfirmSeedWordModal( false )
            setSeedWordModal( true )

            const keeperInfo: KeeperInfoInterface = {
              shareId: generateRandomString( 8 ),
              name: 'Seed',
              type: KeeperType.SEED,
              scheme: ShareSplitScheme.OneOfOne,
              currentLevel: 0,
              createdAt: moment( new Date() ).valueOf(),
              sharePosition: null,
              data: {
              }
            }
            dispatch( updatedKeeperInfo( keeperInfo ) ) // updates keeper-info in the reducer
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
