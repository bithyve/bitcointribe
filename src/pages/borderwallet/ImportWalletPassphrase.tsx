import React, { useEffect, useState } from 'react'
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import deviceInfoModule from 'react-native-device-info'
import { RFValue } from 'react-native-responsive-fontsize'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux'
import { Wallet } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { translations } from '../../common/content/LocContext'
import { hp, wp } from '../../common/data/responsiveness/responsive'
import Fonts from '../../common/Fonts'
import ModalContainer from '../../components/home/ModalContainer'
import LoaderModal from '../../components/LoaderModal'
import Toast from '../../components/Toast'
import { recoverWalletUsingMnemonic, restoreSeedWordFailed, setBorderWalletBackup } from '../../store/actions/BHR'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { completedWalletSetup } from 'src/store/actions/setupAndAuth'
import { setVersion } from 'src/store/actions/versionHistory'
import { CommonActions } from '@react-navigation/native'

const ImportWalletPassphrase = ( props ) => {
  const loaderMessage = {
    heading: translations[ 'bhr' ].Importingyourwallet,
    text: translations[ 'bhr' ].Thismaytake
  }
  const subPoints = [
    translations[ 'bhr' ].Settingupmultipleaccounts,
    translations[ 'bhr' ].Preloading,
  ]
  const bottomTextMessage = translations[ 'bhr' ].Hexaencrypts
  const mnemonic = props.route.params?.mnemonic
  const selected = props.route.params?.selected
  const isNewWallet = props.route.params?.isNewWallet
  const isAccountCreation = props.route.params?.isAccountCreation
  const isImportAccount = props.route.params?.isImportAccount
  const checksumWord = props.route.params?.checksumWord
  const [ headerTitle, setHeaderTitle ]=useState( 'Add Passphrase (optional)' )
  const [ passphrase, setpassphrase ] = useState( '' )
  const [ confirmPassphrase, setConfirmPassphrase ] = useState( '' )
  const [ showLoader, setShowLoader ] = useState( false )
  const [ loaderModal, setLoaderModal ] = useState( false )
  const dispatch = useDispatch()
  const wallet: Wallet = useSelector( ( state: RootStateOrAny ) => state.storage.wallet )
  const restoreSeedData = useSelector( ( state ) => state.bhr.loading.restoreSeedData )

  useEffect( () => {
    return () => {
      dispatch( restoreSeedWordFailed( false ) )
    }
  }, [] )

  useEffect( () => {
    if( restoreSeedData == 'restoreSeedDataFailed' ){
      setLoaderModal( false )
      setTimeout( () => {
        Alert.alert( 'No wallet found', 'Do you want to continue creating new wallet?', [
          {
            text: 'No',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Yes', onPress: () => continueToNextStep( '' )
          },
        ] )
      }, 500 )
    }
  }, [ restoreSeedData ] )

    useEffect( () => {
      setLoaderModal( false )
      setTimeout( () => {
        if ( wallet && !isAccountCreation ) {
          dispatch( completedWalletSetup() )
          AsyncStorage.setItem( 'walletRecovered', 'true' )
          dispatch( setVersion( 'Restored' ) )
          props.navigation.dispatch( CommonActions.reset( {
            index: 0,
            routes: [
              {
                name: 'App',
              },
            ]
          } ) )
        }
      }, 100 )
    }, [ wallet, isAccountCreation ] )

  const onPressNext = () => {
    if( passphrase === '' || confirmPassphrase === '' ) {
      Toast( 'Please enter Passphrase and confirm or Skip to proceed without it' )
    } else if( passphrase !== confirmPassphrase ) {
      Toast( 'Passphrase and confirm passphrase does not match' )
    } else {
      onPressSkip( passphrase )
    }
  }

  const continueToNextStep = ( password = '' ) => {
    isAccountCreation?  props.navigation.replace( 'ConfirmDownloadAccount', {
      selected,
      checksumWord,
      mnemonic,
      initialMnemonic: props.route.params?.initialMnemonic,
      gridType: props.route.params?.gridType,
      isAccountCreation,
      passphrase: password
    } ) : props.navigation.replace( 'ConfirmDownload', {
      selected,
      checksumWord,
      mnemonic,
      initialMnemonic: props.route.params?.initialMnemonic,
      gridType: props.route.params?.gridType,
      isImportAccount,
      passphrase: password
    } )
  }

  const onPressSkip = ( password = '' ) => {
    if( isNewWallet ) {
      continueToNextStep( password )
    } else {
      setShowLoader( true )
      setTimeout( () => {
        setLoaderModal( true )
        setTimeout( () => {
          dispatch( recoverWalletUsingMnemonic( mnemonic, props.route.params?.initialMnemonic ) )
        }, 500 )
        dispatch( setBorderWalletBackup( true ) )
      }, 1000 )
    }
  }

  const onBackgroundOfLoader = () => {
    setLoaderModal( false )
  }


  return (
    <SafeAreaView
      style={{
        flex: 1, backgroundColor: Colors.backgroundColor
      }}
    >
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <SeedHeaderComponent
        onPressBack={() => {
          props.navigation.goBack()
        }}
        info1={'Step 6 of Create with Border Wallet'}
        info={'A passphrase in your wallet is not the same as a password. If you change it later, your wallet will still work, but the addresses will be different.'}
        selectedTitle={headerTitle}
      />
      <View style={styles.textInputWrapper}>
        <View>
          <TextInput
            style={
              styles.textBox
            }
            placeholder={'Passphrase'}
            placeholderTextColor={Colors.textColorGrey}
            value={passphrase}
            autoCapitalize='none'
            secureTextEntry
            onChangeText={text => setpassphrase( text )}
          />
        </View>
        <View>
          <TextInput
            style={
              styles.textBox
            }
            placeholder={'Confirm Passphrase'}
            placeholderTextColor={Colors.textColorGrey}
            value={confirmPassphrase}
            autoCapitalize='none'
            onChangeText={text => setConfirmPassphrase( text )}
          />
        </View>
      </View>
      <View style={styles.bottomButtonView}>
        <View style={styles.statusIndicatorView}>
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorActiveView} />
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={()=> onPressSkip( '' )}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={onPressNext}>
            <View
              style={styles.buttonView}
            >
              <Text style={styles.buttonText}>Next</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ModalContainer onBackground={onBackgroundOfLoader}  visible={loaderModal} closeBottomSheet={() => { }} >
        <LoaderModal
          headerText={loaderMessage.heading}
          messageText={loaderMessage.text}
          subPoints={subPoints}
          bottomText={bottomTextMessage} />
      </ModalContainer>

    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  textBox: {
    marginHorizontal: wp( 25 ),
    marginVertical: hp( 10 ),
    paddingLeft: 15,
    height: 50,
    borderRadius: 10,
    color: Colors.textColorGrey,
    fontFamily: Fonts.Light,
    fontSize: RFValue( 13 ),
    backgroundColor: '#FAFAFA'
  },
  textInputWrapper:{
    height: Platform.OS==='ios' ? '64%' : '56%'
  },
  item: {
    flexDirection: 'row',
    width: '87%',
    backgroundColor: '#FAFAFA',
    padding: 15,
    marginVertical: 8,
    marginHorizontal:  wp( 25 ),
    alignItems: 'center'
  },
  indexWrapper: {
    width: '10%'
  },
  gridItemIndex: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.blue,
    opacity: 0.6
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#717171',
    opacity: 0.6
  },
  buttonView: {
    padding: 15,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  bottomButtonView: {
    flexDirection: 'row',
    paddingHorizontal: hp( 30 ),
    paddingBottom: deviceInfoModule.hasNotch() ? hp( 4 ) : hp( 3 ),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText :{
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
    marginRight: 15
  },
  statusIndicatorView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusIndicatorActiveView: {
    height: 10,
    width: 10,
    backgroundColor: Colors.CLOSE_ICON_COLOR,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    height: 7,
    width: 7,
    backgroundColor: Colors.THEAM_TEXT_COLOR,
    borderRadius: 10,
    marginLeft: 5,
  },
} )
export default ImportWalletPassphrase
