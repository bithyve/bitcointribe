import React, { useEffect, useState } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../AppBottomSheetTouchableWrapper'
import { createWithdrawalWalletOnSwan, fetchSwanAuthenticationUrl, redeemSwanCodeForToken, createTempSwanAccountShell } from '../../../store/actions/SwanIntegration'
import useSwanIntegrationState from '../../../utils/hooks/state-selectors/accounts/UseSwanIntegrationState'
import openLink from '../../../utils/OpenLink'
import useAccountsState from '../../../utils/hooks/state-selectors/accounts/UseAccountsState'
import ExternalServiceSubAccountInfo from '../../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import ServiceAccountKind from '../../../common/data/enums/ServiceAccountKind'
import SwanAccountCreationStatus from '../../../common/data/enums/SwanAccountCreationStatus'

type Props = {
  swanDeepLinkContent: string | null;
  onClickSetting: ()=>any;
}

const count = 0

const BottomSheetSwanInfo: React.FC<Props> = ( { swanDeepLinkContent, onClickSetting }: Props ) => {
  const countAnother = 0
  const dispatch = useDispatch()
  const { swanAccountCreationStatus, hasFetchSwanAuthenticationUrlInitiated, hasFetchSwanAuthenticationUrlSucceeded, hasFetchSwanAuthenticationUrlCompleted, swanAuthenticationUrl, swanAuthenticatedToken, hasRedeemSwanCodeForTokenInitiated, hasRedeemSwanCodeForTokenSucceeded, hasRedeemSwanCodeForTokenCompleted, hasCreateWithdrawalWalletOnSwanSucceeded, hasCreateWithdrawalWalletOnSwanCompleted, hasCreateWithdrawalWalletOnSwanInitiated } = useSwanIntegrationState()
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  const { currentSwanSubAccount } = useAccountsState()
  const [ swanAccountSetupCompleted, setSwanAccountSetupCompleted ] = useState( !( currentSwanSubAccount == null ) )

  function handleProceedButtonPress() {
    if ( swanAccountCreationStatus == SwanAccountCreationStatus.BUY_MENU_CLICKED ) {
      if( !hasFetchSwanAuthenticationUrlInitiated ) {
        setHasButtonBeenPressed( true )
        dispatch( fetchSwanAuthenticationUrl( {
        } ) )
      }
    }
  }


  function handleThresholdAmount() {
    dispatch( redeemSwanCodeForToken( swanDeepLinkContent ) )
  }

  //useEffect( ()=>{
  switch ( swanAccountCreationStatus ) {
      case SwanAccountCreationStatus.ERROR:
        // renderErrorMessage()
        console.log( '@@@=> ', swanAccountCreationStatus )
        break
      case SwanAccountCreationStatus.ADD_NEW_ACCOUNT_INITIATED:
        console.log( '@@@=> ', swanAccountCreationStatus )
        break
      case SwanAccountCreationStatus.BUY_MENU_CLICKED:
        // renderProceed()
        console.log( '@@@=> ', swanAccountCreationStatus )
        if( hasFetchSwanAuthenticationUrlSucceeded && swanAuthenticationUrl ) {
          openLink( swanAuthenticationUrl )
          const newSubAccount = new ExternalServiceSubAccountInfo( {
            instanceNumber: 1,
            defaultTitle: 'Swan Account',
            defaultDescription: 'BTC purchased from Swan',
            serviceAccountKind: ServiceAccountKind.WYRE,
          } )
          dispatch( createTempSwanAccountShell( newSubAccount ) )
        }
        break
      case SwanAccountCreationStatus.ROUTED_BACK_FROM_SWAN:
        // requestThresholdAmount
        console.log( '@@@=> ', swanAccountCreationStatus )

        break
      case SwanAccountCreationStatus.WITHDRAWAL_WALLET_CREATED:
        console.log( '@@@=> ', swanAccountCreationStatus )
        break
      case SwanAccountCreationStatus.WALLET_LINKED_SUCCESSFULLY:
        console.log( '@@@=> ', swanAccountCreationStatus )
        // renderSuccessMessage()
        break
  }

  const renderContent = () =>{
    switch ( swanAccountCreationStatus ) {
        case SwanAccountCreationStatus.ERROR:
          // renderErrorMessage()
          return( <Text style={{
            ...styles.modalInfoText, marginTop: wp( '2%' )
          }}>Error Occured: </Text> )
          console.log( '@@@=> ', swanAccountCreationStatus )
          break
        case SwanAccountCreationStatus.ADD_NEW_ACCOUNT_INITIATED:
          console.log( '@@@=> ', swanAccountCreationStatus )
          break
        case SwanAccountCreationStatus.BUY_MENU_CLICKED:
          // renderProceed()
          console.log( '@@@=> ', swanAccountCreationStatus )
          return( <Text style={{
            ...styles.modalInfoText, marginTop: wp( '2%' )
          }}>Click Proceed Button: </Text> )
          break
        case SwanAccountCreationStatus.ROUTED_BACK_FROM_SWAN:
          console.log( '@@@=> ', swanAccountCreationStatus )
          // requestThresholdAmount()
          return(

            <View style={{
              flexDirection: 'column', marginTop: 'auto', alignItems: 'flex-start'
            }}>
              <Text style={{
                ...styles.modalInfoText, marginTop: wp( '2%' )
              }}>Ask for Threshold Amount: </Text>
              <AppBottomSheetTouchableWrapper
                // disabled={hasButtonBeenPressed}
                onPress={handleThresholdAmount}
                style={{
                  ...styles.successModalButtonView
                }}
              >
                <Text style={styles.proceedButtonText}>{'Link Swan Wallet'}</Text>

              </AppBottomSheetTouchableWrapper>
              {/* <Image source={require( '../../../assets/images/icons/icon_swan@3x.png' )} style={styles.successModalImage} /> */}
            </View>
          )

          break
        case SwanAccountCreationStatus.WITHDRAWAL_WALLET_CREATED:
          console.log( '@@@=> ', swanAccountCreationStatus )

          return( <Text style={{
            ...styles.modalInfoText, marginTop: wp( '2%' )
          }}>Withdrawal Wallet Created: </Text> )


          break
        case SwanAccountCreationStatus.WALLET_LINKED_SUCCESSFULLY:
          console.log( '@@@=> ', swanAccountCreationStatus )
          // renderSuccessMessage()

          return(

            <AppBottomSheetTouchableWrapper
              onPress={onClickSetting}
              style={{
                ...styles.successModalButtonView
              }}
            >
              <Text style={styles.proceedButtonText}>{'OK'}</Text>
            </AppBottomSheetTouchableWrapper> )



          break
    }
  }
  return ( <View style={{
    ...styles.modalContentContainer
  }}>
    <View style={{
      height: '90%'
    }}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.modalTitleText}>Athentication in progress...</Text>
        {renderContent()}

        {/* <Text style={{
          ...styles.modalInfoText, marginTop: wp( '2%' )
        }}>Verify Hexa is authorised: {hasRedeemSwanCodeForTokenSucceeded ? String.fromCodePoint( 0x2705 ) : null}</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '2%' )
        }}>Create withdrawal wallet on Swan: {hasCreateWithdrawalWalletOnSwanSucceeded ? String.fromCodePoint( 0x2705 ) : null}</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '2%' )
        }}>Create Swan Account in Hexa: {hasRedeemSwanCodeForTokenSucceeded ? String.fromCodePoint( 0x2705 ) : null}</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '2%' )
        }}>Link Swan Account and Swan: {hasRedeemSwanCodeForTokenSucceeded ? String.fromCodePoint( 0x2705 ) : null}</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '2%' )
        }}>Confirm Hexa and Swan Link is approved and active: {hasRedeemSwanCodeForTokenSucceeded ? String.fromCodePoint( 0x2705 ) : null}</Text> */}
      </View>

      <View style={{
        flexDirection: 'column', marginTop: 'auto', alignItems: 'flex-start'
      }} >
        <AppBottomSheetTouchableWrapper
          disabled={swanAccountCreationStatus == SwanAccountCreationStatus.BUY_MENU_CLICKED ? hasButtonBeenPressed : false}
          onPress={swanAccountCreationStatus == SwanAccountCreationStatus.BUY_MENU_CLICKED ? handleProceedButtonPress : onClickSetting}
          style={{
            ...styles.successModalButtonView
          }}
        >
          <Text style={styles.proceedButtonText}>{swanAccountCreationStatus == SwanAccountCreationStatus.BUY_MENU_CLICKED ? 'Proceed to Swan' : '.'}</Text>

        </AppBottomSheetTouchableWrapper>
        {swanAccountCreationStatus == SwanAccountCreationStatus.BUY_MENU_CLICKED
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
              source={require( '../../../assets/images/icons/swan_logo_large.png' )}
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
    marginTop: wp( '0%' ),
    flex: 1.7
  },
  modalTitleText: {
    marginBottom: wp( '5%' ),
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
