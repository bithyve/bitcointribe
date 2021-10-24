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
import { DeepLinkEncryptionType, GiftThemeId, QRCodeTypes, Wallet } from '../../bitcoin/utilities/Interface'
import { LocalizationContext } from '../../common/content/LocContext'
import { AccountsState } from '../../store/reducers/accounts'
import { generateGiftLink } from '../../store/sagas/accounts'
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

    const { updatedGift, deepLink, encryptedChannelKeys, encryptionType, encryptionHint, deepLinkEncryptionOTP, channelAddress, shortLink } = await generateGiftLink( giftToSend, senderName, fcmToken, giftThemeId, note, encryptWithOTP, generateShortLink )
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
              color={Colors.blue}
              size={17}
            />
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => props.navigation.pop( isContact ? 4 : 3 )}
          style={{
            justifyContent: 'center',
            alignItems: 'flex-end',
            backgroundColor: Colors.lightBlue,
            paddingHorizontal: wp( 4 ),
            paddingVertical: wp( 1 ),
            marginRight: wp( 5 ),
            borderRadius: wp( 2 )
          }}
        >
          <Text
            style={{
              ...{
                color: Colors.backgroundColor1,
                fontSize: RFValue( 12 ),
                fontFamily: Fonts.FiraSansRegular,
              }
            }}
          >
            Done
          </Text>
        </TouchableOpacity> */}
      </View>
      <RequestKeyFromContact
        isModal={false}
        headerText={'Send gift'}
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
        onPressShare={() => {
        }}
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
