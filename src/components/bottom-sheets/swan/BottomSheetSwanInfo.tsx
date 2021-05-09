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
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../AppBottomSheetTouchableWrapper'
import { fetchSwanAuthenticationUrl, redeemSwanCodeForToken, createTempSwanAccountShell } from '../../../store/actions/SwanIntegration'
import useSwanIntegrationState from '../../../utils/hooks/state-selectors/accounts/UseSwanIntegrationState'
import openLink from '../../../utils/OpenLink'
import useAccountsState from '../../../utils/hooks/state-selectors/accounts/UseAccountsState'
import ExternalServiceSubAccountInfo from '../../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import ServiceAccountKind from '../../../common/data/enums/ServiceAccountKind'
import SwanAccountCreationStatus from '../../../common/data/enums/SwanAccountCreationStatus'
import { ListItem } from 'react-native-elements'
import { addNewAccountShell } from '../../../store/actions/accounts'

type Props = {
  swanDeepLinkContent: string | null;
  onClickSetting: ()=>any;
}

const BottomSheetSwanInfo: React.FC<Props> = ( { swanDeepLinkContent, onClickSetting }: Props ) => {
  const dispatch = useDispatch()
  const { swanAccountCreationStatus, hasFetchSwanAuthenticationUrlInitiated, hasFetchSwanAuthenticationUrlSucceeded, hasFetchSwanAuthenticationUrlCompleted, swanAuthenticationUrl, swanAuthenticatedToken, hasRedeemSwanCodeForTokenInitiated, hasRedeemSwanCodeForTokenSucceeded, hasRedeemSwanCodeForTokenCompleted, hasCreateWithdrawalWalletOnSwanSucceeded, hasCreateWithdrawalWalletOnSwanCompleted, hasCreateWithdrawalWalletOnSwanInitiated } = useSwanIntegrationState()
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()

  let swanMessage = 'Swan enables BTC purchases using Apple Pay, Debit/Credit card, Bank Transfer and open banking where available. Payment methods available may vary based on your country.\n\nBy proceeding, you understand that Swan will process the payment and transfer for the purchased bitcoin.'
  let swanTitle = 'Buy bitcoin with Swan'

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

  useEffect( ()=>{

    console.log( '@@@=> XXX', swanAccountCreationStatus )
    if( hasFetchSwanAuthenticationUrlSucceeded && swanAuthenticationUrl ) {
      openLink( swanAuthenticationUrl )
    }
  }, [ hasFetchSwanAuthenticationUrlSucceeded, swanAuthenticationUrl ] )

  if( !hasRedeemSwanCodeForTokenInitiated && swanAccountCreationStatus == SwanAccountCreationStatus.AUTHENTICATION_IN_PROGRESS ) {
    dispatch( redeemSwanCodeForToken( swanDeepLinkContent ) )
  }
  const renderFooter = () => {
    switch ( swanAccountCreationStatus ) {
        case SwanAccountCreationStatus.ERROR:
          return (
            <Image
              source={require( '../../../assets/images/icons/errorImage.png' )
              }
              style={styles.errorImage}
            />
          )
        case SwanAccountCreationStatus.ADD_NEW_ACCOUNT_INITIATED:
        case SwanAccountCreationStatus.AUTHENTICATION_IN_PROGRESS:
          return (
            <Image
              source={require( '../../../assets/images/loader.gif' )
              }
              style={styles.communicatingImage}
            />
          )
          break
        case SwanAccountCreationStatus.WALLET_LINKED_SUCCESSFULLY:
          return renderSuccessButton()
        default:
          return renderProceedButton()
    }
  }

  const renderMessage = () => {
    switch ( swanAccountCreationStatus ) {
        case SwanAccountCreationStatus.ERROR:
          swanMessage = 'We had a problem communicating with Swan.\n\n'
          swanTitle = 'Something went wrong'
          break
        case SwanAccountCreationStatus.ADD_NEW_ACCOUNT_INITIATED:
        case SwanAccountCreationStatus.AUTHENTICATION_IN_PROGRESS:
          swanTitle = 'Hexa Wallet is communicating with Swan...'
          swanMessage = 'Hexa Wallet is creating a Swan account to store your bitcoin purchased from Swan. This account will be linked to your Swan withdrawal wallet'
          break
        case SwanAccountCreationStatus.WALLET_LINKED_SUCCESSFULLY:
          swanMessage = 'Sats in your Swan withdrawal wallet will be transfered to Hexa Wallet.\nSwan will transfer the sats once 0.02 BTC accumulate in your withdrawal wallet\n'
          swanTitle = 'Successfully linked Hexa Wallet to your Swan Account'
          break
        default:
          swanMessage = 'Swan enables BTC purchases using Apple Pay, Debit/Credit card, Bank Transfer and open banking where available. Payment methods available may vary based on your country.\n\nBy proceeding, you understand that Swan will process the payment and transfer for the purchased bitcoin.'
          swanTitle = 'Buy bitcoin with Swan'
    }
    return (
      <View style={styles.successModalHeaderView}>
        <Text style={styles.modalTitleText}>{swanTitle}</Text>
        {( swanAccountCreationStatus == SwanAccountCreationStatus.WALLET_LINKED_SUCCESSFULLY ) ? renderAccount() : null}
        <Text style={{
          ...styles.modalInfoText,
          marginTop: wp( 1.5 ),
          marginBottom: wp( 5 ),
        }}>{swanMessage}</Text>
      </View>
    )
  }

  const renderAccount = () => {
    return (
      <View style={{
        flexDirection: 'row',
        marginBottom: wp( 5 ),
      }}>
        <Image
          source={require( '../../../assets/images/icons/swan.png' )}
          style={styles.avatarImage}
          resizeMode="contain"
        />

        <ListItem.Content style={{
          flex: 1,
        }}>
          <ListItem.Subtitle
            style={ListStyles.infoHeaderSubtitleText}
            numberOfLines={1}
          >
            bitcoin will be transferred to
          </ListItem.Subtitle>

          <ListItem.Title
            style={styles.destinationTitleText}
            numberOfLines={1}
          >
            Swan Account
          </ListItem.Title>
        </ListItem.Content>
      </View>
    )
  }
  const renderProceedButton = () => {
    return ( <View style={{
      flexDirection: 'column', marginTop: 'auto', alignItems: 'flex-start'
    }} >
      <AppBottomSheetTouchableWrapper
        disabled={hasButtonBeenPressed? true : false}
        onPress={handleProceedButtonPress}
        style={{
          ...styles.successModalButtonView
        }}
      >
        <Text style={styles.proceedButtonText}>{'Proceed to Swan'}</Text>
      </AppBottomSheetTouchableWrapper>
      <View style={{
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
    </View> )
  }
  const renderSuccessButton = () => {
    return ( <View style={{
      flexDirection: 'column', marginTop: 'auto', alignItems: 'flex-start'
    }} >
      <AppBottomSheetTouchableWrapper
        onPress={onClickSetting}
        style={{
          ...styles.successModalButtonView
        }}
      >
        <Text style={styles.proceedButtonText}>{'Done'}</Text>
      </AppBottomSheetTouchableWrapper>
      <Image
        source={require( '../../../assets/images/icons/illustration.png' )
        }
        style={styles.successImage}
      />
    </View> )
  }

  return ( <View style={{
    ...styles.modalContentContainer
  }}>
    <View style={{
      height: '92%'
    }}>
      {renderMessage()}
      {renderFooter()}
    </View>

  </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    backgroundColor: Colors.white,
  },
  avatarImage: {
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageLarge,
    marginRight: 14,
  },
  destinationTitleText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 20 ),
    color: Colors.black,
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
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium
  },
  errorImage: {
    width: wp( '31%' ),
    height: wp( '38%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginBottom: hp( '-3%' ),
  },
  successImage: {
    width: wp( '25%' ),
    height: hp( '18%' ),
    marginLeft: 'auto',
    resizeMode: 'cover'
  },
  communicatingImage: {
    width: wp( '31%' ),
    height: wp( '38%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginBottom: hp( '-3%' ),
  },
} )
export default BottomSheetSwanInfo
