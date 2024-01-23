import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'
import * as bip39 from 'bip39'
import React, { useContext, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP,
  heightPercentageToDP as hp,
  widthPercentageToDP,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux'
import AccountUtilities from '../bitcoin/utilities/accounts/AccountUtilities'
import { AccountType, NetworkType, Wallet } from '../bitcoin/utilities/Interface'
import Colors from '../common/Colors'
import { LocalizationContext } from '../common/content/LocContext'
import BackupWithKeeperState from '../common/data/enums/BackupWithKeeperState'
import Fonts from '../common/Fonts'
import CommonStyles from '../common/Styles/Styles'
import HeaderTitle from '../components/HeaderTitle'
import CoveredQRCodeScanner from '../components/qr-code-scanning/CoveredQRCodeScanner'
import Toast from '../components/Toast'
import { recoverWalletUsingMnemonic, setBackupWithKeeperState } from '../store/actions/BHR'
import { completedWalletSetup } from '../store/actions/setupAndAuth'
import { setVersion } from '../store/actions/versionHistory'


const styles = StyleSheet.create( {
  viewContainer: {
    flex: 1,
    backgroundColor: Colors.LIGHT_BACKGROUND,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  buttonView: {
    height: wp( '12%' ),
    paddingHorizontal: wp( 2 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    // shadowColor: Colors.shadowBlue,
    // shadowOpacity: 1,
    // shadowOffset: {
    //   width: 15, height: 15
    // },
    backgroundColor: Colors.blue,
    marginHorizontal: wp( 4 ),
    marginVertical: hp( '2%' ),
  },
  icArrow: {
    marginLeft: wp( '3%' ),
    marginRight: wp( '3%' ),
    alignSelf: 'center',
  },
  textValue: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 13 ),
    color: Colors.THEAM_INFO_TEXT_COLOR,
    marginLeft: wp( '3%' ),
  },
  textHelpUs: {
    fontFamily: Fonts.SemiBold,
    fontSize: RFValue( 12 ),
    color: Colors.THEAM_TEXT_COLOR,
    marginLeft: wp( '3%' ),
  },
  textHelpUsSub: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 12 ),
    color: Colors.THEAM_INFO_TEXT_COLOR,
    marginLeft: wp( '3%' ),
    marginTop: wp( '1%' ),
  },
  addModalView: {
    backgroundColor: Colors.gray7,
    paddingVertical: 15,
    paddingHorizontal: widthPercentageToDP( 1 ),
    marginHorizontal: widthPercentageToDP( 5 ),
    // flexDirection: 'row',
    display: 'flex',
    width: '90%',
    justifyContent: 'space-between',
    // marginTop: heightPercentageToDP( '5' ),
    alignSelf: 'center',
    borderRadius: widthPercentageToDP( '2' ),
    marginBottom: heightPercentageToDP( '1.2' ),
    shadowOpacity: 0.05,
    // shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 6,
    elevation: 6,
    marginTop:20,
  },
} )


