import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, Image } from 'react-native'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../AppBottomSheetTouchableWrapper'
import useWyreIntegrationState from '../../../utils/hooks/state-selectors/accounts/UseWyreIntegrationState'
import { fetchWyreReceiveAddress, fetchWyreReservation } from '../../../store/actions/WyreIntegration'
import useWyreReservationFetchEffect from '../../../utils/hooks/wyre-integration/UseWyreReservationFetchEffect'
import openLink from '../../../utils/OpenLink'

type Props = {
  wyreFromDeepLink: boolean | null;
  wyreFromBuyMenu: boolean | null;
  wyreDeepLinkContent: string | null;
  onClickSetting: ()=>any;
}

const BottomSheetWyreInfo: React.FC<Props> = ( { wyreDeepLinkContent, wyreFromBuyMenu, wyreFromDeepLink, onClickSetting }: Props ) => {
  const dispatch = useDispatch()
  const { wyreHostedUrl, wyreReceiveAddress } = useWyreIntegrationState()
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  function handleProceedButtonPress() {
    if( !hasButtonBeenPressed ){dispatch( fetchWyreReservation() )}
    setHasButtonBeenPressed( true )
  }

  useEffect( () => {
    dispatch( fetchWyreReceiveAddress() )
  }, [] )


  useWyreReservationFetchEffect( {
    onSuccess: () => {
      openLink( wyreHostedUrl )
    },
    onFailure: () => {
      setHasButtonBeenPressed( true )
    }
  } )
  // eslint-disable-next-line quotes
  let wyreMessage = `\nWyre enables purchases of BTC using Apple Pay, debit card, bank transfer as well as easy transfers using open banking where available. Payment methods available may vary based on your country. \n\nBy proceeding, you understand that Wyre will process the payment and transfer for the purchased bitcoin. Bitcoin purchased successfully will be transferred to:\n\n- Wyre Account\n- ${wyreReceiveAddress}`
  let wyreTitle = 'Buy with Wyre'
  if( wyreDeepLinkContent && wyreDeepLinkContent.search( 'fail' )>=0 ) {
    wyreMessage = 'Wyre was not able to process your payment. Please try after sometime or use a different payment method'
    wyreTitle = 'Wyre order failed'
  }
  if( wyreDeepLinkContent && wyreDeepLinkContent.search( 'success' )>=0 ) {
    wyreMessage = 'Your order has been successful, the purchased bitcoin will be transferred to your Wyre account shortly'
    wyreTitle = 'Order successfull'
  }
  return ( <View style={{
    ...styles.modalContentContainer
  }}>
    <View style={{
      height: '90%'
    }}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.modalTitleText}>{wyreTitle}</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '1.5%' )
        }}>{wyreMessage}</Text>
      </View>

      <View style={{
        flexDirection: 'column', marginTop: 'auto', alignItems: 'flex-start'
      }} >
        <AppBottomSheetTouchableWrapper
          disabled={wyreFromBuyMenu ? hasButtonBeenPressed : false}
          onPress={wyreFromBuyMenu ? handleProceedButtonPress : onClickSetting}
          style={{
            ...styles.successModalButtonView
          }}
        >
          <Text style={styles.proceedButtonText}>{wyreFromBuyMenu ? 'Proceed to Wyre' : 'OK'}</Text>

        </AppBottomSheetTouchableWrapper>
        {wyreFromBuyMenu
          ? <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center'
          }}>
            <Text style={{
              marginLeft: wp( '13.5%' ),
            }}>
        Powered by
            </Text>
            <Image
              source={require( '../../../assets/images/icons/wyre_logo_large.png' )}
              style={{
                marginLeft: 5,
                width: 62,
                height: 27,
              }}
            />
          </View>
          : null
        }
        {/* <Image source={require( '../../../assets/images/icons/icon_swan@3x.png' )} style={styles.successModalImage} /> */}
      </View>

    </View>

  </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
    marginTop: wp( '5%' ),
    flex: 1.7
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify'
  },
  successModalButtonView: {
    minHeight: 50,
    minWidth: 144,
    paddingHorizontal: wp( 4 ),
    paddingVertical: wp( 3 ),
    height: wp( '13%' ),
    width: wp( '43%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    alignSelf: 'flex-start',
    marginLeft: wp( '10%' ),
  },
  successModalImage: {
    width: wp( '25%' ),
    height: hp( '18%' ),
    marginLeft: 'auto',
    resizeMode: 'cover'
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium
  },
} )

export default BottomSheetWyreInfo
