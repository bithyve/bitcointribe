import React from 'react'
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Button } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch, useSelector } from 'react-redux'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import { AccountType, NetworkType, ScannedAddressKind } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { translations } from '../../common/content/LocContext'
import { Satoshis } from '../../common/data/enums/UnitAliases'
import Fonts from '../../common/Fonts'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import CommonStyles from '../../common/Styles/Styles'
import BottomInfoBox from '../../components/BottomInfoBox'
import HeaderTitle from '../../components/HeaderTitle'
import CoveredQRCodeScanner from '../../components/qr-code-scanning/CoveredQRCodeScanner'
import RecipientAddressTextInputSection from '../../components/send/RecipientAddressTextInputSection'
import { resetStackToSend } from '../../navigation/actions/NavigationActions'
import { addRecipientForSending, amountForRecipientUpdated, recipientSelectedForAmountSetting, sourceAccountSelectedForSending } from '../../store/actions/sending'
import { AccountsState } from '../../store/reducers/accounts'
import getFormattedStringFromQRString from '../../utils/qr-codes/GetFormattedStringFromQRData'
import { makeAddressRecipientDescription } from '../../utils/sending/RecipientFactories'
// import LocalQRCode from '@remobile/react-native-qrcode-local-image'

export type Props = {
  navigation: any;
  route: any;
};

// const HeaderSection: React.FC = ( { title } ) => {
//   return (
//     <View style={styles.infoHeaderSection}>
//       <Text style={ListStyles.infoHeaderSubtitleText}>
//         {title}
//       </Text>
//     </View>
//   )
// }

const HomeQRScannerScreen: React.FC<Props> = ({ navigation, route }: Props) => {
  const dispatch = useDispatch()
  const accountsState: AccountsState = useSelector((state) => state.accounts,)
  const defaultSourceAccount = accountsState.accountShells.find(shell => shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT && !shell.primarySubAccount.instanceNumber)
  const common = translations['common']
  const strings = translations['accounts']
  function handleBarcodeRecognized({ data: scannedData }: { data: string }) {
    const networkType: NetworkType = AccountUtilities.networkType(scannedData)
    if (networkType) {
      const network = AccountUtilities.getNetworkByType(networkType)
      const { type } = AccountUtilities.addressDiff(scannedData, network)
      if (type === ScannedAddressKind.ADDRESS) {
        onSend(scannedData, 0)
      } else if (type === ScannedAddressKind.PAYMENT_URI) {
        const res = AccountUtilities.decodePaymentURI(scannedData)
        const address = res.address
        const options = res.options

        onSend(address, options.amount)
      }
      return
    }

    const onCodeScanned = route.params?.onCodeScanned
    try {
      if (typeof onCodeScanned === 'function') onCodeScanned(getFormattedStringFromQRString(scannedData))
    } catch (error) {
      //
    }
    navigation.goBack(null)
  }

  function onSend(address: string, amount: Satoshis) {
    const recipient = makeAddressRecipientDescription({
      address
    })

    dispatch(sourceAccountSelectedForSending(
      defaultSourceAccount
    ))
    dispatch(addRecipientForSending(recipient))
    dispatch(recipientSelectedForAmountSetting(recipient))
    dispatch(amountForRecipientUpdated({
      recipient,
      amount: amount < 1 ? amount * SATOSHIS_IN_BTC : amount
    }))

    navigation.dispatch(
      resetStackToSend({
        selectedRecipientID: recipient.id,
      })
    )
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.pop()
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
      <HeaderTitle
        firstLineTitle={'QR'}
        secondLineTitle={strings.ScanaBitcoinaddress}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <KeyboardAwareScrollView
          resetScrollToCoords={{
            x: 0, y: 0
          }}
          scrollEnabled={false}
        // style={styles.rootContainer}
        >
          {/* <HeaderSection title={strings.ScanaBitcoinaddress} /> */}

          <CoveredQRCodeScanner
            onCodeScanned={handleBarcodeRecognized}
            containerStyle={{
              marginVertical: 16
            }}
          />

          <View style={styles.viewSectionContainer}>
            <RecipientAddressTextInputSection
              containerStyle={{
                margin: 0, padding: 0
              }}
              placeholder={strings.Enteraddressmanually}
              accountShell={defaultSourceAccount}
              onAddressEntered={(address) => {
                onSend(address, 0)
              }}
              onPaymentURIEntered={(uri) => {
                const decodingResult = AccountUtilities.decodePaymentURI(uri)

                const address = decodingResult.address
                const options = decodingResult.options

                let amount = 0
                if (options?.amount)
                  amount = options.amount

                onSend(address, amount)
              }}
              address={''}
            />
          </View>

          <View
            style={styles.floatingActionButtonContainer}
          >

            <Button
              raised
              title={strings.Receivebitcoin}
              icon={
                <Image
                  source={require('../../assets/images/icons/icon_bitcoin_light.png')}
                  style={{
                    width: widthPercentageToDP(4),
                    height: widthPercentageToDP(4),
                    resizeMode: 'contain',
                  }}
                />
              }
              containerStyle={{
                borderRadius: 9999,
              }}
              buttonStyle={{
                ...ButtonStyles.floatingActionButton,
                borderRadius: 9999,
                paddingHorizontal: widthPercentageToDP(5)
              }}
              titleStyle={{
                ...ButtonStyles.floatingActionButtonText,
                marginLeft: 8,
              }}
              onPress={() => { navigation.navigate('ReceiveQR') }}
            />
          </View>
          {/* {
            __DEV__ && (
              <TouchableOpacity onPress={() => {
                const qrScannedData = {
                  data: '{"type":"KEEPER_REQUEST","encryptedChannelKeys":"0BvnLFWTJfNP3hFy43qYk136-upToEzzuNHJ75QYqyRz9Q6Lc","encryptionType":"DEFAULT","encryptionHint":"","walletName":"Asa","version":"2.0.8","currentLevel":1}'
                }
                handleBarcodeRecognized( qrScannedData )
              }} >
                <Text>Continue</Text>
              </TouchableOpacity>
            )
          } */}

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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.Medium,
  },
  buttonView: {
    height: widthPercentageToDP('12%'),
    width: widthPercentageToDP('35%'),
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
    fontSize: RFValue(10),
    fontFamily: Fonts.Italic,
    lineHeight: 15,
  },
  balanceText: {
    color: Colors.blue,
    fontSize: RFValue(10),
    fontFamily: Fonts.Italic,
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.Regular,
  },
  modalInfoText: {
    // marginTop: hp( '3%' ),
    marginTop: heightPercentageToDP(0.5),
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.Regular,
    marginRight: widthPercentageToDP(12),
    letterSpacing: 0.6
  },
  modalContentContainer: {
    // height: '100%',
    backgroundColor: Colors.backgroundColor,
    paddingBottom: heightPercentageToDP(4),
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
    marginTop: 5,
  },
  floatingActionButtonContainer: {
    bottom: heightPercentageToDP(2),
    right: 0,
    marginLeft: 'auto',
    padding: heightPercentageToDP(1.5),
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
    fontSize: RFValue(13),
    fontFamily: Fonts.Regular,
    marginHorizontal: 2,
  }
})

export default HomeQRScannerScreen


