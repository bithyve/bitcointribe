import React, { useEffect } from 'react'
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
import { redeemSwanCodeForToken, clearSwanCache } from '../../../store/actions/SwanIntegration'

let boottomSheetRenderCount = 0
type Props = {
  swanDeepLinkContent: string | null;
  navigatingFrom: string | null;
  onClickSetting: ()=>any;
}

const BottomSheetSwanInfo: React.FC<Props> = ( { swanDeepLinkContent, navigatingFrom, onClickSetting }: Props ) => {
  console.log( {
    boottomSheetRenderCount: boottomSheetRenderCount++
  } )
  const dispatch = useDispatch()
  useEffect( ()=>{
    dispatch( clearSwanCache() )
    switch ( navigatingFrom ) {
        case 'home':
          dispatch( redeemSwanCodeForToken( swanDeepLinkContent ) )
    }
  }, [] )
  const { redeemSwanCodeForTokenSucceeded, swanAuthenticatedCode } = useSelector(
    ( state ) => state.swanIntegration
  )

  useEffect( ()=>{
    console.log( {
      swanAuthenticatedCode, redeemSwanCodeForTokenSucceeded
    } )
    if( redeemSwanCodeForTokenSucceeded )
      console.log( 'redeemSwanCodeForTokenSucceeded ', redeemSwanCodeForTokenSucceeded )
  }, [ redeemSwanCodeForTokenSucceeded, swanAuthenticatedCode ] )

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
        }}>Communicating with SwanBitcoins and setting authenticating.</Text>
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
  successModalAmountView: {
    flex: 2,
    justifyContent: 'center',
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
  },
  successModalWalletNameText: {
    color: Colors.black,
    fontSize: RFValue( 25 ),
    fontFamily: Fonts.FiraSansRegular
  },
  successModalAmountImage: {
    width: wp( '3%' ),
    height: wp( '3%' ),
    marginRight: 5,
    marginBottom: wp( '1%' ),
    resizeMode: 'contain',
  },
  successModalAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 21 ),
    marginRight: 5
  },
  successModalAmountUnitText: {
    color: Colors.borderColor,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
  },
  successModalAmountInfoView: {
    flex: 0.4,
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
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

export default BottomSheetSwanInfo
