import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch, useSelector } from 'react-redux'
import { Account, DeepLinkEncryptionType, GiftThemeId, QRCodeTypes, Wallet } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import CommonStyles from '../../common/Styles/Styles'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { LocalizationContext } from '../../common/content/LocContext'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import dbManager from '../../storage/realm/dbManager'
import { updateWalletImageHealth } from '../../store/actions/BHR'
import { updateGift } from '../../store/actions/accounts'
import { AccountsState } from '../../store/reducers/accounts'
import { generateGiftLink } from '../../store/sagas/accounts'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'

export default function SendGift( props ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]

  const giftId = props.route.params?.giftId
  const note = props.route.params?.note
  const contactDetails = props.route.params?.selectedContact
  const giftLinkEncryptionType: DeepLinkEncryptionType = props.route.params?.encryptionType

  const secretPhrase = props.route.params?.secretPhrase
  const secretPhraseHint = props.route.params?.secretPhraseHint
  const senderEditedName = props.route.params?.senderName
  const themeId = props.route.params?.themeId
  const accountsState: AccountsState = useSelector( state => state.accounts )
  const wallet: Wallet = useSelector( state => state.storage.wallet )
  const fcmToken: string = useSelector( state => state.preferences.fcmTokenValue )
  const giftToSend = accountsState.gifts[ giftId ]
  const [ encryptionOTP, setEncryptionOTP ] = useState( '' )
  const [ giftDeepLink, setGiftDeepLink ] = useState( '' )
  const [ giftQR, setGiftQR ] = useState( '' )
  const [ giftThemeId, setGiftThemeId ] = useState( themeId?? GiftThemeId.ONE )
  const [ encryptionKey, setEncryptionKey ]: [string, any] = useState( '' )
  const account: Account = giftToSend && giftToSend.sender.accountId ? accountsState.accounts[ giftToSend.sender.accountId ] : null
  const dispatch = useDispatch()
  const currencyKind = useSelector(
    ( state ) => state.preferences.giftCurrencyKind,
  )
  const currencyCode = useCurrencyCode()
  const exchangeRates = useSelector(
    ( state ) => state.accounts.exchangeRates
  )
  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )


  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  const getAmt = ( sats ) => {
    if( prefersBitcoin ) {
      return numberWithCommas( sats )
    } else {
      if( exchangeRates && exchangeRates[ currencyCode ] ) {
        return ( exchangeRates[ currencyCode ].last /SATOSHIS_IN_BTC * sats ).toFixed( 2 )
      } else {
        return numberWithCommas( sats )
      }
    }
  }

  const sendGift  = async () => {
    const senderName = wallet.userName? wallet.userName: wallet.walletName
    const generateShortLink = true
    // nullify pre-existing properties(case: re-send)
    giftToSend.receiver = {
    }
    giftToSend.sender.contactId = null

    const { updatedGift, deepLink, encryptedChannelKeys, encryptionType, encryptionHint, deepLinkEncryptionOTP, channelAddress, shortLink, encryptionKey } = await generateGiftLink( giftToSend, senderName, fcmToken, giftThemeId, note, giftLinkEncryptionType, generateShortLink, secretPhrase, secretPhraseHint )
    setEncryptionKey( encryptionKey )
    dispatch( updateGift( updatedGift ) )
    dbManager.createGift( updatedGift  )
    dispatch( updateWalletImageHealth( {
      updateGifts: true,
      giftIds: [ updatedGift.id ]
    } ) )
    const link = shortLink !== '' ? shortLink: deepLink
    setGiftDeepLink( link )
    setGiftQR( JSON.stringify( {
      type: QRCodeTypes.GIFT,
      encryptedChannelKeys: encryptedChannelKeys,
      encryptionType,
      encryptionHint,
      walletName: senderName,
      channelAddress,
      amount: giftToSend.amount,
      note,
      themeId: giftToSend.themeId,
      version: DeviceInfo.getVersion(),
    } ) )
    setEncryptionOTP( deepLinkEncryptionOTP )
  }

  useEffect( () => {
    sendGift()
  }, [ giftId ] )

  return (
    <ScrollView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView
        style={{
          backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor,
        flexDirection: 'row',
        justifyContent: 'space-between'
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.pop( 3 )
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
      <RequestKeyFromContact
        navigation={props.navigation}
        isModal={false}
        headerText={'Send Gift'}
        subHeaderText={'You can send it to anyone using the QR or the link'}
        contactText={strings.adding}
        isGift={true}
        encryptLinkWith={giftLinkEncryptionType}
        encryptionKey={encryptionOTP}
        themeId={themeId}
        senderName={senderEditedName}
        contact={contactDetails?{
          contactDetails
        }:{
        }}
        QR={giftQR}
        link={giftDeepLink}
        contactEmail={''}
        onPressBack={() => {
          props.navigation.goBack()
        }}
        onPressDone={() => {
          // openTimer()
        }}
        amt={giftToSend.amount}
        giftNote={giftToSend.note}
        onPressShare={() => {}}
        accountName={account?.accountName}
      />
    </ScrollView>
  )
}
const styles = StyleSheet.create( {
  contactProfileView: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: hp( '1.7%' ),
  },
} )
