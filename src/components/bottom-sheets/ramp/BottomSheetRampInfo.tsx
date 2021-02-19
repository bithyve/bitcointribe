import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../AppBottomSheetTouchableWrapper'
import useAccountsState from '../../../utils/hooks/state-selectors/accounts/UseAccountsState'

let boottomSheetRenderCount = 0
type Props = {
  rampDeepLinkContent: string | null;
  rampFromDeepLink: boolean | null;
  rampFromBuyMenu: boolean | null;
  onClickSetting: ()=>any;
}

const { currentRampSubAccount } = useAccountsState()

const BottomSheetRampInfo: React.FC<Props> = ( { rampDeepLinkContent, rampFromDeepLink, rampFromBuyMenu, onClickSetting }: Props ) => {
  console.log( {
    boottomSheetRenderCount: boottomSheetRenderCount++,
    ...{
      rampDeepLinkContent
    }
  } )
  function handleProceedButtonPress() {
    currentSubAccount.customDisplayName = accountName
    currentSubAccount.customDescription = accountDescription

    
    setHasButtonBeenPressed( true )
  }

  useEffect( ()=>{
    if ( swanFromBuyMenu ) {
      if( hasFetchSwanAuthenticationUrlSucceeded && swanAuthenticationUrl ) openLink( swanAuthenticationUrl )
    }
  }, [ hasFetchSwanAuthenticationUrlCompleted, swanAuthenticationUrl ] )

  if( swanFromDeepLink && !hasRedeemSwanCodeForTokenInitiated ) {
    dispatch( redeemSwanCodeForToken( swanDeepLinkContent ) )
  }

  let rampMessage = 'Your order has been successful, the purchased bitcoin will be transferred to your Ramp account shortly'
  let rampTitle = 'Order successful'
  if( rampDeepLinkContent.search( 'fail' )>=0 ) {
    rampMessage = 'Ramp was not able to process your payment. Please try after sometime or use a different payment method'
    rampTitle = 'Ramp order failed'
  }
  return ( <View style={{
    ...styles.modalContentContainer
  }}>
    <View style={{
      height: '90%'
    }}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.modalTitleText}>{rampTitle}</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '1.5%' )
        }}>{rampMessage}.</Text>
      </View>

      <View style={{
        flexDirection: 'row', marginTop: 'auto', alignItems: 'center'
      }} >
        <AppBottomSheetTouchableWrapper
          onPress={() => onClickSetting()}
          style={{
            ...styles.successModalButtonView
          }}
        >
          <Text style={styles.proceedButtonText}>OK</Text>
        </AppBottomSheetTouchableWrapper>
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
    marginTop: wp( '10%' ),
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
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
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

export default BottomSheetRampInfo