export default function CreateKeeperScreen( { navigation } ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'lightningAccount' ]
  const common = translations[ 'common' ]
  const [ knowMore, setKnowMore ] = useState( true )
  const [ showLoader, setShowLoader ] = useState( false )
  const dispatch = useDispatch()
  const restoreSeedData = useSelector( ( state ) => state.bhr.loading.restoreSeedData )
  const wallet: Wallet = useSelector( ( state: RootStateOrAny ) => state.storage.wallet )
  const [ mnemonic, setMnemonic ] = useState( null )
  const path = AccountUtilities.getDerivationPath( NetworkType.MAINNET, AccountType.CHECKING_ACCOUNT, 0 )

  useEffect( () => {
    setShowLoader( false )
    if ( wallet ) {
      dispatch( completedWalletSetup() )
      AsyncStorage.setItem( 'walletRecovered', 'true' )
      dispatch( setVersion( 'Restored' ) )
      // dispatch( createWithKeeperState( CreateWithKeeperState.BACKEDUP ) )
      dispatch( setBackupWithKeeperState( BackupWithKeeperState.BACKEDUP ) )
      navigation.dispatch( CommonActions.reset( {
        index: 0,
        routes: [ {
          name: 'App',
        } ]
      } ) )
    }
  }, [ wallet ] )

  useEffect( () => {
    if( restoreSeedData == 'restoreSeedDataFailed' ){
      setShowLoader( false )
      setTimeout( () => {
        navigation.navigate( 'NewWalletName', {
          mnemonic,
        } )
      }, 1500 )
    }
  }, [ restoreSeedData ] )

  async function handleBarcodeRecognized( { data: scannedData }: { data: string } ) {
    if( scannedData != null && scannedData.length > 0 ){
      setShowLoader( true )
      let mnemonicData = scannedData.toString()
      mnemonicData = mnemonicData.replace( /,/g, ' ' ).replace( /"/g, '' ).replace( '[', '' ).replace( ']', '' )

      setMnemonic( mnemonicData )
      // setTimeout( () => {
      const isValidMnemonic = bip39.validateMnemonic( mnemonicData )
      if ( !isValidMnemonic ) {
        setShowLoader( false )
        Toast( 'Invalid QR code' )
        return
      }
      // setTimeout( () => {
      dispatch( recoverWalletUsingMnemonic( mnemonicData ) )
      // }, 1000 )
      // }, 2000 )
    } else {
      Toast( 'Invalid QR' )
    }
  }

  return (

    <SafeAreaView style={styles.viewContainer}>
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
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor,
        marginRight: wp( 4 )
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>

      </View>
      <ScrollView
        // overScrollMode="never"
        // bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1
        }}
        keyboardShouldPersistTaps='handled'>
        <HeaderTitle
          firstLineTitle={'Create with Keeper'}
          secondLineTitle={'Scan QR'}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />
        <Text style={{
          fontSize: RFValue( 11 ),
          marginBottom: RFValue( 2 ),
          color: Colors.THEAM_INFO_TEXT_COLOR,
          fontFamily: Fonts.Regular,
          paddingHorizontal: RFValue( 20 )
        }}>{'Open the Keeper App > Go to Linked Wallets >  Select Wallet Backup Phrase > Enter your Keeper passcode > There beneath the hidden Backup Phrase click on Show as QR. Please scan that QR'}</Text>
        <CoveredQRCodeScanner
          onCodeScanned={handleBarcodeRecognized}
          containerStyle={{
            marginBottom: 16,
            height: hp( 35 ),
            width: hp( 40 ),
            marginTop: 20
          }}
        />
        <View
          style={{
          // flex: 1,
            width:wp( '85%' ),
            backgroundColor: Colors.white,
            // borderRadius: wp( 3 ),
            borderRadius: wp( 3 ),
            height: wp( '13%' ),
            paddingLeft: 15,
            paddingRight: 15,
            justifyContent: 'center',
            alignSelf: 'center'
          }}
        >
          <Text style={{
            fontSize: RFValue( 10 ),
            marginBottom: RFValue( 2 ),
            color: Colors.THEAM_INFO_TEXT_COLOR,
            fontFamily: Fonts.Regular
          }}>{'Path'}</Text>

          <Text
            numberOfLines={1}
            style={{
              fontSize: RFValue( 13 ),
              color: Colors.CLOSE_ICON_COLOR,
              fontFamily: Fonts.Regular
            }}
          >
            {path}
          </Text>
        </View>
        <View
          style={{
          // flex: 1,
            width:wp( '85%' ),
            backgroundColor: Colors.white,
            // borderRadius: wp( 3 ),
            borderRadius: wp( 3 ),
            height: wp( '13%' ),
            paddingLeft: 15,
            paddingRight: 15,
            justifyContent: 'center',
            alignSelf: 'center',
            marginTop:wp( 3 )
          }}
        >
          <Text style={{
            fontSize: RFValue( 10 ),
            marginBottom: RFValue( 2 ),
            color: Colors.THEAM_INFO_TEXT_COLOR,
            fontFamily: Fonts.Regular
          }}>{'Purpose'}</Text>

          <Text
            numberOfLines={1}
            style={{
              fontSize: RFValue( 13 ),
              color: Colors.CLOSE_ICON_COLOR,
              fontFamily: Fonts.Regular
            }}
          >
            {'P2SH-P2WPKH: Wrapped segwit'}
          </Text>
        </View>
        <View style={{
          flex:1
        }}/>
        <View
          style={styles.addModalView}
        >
          <Text
            style={styles.textHelpUs}
          >
            {'Note'}
          </Text>
          <Text
            style={styles.textHelpUsSub} numberOfLines={3}
          >
            {'With this option your wallet would be backedup with Keeper automatically'}
          </Text>
        </View>
      </ScrollView>


    </SafeAreaView>
  )
}
