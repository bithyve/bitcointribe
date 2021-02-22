import React, { useEffect, useState } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../AppBottomSheetTouchableWrapper'
import { fetchSwanAuthenticationUrl, redeemSwanCodeForToken } from '../../../store/actions/SwanIntegration'
import useSwanIntegrationState from '../../../utils/hooks/state-selectors/accounts/UseSwanIntegrationState'
import openLink from '../../../utils/OpenLink'

const boottomSheetRenderCount = 0
type Props = {
  swanDeepLinkContent: string | null;
  swanFromDeepLink: boolean | null;
  swanFromBuyMenu: boolean | null;
  onClickSetting: ()=>any;
}

const BottomSheetSwanInfo: React.FC<Props> = ( { swanDeepLinkContent, swanFromDeepLink, swanFromBuyMenu, onClickSetting }: Props ) => {
  const dispatch = useDispatch()
  const { hasFetchSwanAuthenticationUrlInitiated, hasFetchSwanAuthenticationUrlSucceeded, hasFetchSwanAuthenticationUrlCompleted, swanAuthenticationUrl, swanAuthenticatedCode, hasRedeemSwanCodeForTokenInitiated, hasRedeemSwanCodeForTokenSucceeded, hasRedeemSwanCodeForTokenCompleted } = useSwanIntegrationState()
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  function handleProceedButtonPress() {
    if ( swanFromBuyMenu ) {
      if( !hasFetchSwanAuthenticationUrlInitiated ) dispatch( fetchSwanAuthenticationUrl( {
      } ) )
      setHasButtonBeenPressed( true )
    }
  }

  useEffect( ()=>{
    if ( swanFromBuyMenu ) {
      if( hasFetchSwanAuthenticationUrlSucceeded && swanAuthenticationUrl ) openLink( swanAuthenticationUrl )
    }
  }, [ hasFetchSwanAuthenticationUrlCompleted, swanAuthenticationUrl ] )

  if( swanFromDeepLink && !hasRedeemSwanCodeForTokenInitiated ) {
    dispatch( redeemSwanCodeForToken( swanDeepLinkContent ) )
  }

  useEffect( ()=>{
    if( swanFromDeepLink ) {
      swanFromBuyMenu = false
      if( hasRedeemSwanCodeForTokenCompleted )
        console.log( 'success!' )
    }
  }, [ hasRedeemSwanCodeForTokenCompleted, swanAuthenticatedCode ] )

  return ( <View style={{
    ...styles.modalContentContainer
  }}>
    <View style={{
      height: '90%'
    }}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.modalTitleText}>Athentication in progress...</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '1.5%' )
        }}>Communicating with SwanBitcoins and setting authentication token: {swanAuthenticatedCode}.</Text>
      </View>

      <View style={{
        flexDirection: 'column', marginTop: 'auto', alignItems: 'flex-start'
      }} >
        <AppBottomSheetTouchableWrapper
          disabled={swanFromBuyMenu ? hasButtonBeenPressed : false}
          onPress={swanFromBuyMenu ? handleProceedButtonPress : onClickSetting}
          style={{
            ...styles.successModalButtonView
          }}
        >
          <Text style={styles.proceedButtonText}>{swanFromBuyMenu ? 'Proceed to Swan' : 'OK'}</Text>

        </AppBottomSheetTouchableWrapper>
        {swanFromBuyMenu
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
              source={require( '../../../assets/images/icons/ramp_logo_large.png' )}
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
export default BottomSheetSwanInfo
