import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
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
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import Bitcoin from '../../bitcoin/utilities/accounts/Bitcoin'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { makeAddressRecipientDescription } from '../../utils/sending/RecipientFactories'
import { addRecipientForSending, amountForRecipientUpdated, recipientSelectedForAmountSetting, sourceAccountSelectedForSending } from '../../store/actions/sending'
import { Satoshis } from '../../common/data/enums/UnitAliases'

export type Props = {
  navigation: any;
};

const HeaderSection: React.FC = () => {
  return (
    <View style={styles.infoHeaderSection}>
      <Text style={ListStyles.infoHeaderSubtitleText}>
        Scan a Bitcoin address or any Hexa QR
      </Text>
    </View>
  )
}

const HomeQRScannerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const accountsState = useSelector( ( state ) => state.accounts, )

  function handleBarcodeRecognized( { data: dataString }: { data: string } ) {
    dispatch( clearTransfer( REGULAR_ACCOUNT ) )
    const network = Bitcoin.networkType( dataString )
    if ( network ) {
      const serviceType =
        network === 'MAINNET' ? REGULAR_ACCOUNT : TEST_ACCOUNT // default service type

      const service = accountsState[ serviceType ].service
      const { type } = service.addressDiff( dataString )

      if ( type=='address' ) {
        onSend( dataString, 0 )
      } else if( type=='paymentURI' )  {
        const res = service.decodePaymentURI( dataString )
        const address = res.address
        const options = res.options
        let donationId = null
        // checking for donationId to send note
        if ( options && options.message ) {
          const rawMessage = options.message
          donationId = rawMessage.split( ':' ).pop().trim()
        }

        onSend( address, options.amount )
      }
      return
    }

    const onCodeScanned = navigation.getParam( 'onCodeScanned' )
    if ( typeof onCodeScanned === 'function' ) {
      const data = getFormattedStringFromQRString( dataString )
      onCodeScanned( data )
    }

    navigation.goBack( null )
  }

  function onSend( address: string, amount: Satoshis ) {
    const recipient = makeAddressRecipientDescription( {
      address,
    } )

    dispatch( clearTransfer( REGULAR_ACCOUNT ) )
    dispatch( sourceAccountSelectedForSending(
      accountsState.accountShells.find( shell => shell.primarySubAccount.kind == SubAccountKind.REGULAR_ACCOUNT )
    ) )
    dispatch( addRecipientForSending( recipient ) )
    dispatch( recipientSelectedForAmountSetting( recipient ) )
    dispatch( amountForRecipientUpdated( {
      recipient,
      amount
    } ) )

    navigation.dispatch(
      resetStackToSend( {
        selectedRecipientID: recipient.id,
      } )
    )
  }

  return (
    <View style={styles.rootContainer}>
      <KeyboardAwareScrollView
        resetScrollToCoords={{
          x: 0, y: 0
        }}
        scrollEnabled={false}
        style={styles.rootContainer}
      >
        <HeaderSection />

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
            placeholder="Enter address manually"
            sourceAccountKind={SourceAccountKind.REGULAR_ACCOUNT}
            onAddressEntered={( address ) => {
              onSend( address, 0 )
            }}
          />
        </View>

        <View
          style={styles.floatingActionButtonContainer}
        >
          <Button
            raised
            title="Receive Bitcoins"
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
            onPress={() => { navigation.navigate( 'ReceiveQR' )}}
          />
        </View>
        <View style={{
          marginTop: 'auto'
        }}>
          <BottomInfoBox
            style
            title="What can you scan?"
            infoText="
          Scan a bitcoin address, a Hexa Friends and Family request, a Hexa Keeper request, or a restore request
        "
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}

const styles = StyleSheet.create( {
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
  },
} )

export default HomeQRScannerScreen


