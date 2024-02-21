
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'
import * as bip39 from 'bip39'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  NativeModules,
  Platform,
  SafeAreaView,
  StatusBar,
  View
} from 'react-native'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux'
import RGBIntroModal from 'src/components/rgb/RGBIntroModal'
import RGBServices from 'src/services/RGBServices'
import { Wallet } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { translations } from '../../common/content/LocContext'
import AlertModalContents from '../../components/AlertModalContents'
import ErrorModalContents from '../../components/ErrorModalContents'
import LoaderModal from '../../components/LoaderModal'
import Toast from '../../components/Toast'
import ModalContainer from '../../components/home/ModalContainer'
import { restoreSeedWordFailed } from '../../store/actions/BHR'
import { completedWalletSetup } from '../../store/actions/setupAndAuth'
import { setVersion } from '../../store/actions/versionHistory'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'
import RestoreSeedPageComponent from '../RestoreHexaWithKeeper/RestoreSeedPageComponent'

const GoogleDrive = NativeModules.GoogleDrive

const RecoverBorderWallet = ( props ) => {
  const [ showSeedError, setShowSeedError ] = useState( false )
  const [ showLoader, setShowLoader ] = useState( false )
  const [ loaderModal, setLoaderModal ] = useState( false )
  const [ showAlertModal, setShowAlertModal ] = useState( false )
  const [ showSeedFailedModal, setSeedFailedModal ] = useState( false )
  const [ seedRecovered, setSeedRecovered ] = useState( false )
  const loaderMessage = {
    heading: translations[ 'bhr' ].Importingyourwallet,
    text: translations[ 'bhr' ].Thismaytake
  }
  const subPoints = [
    translations[ 'bhr' ].Settingupmultipleaccounts,
    translations[ 'bhr' ].Preloading,
  ]
  const bottomTextMessage = translations[ 'bhr' ].Hexaencrypts
  const mnemonicSuggestions = bip39.wordlists.english

  const dispatch = useDispatch()
  const wallet: Wallet = useSelector( ( state: RootStateOrAny ) => state.storage.wallet )
  const restoreSeedData = useSelector( ( state ) => state.bhr.loading.restoreSeedData )
  const [ mnemonic, setMnemonic ] = useState( null )

  useEffect( () => {
    return () => {
      dispatch( restoreSeedWordFailed( false ) )
    }
  }, [] )

  useEffect( () => {
    setLoaderModal( false )
    if ( wallet ) {
      dispatch( completedWalletSetup() )
      AsyncStorage.setItem( 'walletRecovered', 'true' )
      dispatch( setVersion( 'Restored' ) )
      try {
        if(Platform.OS === 'android') {
          Alert.alert(
            'Restore RGB',
            'Do you want to restore state of your RGB assets?',
            [
              {
                text: 'No',
                onPress: () => goToApp(),
                style: 'cancel',
              },
              {
                text: 'YES',
                onPress: async () => {
                  setShowLoader(true)
                  await GoogleDrive.setup()
                  const login = await GoogleDrive.login()
                  if( login.error ) {
                    Toast( login.error )
                  } else {
                    setShowLoader(true)
                    setTimeout(async () => {
                    const config = await  RGBServices.restoreKeys( mnemonic )
                    RGBServices.initiate( config.mnemonic, config.xpub  )
                    await RGBServices.restore( mnemonic )
                    goToApp()
                  }, 300)
                  }
                },
                style: 'default',
              },
            ],
            {
              cancelable: true,
            },
          )
        } else {
          goToApp()
        }
      } catch ( error ) {
        console.log( error )
      }
    }
  }, [ wallet ] )

  useEffect( () => {
    if( restoreSeedData == 'restoreSeedDataFailed' ){
      setLoaderModal( false )
      props.navigation.navigate( 'NewWalletName', {
        mnemonic,
      } )
    }
  }, [ restoreSeedData ] )

  const goToApp = () => {
    props.navigation.dispatch( CommonActions.reset( {
      index: 0,
      routes: [
        {
          name: 'App',
        }
      ],
    } ) )
    setShowLoader(false)
  }

  const renderSeedErrorModal = () => {
    return (
      <ErrorModalContents
        title='Invalid backup phrase'
        info='Please recheck your phrase and try again'
        proceedButtonText={'Go back'}
        onPressProceed={() => props.navigation.goBack()}
      />
    )
  }

  const recoverWalletViaSeed = ( mnemonic: string ) => {
    setShowLoader(true)
    const isValidMnemonic = bip39.validateMnemonic( mnemonic )
    if( isValidMnemonic ) {
      props.navigation.navigate( 'BorderWalletGridScreen', {
        mnemonic,
        isNewWallet: false
      } )
      setShowLoader(false)
    } else {
      Toast( 'Invalid mnemonic' )
      setShowLoader(false)
    }
    // setShowLoader( true )
    // setMnemonic( mnemonic )
    // setTimeout( () => {
    //   const isValidMnemonic = bip39.validateMnemonic( mnemonic )
    //   if ( !isValidMnemonic ) {
    //     setShowLoader( false )
    //     // Alert.alert( 'Invalid mnemonic, try again!' )
    //     setShowAlertModal( true )
    //     return
    //   }
    //   setShowLoader( false )
    //   setLoaderModal( true )
    //   setTimeout( () => {
    //     dispatch( recoverWalletUsingMnemonic( mnemonic ) )
    //   }, 500 )
    // }, 1000 )
  }
  const onBackgroundOfLoader = () => {
    setLoaderModal( false )
    if ( seedRecovered )
      setTimeout( () => {
        console.log( 'TIMEOUT' )
        setLoaderModal( true )
      }, 1000 )
  }
  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      {/* {
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
      } */}
      <SafeAreaView
        style={{
          flex: 0, backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <SeedHeaderComponent
        onPressBack={() => {
          props.navigation.goBack()
        }}
        info1={'Step 1 of Recover Border Wallet'}
        selectedTitle={'Enter Entropy Grid Regeneration Mnemonic'}
        info={'Enter 1 - 6 of 12 word Entropy Grid Regeneration Mnemonic'}
      />
      <View style={{
        flex: 1,
      }}>
        <RestoreSeedPageComponent
          // infoBoxTitle={'Note'}
          // infoBoxInfo={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'}
          onPressConfirm={recoverWalletViaSeed}
          mnemonicSuggestions={mnemonicSuggestions}
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
          isTwelveCheckbox={false}
        />
        <ModalContainer visible={( showSeedError )} onBackground={() => setShowSeedError}>
          {renderSeedErrorModal()}
        </ModalContainer>
      </View>
      <ModalContainer onBackground={onBackgroundOfLoader} visible={loaderModal} closeBottomSheet={() => { }} >
        <LoaderModal
          headerText={loaderMessage.heading}
          messageText={loaderMessage.text}
          subPoints={subPoints}
          bottomText={bottomTextMessage} />
      </ModalContainer>
      <ModalContainer onBackground={() => { setShowAlertModal( false ) }} visible={showAlertModal} closeBottomSheet={() => { }}>
        <AlertModalContents
          // modalRef={this.ErrorBottomSheet}
          // title={''}
          info={'Invalid mnemonic, try again!'}
          proceedButtonText={'Okay'}
          onPressProceed={() => {
            setShowAlertModal( false )
          }}
          isBottomImage={false}
        // bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
      <ModalContainer onBackground={() => { setSeedFailedModal( false ) }} visible={showSeedFailedModal} closeBottomSheet={() => { }}>
        <AlertModalContents
          // modalRef={this.ErrorBottomSheet}
          title={'Wallet Not Found'}
          info={'You can choose to create a new Wallet'}
          proceedButtonText={'Create New Wallet'}
          onPressProceed={() => {
            setSeedFailedModal( false )
            props.navigation.goBack()
          }}
          isBottomImage={false}
        // bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
      <ModalContainer
          onBackground={() => { }}
          closeBottomSheet={() => { }}
          visible={showLoader}
        >
          <RGBIntroModal
            title={'Recovery in Progress'}
            info={'RGB protocol allows you to issue and manage fungible (coins) and non-fungible (collectibles) assets on the bitcoin network'}
            otherText={'Syncing assets with RGB nodes'}
            proceedButtonText={'Continue'}
            isIgnoreButton={false}
            isBottomImage={true}
            bottomImage={require('../../assets/images/icons/contactPermission.png')}
          />
        </ModalContainer>
    </View>
  )
}
export default RecoverBorderWallet
