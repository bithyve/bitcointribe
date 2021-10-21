import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native'
import BottomInfoBox from '../../components/BottomInfoBox'
import getFormattedStringFromQRString from '../../utils/qr-codes/GetFormattedStringFromQRData'
import ListStyles from '../../common/Styles/ListStyles'
import CoveredQRCodeScanner from '../../components/qr-code-scanning/CoveredQRCodeScanner'
import RecipientAddressTextInputSection from '../../components/send/RecipientAddressTextInputSection'
import { REGULAR_ACCOUNT, TEST_ACCOUNT } from '../../common/constants/wallet-service-types'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import { useDispatch, useSelector } from 'react-redux'
import { clearTransfer } from '../../store/actions/accounts'
import { resetStackToSend } from '../../navigation/actions/NavigationActions'
import { Button } from 'react-native-elements'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { makeAddressRecipientDescription } from '../../utils/sending/RecipientFactories'
import { addRecipientForSending, amountForRecipientUpdated, recipientSelectedForAmountSetting, sourceAccountSelectedForSending } from '../../store/actions/sending'
import { Satoshis } from '../../common/data/enums/UnitAliases'
import { AccountType, DeepLinkEncryptionType, NetworkType, ScannedAddressKind } from '../../bitcoin/utilities/Interface'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import { AccountsState } from '../../store/reducers/accounts'
import { translations } from '../../common/content/LocContext'
import ModalContainer from '../../components/home/ModalContainer'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import Ionicons from 'react-native-vector-icons/Ionicons'
import CheckingAccount from '../../assets/images/accIcons/icon_checking.svg'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import DashedContainer from '../FriendsAndFamily/DashedContainer'
import Illustration from '../../assets/images/svgs/illustration.svg'
import { NavigationActions, StackActions } from 'react-navigation'
import AcceptGift from '../FriendsAndFamily/AcceptGift'
import { launchImageLibrary } from 'react-native-image-picker'
import LocalQRCode from '@remobile/react-native-qrcode-local-image'
import Toast from '../../components/Toast'

export type Props = {
  navigation: any;
};

const HeaderSection: React.FC = ( { title } ) => {
  return (
    <View style={styles.infoHeaderSection}>
      <Text style={ListStyles.infoHeaderSubtitleText}>
        {title}
      </Text>
    </View>
  )
}

const HomeQRScannerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const accountsState: AccountsState = useSelector( ( state ) => state.accounts, )
  const defaultSourceAccount = accountsState.accountShells.find( shell => shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT && !shell.primarySubAccount.instanceNumber )
  const common = translations[ 'common' ]
  const strings = translations[ 'accounts' ]
  function handleBarcodeRecognized( { data: scannedData }: { data: string } ) {
    console.log( 'scannedData', scannedData )
    const networkType: NetworkType = AccountUtilities.networkType( scannedData )
    if ( networkType ) {
      const network = AccountUtilities.getNetworkByType( networkType )
      const { type } = AccountUtilities.addressDiff( scannedData, network )
      if ( type === ScannedAddressKind.ADDRESS ) {
        onSend( scannedData, 0 )
      } else if ( type === ScannedAddressKind.PAYMENT_URI ) {
        const res = AccountUtilities.decodePaymentURI( scannedData )
        const address = res.address
        const options = res.options

        onSend( address, options.amount )
      }
      return
    }

    const onCodeScanned = navigation.getParam( 'onCodeScanned' )
    if ( typeof onCodeScanned === 'function' ) onCodeScanned( getFormattedStringFromQRString( scannedData ) )
    navigation.goBack( null )
  }

  function onSend( address: string, amount: Satoshis ) {
    const recipient = makeAddressRecipientDescription( {
      address
    } )

    dispatch( sourceAccountSelectedForSending(
      defaultSourceAccount
    ) )
    dispatch( addRecipientForSending( recipient ) )
    dispatch( recipientSelectedForAmountSetting( recipient ) )
    dispatch( amountForRecipientUpdated( {
      recipient,
      amount: amount < 1 ? amount * SATOSHIS_IN_BTC : amount
    } ) )

    navigation.dispatch(
      resetStackToSend( {
        selectedRecipientID: recipient.id,
      } )
    )
  }


  function importImage() {
    launchImageLibrary(
      {
        title: null,
        mediaType: 'photo',
        takePhotoButtonTitle: null,
        selectionLimit: 1,
      },
      response => {
        if ( response.assets ) {
          const uri = response.assets[ 0 ].uri.toString().replace( 'file://', '' )
          LocalQRCode.decode( uri, ( error, result ) => {
            if ( !error ) {
              handleBarcodeRecognized( {
                data: result
              } )
            } else {
              Toast( 'No QR code found in the selected image' )
            }
          } )
        }
      },
    )
  }

  return (
    <View style={styles.rootContainer}>
      <ScrollView>
        <KeyboardAwareScrollView
          resetScrollToCoords={{
            x: 0, y: 0
          }}
          scrollEnabled={false}
          style={styles.rootContainer}
        >
          <HeaderSection title={strings.ScanaBitcoinaddress} />

          <CoveredQRCodeScanner
            onCodeScanned={handleBarcodeRecognized}
            containerStyle={{
              marginBottom: 16
            }}
          />

          <View style={styles.viewSectionContainer}>
            <RecipientAddressTextInputSection
              containerStyle={{
                margin: 0, padding: 0
              }}
              placeholder={strings.Enteraddressmanually}
              accountShell={defaultSourceAccount}
              onAddressEntered={( address ) => {
                onSend( address, 0 )
              }}
              onPaymentURIEntered={( uri ) => {
                const decodingResult = AccountUtilities.decodePaymentURI( uri )

                const address = decodingResult.address
                const options = decodingResult.options

                let amount = 0
                if ( options?.amount )
                  amount = options.amount

                onSend( address, amount )
              }}
            />
          </View>

          <View
            style={styles.floatingActionButtonContainer}
          >
            <TouchableOpacity onPress={importImage} style={styles.btnImport}>
              <Ionicons
                name="image"
                size={22}
                color="gray"
              />
              <Text style={styles.textImport}>Import From Gallery</Text>
            </TouchableOpacity>

            <Button
              raised
              title={strings.Receivebitcoin}
              icon={
                <Image
                  source={require( '../../assets/images/icons/icon_bitcoin_light.png' )}
                  style={{
                    width: widthPercentageToDP( 4 ),
                    height: widthPercentageToDP( 4 ),
                    resizeMode: 'contain',
                  }}
                />
              }
              buttonStyle={{
                ...ButtonStyles.floatingActionButton,
                borderRadius: 9999,
                paddingHorizontal: widthPercentageToDP( 5 )
              }}
              titleStyle={{
                ...ButtonStyles.floatingActionButtonText,
                marginLeft: 8,
              }}
              onPress={() => { navigation.navigate( 'ReceiveQR' ) }}
            />
          </View>
          {
            __DEV__ && (
              <TouchableOpacity onPress={() => {
                const qrScannedData = {
                  data: '{"type":"KEEPER_REQUEST","channelKey":"nBeLSFNLxhRmuq4JWNQTBWgv","walletName":"Scas","secondaryChannelKey":"HcB1rVJrYMss0QjlyDD1KRPA","version":"1.9.0"}'
                }
                handleBarcodeRecognized( qrScannedData )
              }} >
                <Text>Continue</Text>
              </TouchableOpacity>
            )
          }

          <View style={{
            marginTop: 'auto'
          }}>
            <BottomInfoBox
              style
              title={strings.Whatcanyouscan}
              infoText={strings.scan}
            />
          </View>
        </KeyboardAwareScrollView>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create( {
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  buttonView: {
    height: widthPercentageToDP( '12%' ),
    width: widthPercentageToDP( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
  },
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
    lineHeight: 15,
  },
  balanceText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalInfoText: {
    // marginTop: hp( '3%' ),
    marginTop: heightPercentageToDP( 0.5 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: widthPercentageToDP( 12 ),
    letterSpacing: 0.6
  },
  modalContentContainer: {
    // height: '100%',
    backgroundColor: Colors.backgroundColor,
    paddingBottom: heightPercentageToDP( 4 ),
  },
  rootContainer: {
    flex: 1
  },
  viewSectionContainer: {
    marginBottom: 16,
  },
  infoHeaderSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  floatingActionButtonContainer: {
    bottom: heightPercentageToDP( 1.5 ),
    right: 0,
    marginLeft: 'auto',
    padding: heightPercentageToDP( 1.5 ),
    //flexDirection: 'row'
  },
  btnImport: {
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  textImport: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    marginHorizontal: 2,
  }
} )

export default HomeQRScannerScreen


