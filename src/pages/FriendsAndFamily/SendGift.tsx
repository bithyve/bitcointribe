import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Text
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
import { GiftStatus, QRCodeTypes, Wallet } from '../../bitcoin/utilities/Interface'
import { LocalizationContext } from '../../common/content/LocContext'
import { AccountsState } from '../../store/reducers/accounts'
import { generateGiftLink } from '../../store/sagas/accounts'
import DeviceInfo from 'react-native-device-info'
import { updateGift } from '../../store/actions/accounts'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../common/Fonts'

export default function SendGift( props ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]

  const giftId = props.navigation.getParam( 'giftId' )
  const accountsState: AccountsState = useSelector( state => state.accounts )
  const wallet: Wallet = useSelector( state => state.storage.wallet )
  const giftToSend = accountsState.gifts[ giftId ]
  const [ note, setNote ] = useState( '' )
  const [ encryptWithOTP, setEncryptWithOTP ] = useState( false )
  const [ giftDeepLink, setGiftDeepLink ] = useState( '' )
  const [ giftQR, setGiftQR ] = useState( '' )
  const dispatch = useDispatch()

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  useEffect( () => {
    const { deepLink, encryptedChannelKeys, encryptionType, encryptionHint, deepLinkEncryptionOTP } = generateGiftLink( giftToSend, wallet.walletName, note, encryptWithOTP )
    setGiftDeepLink( deepLink )
    setGiftQR( JSON.stringify( {
      type: QRCodeTypes.GIFT,
      encryptedChannelKeys: encryptedChannelKeys,
      encryptionType,
      encryptionHint,
      walletName: wallet.walletName,
      amount: giftToSend.amount,
      note,
      version: DeviceInfo.getVersion(),
    } ) )

    giftToSend.status = GiftStatus.SENT
    dispatch( updateGift( giftToSend ) )
  }, [ giftId, note ] )

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
        <TouchableOpacity
          onPress={() => props.navigation.pop( 3 )}
          style={{
            justifyContent: 'center',
            alignItems: 'flex-end',
            backgroundColor: Colors.blue,
            paddingHorizontal: wp( 2 ),
            paddingVertical: wp( 1 ),
            marginRight: wp( 5 ),
            borderRadius: wp( 2 )
          }}
        >
          <Text
            style={{
              ...{
                color: Colors.white,
                fontSize: RFValue( 13 ),
                fontFamily: Fonts.FiraSansRegular,
              }
            }}
          >
            Done
          </Text>
        </TouchableOpacity>
      </View>
      <RequestKeyFromContact
        isModal={false}
        headerText={'Send gift'}
        subHeaderText={'You can choose to send it to anyone using the QR or the link'}
        contactText={strings.adding}
        isGift={true}
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
        onSetNote={setNote}
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
