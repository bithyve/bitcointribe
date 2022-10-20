
import React, { useState, useEffect, useCallback, createRef } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  Alert,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
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
import { recoverWalletUsingMnemonic, restoreSeedWordFailed } from '../../store/actions/BHR'
import { completedWalletSetup } from '../../store/actions/setupAndAuth'
import { setVersion } from '../../store/actions/versionHistory'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Wallet } from '../../bitcoin/utilities/Interface'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import LoaderModal from '../../components/LoaderModal'
import { translations } from '../../common/content/LocContext'
import AlertModalContents from '../../components/AlertModalContents'
import ErrorModalContents from '../../components/ErrorModalContents'
import { NavigationContext } from 'react-navigation'
import Clipboard from '@react-native-clipboard/clipboard'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { RFValue } from 'react-native-responsive-fontsize'

const RestoreSeedWordsContent = ( props ) => {
  const [ seedWordModal, setSeedWordModal ] = useState( false )
  const [ confirmSeedWordModal, setConfirmSeedWordModal ] = useState( false )
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
  const [clipboard, setClipboard] = useState(false);
  const [clipData, setClipData] = useState([]);
  const [data, setData] = useState([]);

  const fetchCopiedText = async () => {
    const text = await Clipboard.getString();

    const phrases = text.split(' ');

    const regex = /^[a-zA-Z ]*$/;

    if (regex.test(text) && (phrases.length === 12 || phrases.length === 24)) {
      const ph = phrases.map((d, idx) => ({
        id: idx + 1,
        name: d,
      }))

      setClipData(ph);
      return true;
    }

    return false;
  };

  useEffect( () => {
    // console.log( 'skk sugg words', JSON.stringify( mnemonicSuggestions ) )
    fetchCopiedText().then(setClipboard);

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
      props.navigation.navigate( 'HomeNav' )
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

  const ClipboardHasSeedWords = () => {
    return (
      <View style={{
        height: hp(35),
        backgroundColor: '#F8F8F8',
      }}>
        <AppBottomSheetTouchableWrapper
          onPress={() => setClipboard(false)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            alignSelf: "flex-end",
            backgroundColor: "#77B9EB",
            alignItems: "center",
            justifyContent: "center",
            marginTop: wp(3),
            marginRight: wp(3),
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={RFValue(15)} />
        </AppBottomSheetTouchableWrapper>

        <Text
          style={{
            fontSize: RFValue(18),
            color: "#006CB4",
            fontFamily: Fonts.FiraSansRegular,
            marginHorizontal: RFValue(40),
          }}
        >
          Paste seed words?
        </Text>

        <Text
          style={{
            fontSize: RFValue(12),
            color: "#8B8B8B",
            fontFamily: Fonts.FiraSansRegular,
            marginHorizontal: RFValue(40),
            marginTop: hp(2),
          }}
        >
          Various words were detected in your clipboard.
        </Text>

        <Text
          style={{
            fontSize: RFValue(12),
            color: "#8B8B8B",
            fontFamily: Fonts.FiraSansRegular,
            marginHorizontal: RFValue(40),
          }}
        >
          Would you like to paste these words in these fields?
        </Text>

        <View style={{flex: 1}} />

        <View style={{
          flexDirection: 'row',
          marginHorizontal: RFValue(40),
          marginBottom: hp(3),
        }}>
          <TouchableOpacity 
            style={{
              backgroundColor: '#006DB4',
              paddingHorizontal: wp(5),
              height: hp(6),
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => {
              setData(clipData)
              setClipboard(false)
            }}
          >
            <Text style={{fontFamily: Fonts.FiraSansMedium, color: '#FAFAFA', fontSize: RFValue(13)}}>
              Paste words
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              padding: wp(5),
              marginHorizontal: wp(2),
            }}
            onPress={() => setClipboard(false)}
          >
            <Text style={{fontFamily: Fonts.FiraSansMedium, fontSize: RFValue(13)}}>
              Enter Manually
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const recoverWalletViaSeed = ( mnemonic: string ) => {
    setShowLoader( true )
    setMnemonic( mnemonic )
    setTimeout( () => {
      const isValidMnemonic = bip39.validateMnemonic( mnemonic )
      if ( !isValidMnemonic ) {
        setShowLoader( false )
        // Alert.alert( 'Invalid mnemonic, try again!' )
        setShowAlertModal( true )
        return
      }
      setShowLoader( false )
      setLoaderModal( true )
      setTimeout( () => {
        dispatch( recoverWalletUsingMnemonic( mnemonic ) )
      }, 500 )
    }, 1000 )
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
        selectedTitle={'Enter backup phrase'}
        moreInfo={''}
      />
      <View style={{
        flex: 1,
      }}>
        <RestoreSeedPageComponent
          // infoBoxTitle={'Note'}
          // infoBoxInfo={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'}
          onPressConfirm={recoverWalletViaSeed}
          mnemonicSuggestions={mnemonicSuggestions}
          data={data}
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
        onBackground={() => setClipboard(false)}
        visible={clipboard}
        closeBottomSheet={() => {}}
      >
        <ClipboardHasSeedWords />
      </ModalContainer>
    </View>
  )
}
export default RestoreSeedWordsContent
