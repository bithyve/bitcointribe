import React, { useState } from 'react'
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { Input } from 'react-native-elements'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useSelector } from 'react-redux'
import ModalContainer from 'src/components/home/ModalContainer'
import RGBIntroModal from 'src/components/rgb/RGBIntroModal'
import { RGBConfig } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import FormStyles from '../../common/Styles/FormStyles'
import CommonStyles from '../../common/Styles/Styles'
import { translations } from '../../common/content/LocContext'
import Toast from '../../components/Toast'
import RGBServices from '../../services/RGBServices'

export default function RGBSend(props) {
  const strings = translations['settings']
  const common = translations['common']
  const asset = props.route.params?.asset
  const [payTo, setPayTo] = useState(props.route.params?.invoice || '')
  const [amount, setamount] = useState('')
  const [fee, setfee] = useState('')
  const [Sending, setSending] = useState(false)
  const { mnemonic }: RGBConfig = useSelector(state => state.rgb.config)

  async function SendButtonClick() {
    try {
      let response: any = null
      if (asset) {
        if (!payTo || !amount) {
          Toast('Please fill Pay to and amount details!')
          return
        }
        const utxo = payTo.match(/~\/~\/([^?]+)\?/)[1]
        const endpoint = payTo.match(/endpoints=([^&]+)/)[1]
        setSending(true)
        setTimeout(async () => {
          const isValidInvoice = await RGBServices.isValidBlindedUtxo(utxo)
          if (isValidInvoice) {
            response = await RGBServices.sendAsset(asset.assetId, utxo, amount, endpoint)
            setSending(false)
            if (response?.txid) {
              Toast('Sent Successfully')
              props.navigation.goBack()
            } else {
              Toast('Failed')
            }
          } else {
            Toast('Invalid RGB invoice/blinded UTXO')
            setSending(false)
          }
        }, 300)
      } else {
        if (!fee || !payTo || !amount) {
          Toast('Please fill all details!')
          return
        }
        response = await RGBServices.sendBtc(mnemonic, payTo, amount, Number(fee))
      }
      if (response?.txid) {
        Toast('Sent Successfully')
        props.navigation.goBack()
      } else {
        Toast('Failed')
      }
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>

      <SafeAreaView style={{
        flex: 0
      }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
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
      <Text style={styles.headerTitleText}>{common.send}</Text>
      <Text style={styles.headerSubTitleText}>{`Send ${asset?.name || 'BTC'}`}</Text>

      {/* <View style={[ ListStyles.infoHeaderSection, {
        height: '20%', flexDirection: 'row'
      } ]}>
        <Text style={[ styles.infoHeaderText, {
          color: Colors.THEAM_INFO_TEXT_COLOR, paddingTop: 15
        } ]}>{'Sending From:'}</Text>
        <View style={{
          height: '20%',
          justifyContent: 'space-between',
          paddingHorizontal:hp( 4 ),
        }}>
          <Text style={ListStyles.infoHeaderTitleText}>{'Savings Account'}</Text>
          <Text numberOfLines={2} style={styles.infoHeaderText}>{'Available to spend 5,000 sats'}</Text>

        </View>
      </View> */}
      <KeyboardAwareScrollView
        bounces={false}
        overScrollMode="never"
        style={styles.rootContainer}>
        <View style={styles.bodySection}>
          <Input
            inputContainerStyle={[
              FormStyles.textInputContainer,
              styles.textInputContainer,
            ]}
            inputStyle={FormStyles.inputText}
            placeholder={'Invoice/Blinded UTXO'}
            placeholderTextColor={FormStyles.placeholderText.color}
            underlineColorAndroid={'transparent'}
            value={payTo}
            onChangeText={(text) => {
              setPayTo(text)
            }}
            numberOfLines={1}
          />

          <Input
            inputContainerStyle={[
              FormStyles.textInputContainer,
              styles.textInputContainer,
            ]}
            inputStyle={FormStyles.inputText}
            placeholder={'Amount to pay'}
            placeholderTextColor={FormStyles.placeholderText.color}
            underlineColorAndroid={'transparent'}
            value={amount}
            onChangeText={(text) => {
              setamount(text)
            }}
            keyboardType="number-pad"
            numberOfLines={1}
          />
          <Input
            inputContainerStyle={[
              FormStyles.textInputContainer,
              styles.textInputContainer,
            ]}
            inputStyle={FormStyles.inputText}
            placeholder={'Fee rate'}
            placeholderTextColor={FormStyles.placeholderText.color}
            underlineColorAndroid={'transparent'}
            value={fee}
            onChangeText={(text) => {
              setfee(text)
            }}
            keyboardType="number-pad"
            numberOfLines={1}
          />
          <View style={styles.footerSection}>
            <TouchableOpacity onPress={SendButtonClick}>
              <View
                style={styles.sendBtnWrapper}
              >
                <Text style={styles.sendBtnText}>{common.send}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <ModalContainer
          onBackground={() => { }}
          closeBottomSheet={() => { }}
          visible={Sending}
        >
          <RGBIntroModal
            title={'Sending Asset'}
            info={'RGB protocol allows you to issue and manage fungible (coins) and non-fungible (collectibles) assets on the bitcoin network'}
            otherText={'Syncing assets with RGB nodes'}
            proceedButtonText={'Continue'}
            isIgnoreButton={false}
            isBottomImage={true}
            bottomImage={require('../../assets/images/icons/contactPermission.png')}
          />
        </ModalContainer>
      </KeyboardAwareScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
  },
  bodySection: {
    paddingHorizontal: 16,
    flex: 1,
  },

  textInputContainer: {
  },

  footerSection: {
    paddingHorizontal: 26,
    alignItems: 'flex-end',
  },
  sendBtnWrapper: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.blue
  },
  sendBtnText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.Medium
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue(20),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
  },
  headerSubTitleText: {
    fontSize: RFValue(12),
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontFamily: Fonts.Regular,
    marginLeft: 20,
    marginTop: 3,
    marginBottom: 20
  },
  infoHeaderText: {
    fontSize: RFValue(12),
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    fontFamily: Fonts.Regular,
  },

})
