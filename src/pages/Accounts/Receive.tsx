import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  Alert,
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import NavStyles from '../../common/Styles/NavStyles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import BottomInfoBox from '../../components/BottomInfoBox'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'

import {
  TEST_ACCOUNT,
} from '../../common/constants/wallet-service-types'

import {
  setReceiveHelper,
  setSavingWarning,
} from '../../store/actions/preferences'
import { getAccountIcon, getAccountTitle } from './Send/utils'
import KnowMoreButton from '../../components/KnowMoreButton'
import QRCode from 'react-native-qrcode-svg'
import CopyThisText from '../../components/CopyThisText'
import ReceiveAmountContent from '../../components/home/ReceiveAmountContent'
import defaultBottomSheetConfigs from '../../common/configs/BottomSheetConfigs'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'

export default function Receive( props ) {

  const [ ReceiveHelperBottomSheet ] = useState( React.createRef() )

  const [ amount, setAmount ] = useState( '' )
  const [ serviceType ] = useState(
    props.navigation.getParam( 'serviceType' )
      ? props.navigation.getParam( 'serviceType' )
      : '',
  )
  const derivativeAccountDetails =
    props.navigation.state.params.derivativeAccountDetails
  const dispatch = useDispatch()

  const [ receivingAddress, setReceivingAddress ] = useState( null )

  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()
  const { service } = useSelector( ( state ) => state.accounts[ serviceType ] )


  const onPressTouchableWrapper = () => {
    if ( ReceiveHelperBottomSheet.current )
      ( ReceiveHelperBottomSheet as any ).current.snapTo( 0 )
  }

  const onPressBack = () => {
    props.navigation.goBack()
  }

  const onPressKnowMore = () => {
    dispatch( setReceiveHelper( true ) )
    if ( ReceiveHelperBottomSheet.current )
      ( ReceiveHelperBottomSheet as any ).current.snapTo( 1 )
  }

  const showReceiveAmountBottomSheet = useCallback( () => {
    presentBottomSheet(
      <ReceiveAmountContent
        title={'Receive sats'}
        message={'Receive sats into the selected account'}
        onPressConfirm={( amount ) => {
          setAmount( amount )
          dismissBottomSheet()
        }}
        selectedAmount={amount}
        onPressBack={() => {
          dismissBottomSheet()
        }
        }
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '50%' ],
        overlayOpacity: 0.9,
      },
    )
  }, [ presentBottomSheet, dismissBottomSheet, amount ] )

  useEffect( () => {
    const receivingAddress = service.getReceivingAddress(
      derivativeAccountDetails ? derivativeAccountDetails.type : null,
      derivativeAccountDetails ? derivativeAccountDetails.number : null,
    )
    let receiveAt = receivingAddress ? receivingAddress : ''
    if ( amount ) {
      receiveAt = service.getPaymentURI( receiveAt, {
        amount: parseInt( amount ) / SATOSHIS_IN_BTC,
      } ).paymentURI
    }
    setReceivingAddress( receiveAt )

  }, [ service, amount, ] )

  return (
    <View style={{
      flex: 1
    }}>
      <SafeAreaView style={{
        flex: 0
      }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={() => onPressTouchableWrapper()}>
        <KeyboardAvoidingView
          style={{
            flex: 1
          }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <View style={NavStyles.modalContainer}>
            <View style={NavStyles.modalHeaderTitleView}>
              <View
                style={{
                  flex: 1, flexDirection: 'row', alignItems: 'stretch'
                }}
              >
                <TouchableOpacity
                  onPress={() => onPressBack()}
                  style={{
                    height: 30, width: 30, justifyContent: 'center'
                  }}
                >
                  <FontAwesome
                    name="long-arrow-left"
                    color={Colors.blue}
                    size={17}
                  />
                </TouchableOpacity>
                <Image
                  source={
                    getAccountIcon( serviceType, derivativeAccountDetails )
                  }
                  style={{
                    width: wp( '10%' ), height: wp( '10%' )
                  }}
                />
                <View style={{
                  marginLeft: wp( '2.5%' )
                }}>
                  <Text style={NavStyles.modalHeaderTitleText}>Receive</Text>
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontFamily: Fonts.FiraSansRegular,
                      fontSize: RFValue( 12 ),
                    }}
                  >
                    {
                      getAccountTitle( serviceType, derivativeAccountDetails )
                    }
                  </Text>
                </View>
              </View>
              {serviceType == TEST_ACCOUNT ? (
                <KnowMoreButton
                  onpress={() => onPressKnowMore()}
                  containerStyle={{
                    marginTop: 'auto',
                    marginBottom: 'auto',
                    marginRight: 10,
                  }}
                />
              ) : null}
            </View>
            <ScrollView>
              <View style={styles.QRView}>
                <QRCode value={receivingAddress ? receivingAddress : 'eert'} size={hp( '27%' )} />
              </View>

              <CopyThisText
                backgroundColor={Colors.white}
                text={receivingAddress}
              />

              <AppBottomSheetTouchableWrapper
                onPress={() => { showReceiveAmountBottomSheet() }}
                style={styles.selectedView}
              >
                <View
                  style={styles.text}
                >
                  <Text style={styles.titleText}>{'Enter amount to receive'}</Text>
                </View>

                <View style={{
                  marginLeft: 'auto'
                }}>
                  <Ionicons
                    name="chevron-forward"
                    color={Colors.textColorGrey}
                    size={15}
                    style={styles.forwardIcon}
                  />
                </View>
              </AppBottomSheetTouchableWrapper>

            </ScrollView>
            <View style={{
              marginBottom: hp( '2.5%' )
            }}>
              <BottomInfoBox
                title="Note"
                infoText="It would take some time for the sats to reflect in your account based on the network condition"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  )
}

const styles = StyleSheet.create( {
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
    marginBottom: hp( '1%' ),
  },
  textBoxImage: {
    width: wp( '6%' ),
    height: wp( '6%' ),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 13 ),
  },
  QRView: {
    height: hp( '30%' ),
    justifyContent: 'center',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: hp( '3%' )
  },
  titleText: {
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  text: {
    justifyContent: 'center', marginRight: 10, marginLeft: 10, flex: 1
  },
  knowMoreTouchable: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 'auto',
  },
  selectedView: {
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    marginBottom: hp( 4 ),
    marginTop: hp( 2 ),
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  forwardIcon: {
    marginLeft: wp( '3%' ),
    marginRight: wp( '3%' ),
    alignSelf: 'center',
  },
  text1: {
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    marginBottom: wp( '5%' )
  },
} )
