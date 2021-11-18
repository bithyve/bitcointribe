import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Text,
  Alert
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import CommonStyles from '../../common/Styles/Styles'
import Colors from '../../common/Colors'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import { Account, DeepLinkEncryptionType, Gift, GiftThemeId, QRCodeTypes, Wallet } from '../../bitcoin/utilities/Interface'
import { LocalizationContext } from '../../common/content/LocContext'
import { AccountsState } from '../../store/reducers/accounts'
import { changeGiftStatus, generateGiftLink } from '../../store/sagas/accounts'
import DeviceInfo from 'react-native-device-info'
import { updateGift } from '../../store/actions/accounts'
import { updateWalletImageHealth } from '../../store/actions/BHR'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../common/Fonts'
import dbManager from '../../storage/realm/dbManager'
import BottomInfoBox from '../../components/BottomInfoBox'

export default function SendGift( props ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]

  const giftId = props.navigation.getParam( 'giftId' )
  const note = props.navigation.getParam( 'note' )
  const contact = props.navigation.getParam( 'contact' )
  const senderEditedName = props.navigation.getParam( 'senderName' )
  const themeId = props.navigation.getParam( 'themeId' )
  const accountsState: AccountsState = useSelector( state => state.accounts )
  const wallet: Wallet = useSelector( state => state.storage.wallet )
  const fcmToken: string = useSelector( state => state.preferences.fcmTokenValue )
  const giftToSend = accountsState.gifts[ giftId ]
  const [ encryptWithOTP, setEncryptWithOTP ] = useState( true )
  const [ encryptionOTP, setEncryptionOTP ] = useState( '' )
  const [ giftDeepLink, setGiftDeepLink ] = useState( '' )
  const [ giftQR, setGiftQR ] = useState( '' )
  const [ giftThemeId, setGiftThemeId ] = useState( themeId?? GiftThemeId.ONE )
  const [ updatedGiftObject, setUpdatedGiftObject ]: [Gift, any] = useState( )
  const [ encryptionKey, setEncryptionKey ]: [string, any] = useState( '' )
  const account: Account = giftToSend && giftToSend.sender.accountId ? accountsState.accounts[ giftToSend.sender.accountId ] : null
  const dispatch = useDispatch()

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  const sendGift  = async () => {
    const senderName = wallet.userName? wallet.userName: wallet.walletName
    const generateShortLink = true
    // nullify pre-existing properties(case: re-send)
    giftToSend.receiver = {
    }
    giftToSend.sender.contactId = null

    const { updatedGift, deepLink, encryptedChannelKeys, encryptionType, encryptionHint, deepLinkEncryptionOTP, channelAddress, shortLink, encryptionKey } = await generateGiftLink( giftToSend, senderName, fcmToken, giftThemeId, note, encryptWithOTP, generateShortLink )
    setUpdatedGiftObject( updatedGift )
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

  const updateStatusToSent = async() =>{
    const senderName = wallet.userName? wallet.userName: wallet.walletName
    const { updatedGift } = await changeGiftStatus( encryptionKey, updatedGiftObject, senderName, fcmToken, giftThemeId, note )
    setUpdatedGiftObject( updatedGift )
    setEncryptionKey( encryptionKey )
    dispatch( updateGift( updatedGift ) )
    dbManager.createGift( updatedGift  )
    dispatch( updateWalletImageHealth( {
      updateGifts: true,
      giftIds: [ updatedGift.id ]
    } ) )
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
              color={Colors.blue}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <RequestKeyFromContact
        isModal={false}
        headerText={'Send Gift'}
        subHeaderText={'You can send it to anyone using the QR or the link'}
        contactText={strings.adding}
        isGift={true}
        encryptLinkWith={DeepLinkEncryptionType.OTP}
        encryptionKey={encryptionOTP}
        themeId={themeId}
        senderName={senderEditedName}
        contact={{
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
        amt={numberWithCommas( giftToSend.amount )}
        onPressShare={() => updateStatusToSent()}
        accountName={account.accountName}
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
