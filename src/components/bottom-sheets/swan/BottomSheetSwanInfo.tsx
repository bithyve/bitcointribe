import React, { useEffect, useState } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../AppBottomSheetTouchableWrapper'
import { fetchSwanAuthenticationUrl, redeemSwanCodeForToken } from '../../../store/actions/SwanIntegration'
import useSwanIntegrationState from '../../../utils/hooks/state-selectors/accounts/UseSwanIntegrationState'
import openLink from '../../../utils/OpenLink'
import SwanAccountCreationStatus from '../../../common/data/enums/SwanAccountCreationStatus'
import { ListItem } from 'react-native-elements'
import BottomInfoBox from '../../BottomInfoBox'
import { translations } from '../../../common/content/LocContext'

const swanAccountCount = 0

type Props = {
  swanDeepLinkContent: string | null;
  onClickSetting: ()=>any;
  onPress: () => any;
}

const BottomSheetSwanInfo: React.FC<Props> = ( { swanDeepLinkContent, onClickSetting, onPress }: Props ) => {
  const dispatch = useDispatch()
  const common  = translations[ 'common' ]
  const strings  = translations[ 'accounts' ]
  const { swanAccountCreationStatus, hasFetchSwanAuthenticationUrlInitiated, hasFetchSwanAuthenticationUrlSucceeded, swanAccountDetails, swanAuthenticationUrl, hasRedeemSwanCodeForTokenInitiated  } = useSwanIntegrationState()
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  const [ isConfirm, setIsConfirm ] = useState( false )
  let swanMessage = strings.swanMessage
  let swanTitle = strings.StackSats
  let  showNote = true
  let accountName = ''
  let accountDescription = ''
  function handleProceedButtonPress() {
    if ( swanAccountCreationStatus == SwanAccountCreationStatus.BUY_MENU_CLICKED ) {
      if( !hasFetchSwanAuthenticationUrlInitiated ) {
        setHasButtonBeenPressed( true )
        dispatch( fetchSwanAuthenticationUrl( {
        } ) )
      }
    }
  }

  useEffect( ()=>{
    if( ( swanAccountCreationStatus == SwanAccountCreationStatus.BUY_MENU_CLICKED ) && hasFetchSwanAuthenticationUrlSucceeded && swanAuthenticationUrl ) {
      onPress()
      openLink( swanAuthenticationUrl )
    }
  }, [ hasFetchSwanAuthenticationUrlSucceeded, swanAuthenticationUrl, hasRedeemSwanCodeForTokenInitiated ] )

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
        case SwanAccountCreationStatus.ACCOUNT_CREATED:
          return renderSuccessButton()
        default:
          return renderProceedButton()
    }
  }

  const renderMessage = () => {
    switch ( swanAccountCreationStatus ) {
        case SwanAccountCreationStatus.ERROR:
          swanMessage = strings.problemcommunicatingwithSwan
          swanTitle = strings.Somethingwentwrong
          showNote = false
          break
        case SwanAccountCreationStatus.ADD_NEW_ACCOUNT_INITIATED:
        case SwanAccountCreationStatus.AUTHENTICATION_IN_PROGRESS:
          swanTitle = strings.communicatingwithSwan
          swanMessage = strings.accountisbeinglinked
          showNote = false
          break
        case SwanAccountCreationStatus.WALLET_LINKED_SUCCESSFULLY:
          swanMessage = strings.HexaWalletLinked
          swanTitle = strings.Successfullylinked
          accountName = 'Swan Bitcoin'
          accountDescription = 'Stack sats with Swan'
          showNote = false
          break
        case SwanAccountCreationStatus.ACCOUNT_CREATED:
          swanMessage = strings.Swanwilltransfer
          swanTitle = strings.swanlinked
          showNote = false
          // TODO: uncomment once able to access current-swan acc
          // accountName = currentSwanSubAccount.defaultTitle
          // accountDescription = currentSwanSubAccount.defaultDescription
          break
        default:
          swanMessage = strings.swanautowithdrawal
          swanTitle = 'Stack Sats with\nSwan Bitcoin'
          showNote = true
    }
    if( isConfirm ) {
      swanMessage = strings.Byproceeding
    }
    return (
      <>
        {/* <TouchableOpacity
          activeOpacity={1}
          onPress={onPress}
          style={{
            width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
            marginTop: wp( 3 ), marginRight: wp( 3 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} style={{
            // marginTop: hp( 0.5 )
          }} />
        </TouchableOpacity> */}
        <View style={styles.successModalHeaderView}>

          <Text style={styles.modalTitleText}>{swanTitle}</Text>

          <Text style={{
            ...styles.modalInfoText,

          }}>{swanMessage}</Text>
          {showNote &&
            <BottomInfoBox
              // backgroundColor={Colors.white}
              containerStyle={{
                marginTop: hp( 6 ),
                marginRight: wp( '1%' ),
              }}
              title={common.note}
              infoText={
                strings.Onceyoucomplete
              }
            />
          }

          {( swanAccountCreationStatus == SwanAccountCreationStatus.WALLET_LINKED_SUCCESSFULLY
          ||
          swanAccountCreationStatus == SwanAccountCreationStatus.ACCOUNT_CREATED ) ? renderAccount() : null}

        </View>
      </>
    )
  }

  const renderAccount = () => {
    return (
      <View style={{
        flexDirection: 'row',
        marginBottom: wp( 5 ),
        marginLeft: wp( 4 )
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
            {accountDescription}
          </ListItem.Subtitle>

          <ListItem.Title
            style={styles.destinationTitleText}
            numberOfLines={1}
          >
            {accountName}
          </ListItem.Title>
        </ListItem.Content>
      </View>
    )
  }
  const renderProceedButton = () => {
    return ( <View style={{
      flexDirection: 'row', marginTop: 'auto', alignItems: 'flex-start'
    }} >
      <AppBottomSheetTouchableWrapper
        disabled={hasButtonBeenPressed? true : false}
        onPress={()=> {
          if( isConfirm ) {
            handleProceedButtonPress()
          } else {
            setIsConfirm( true )
          }
        }}
        style={{
          ...styles.successModalButtonView
        }}
      >
        <Text style={styles.proceedButtonText}>{!isConfirm ? 'Next' : 'Link Swan'}</Text>
      </AppBottomSheetTouchableWrapper>
      <AppBottomSheetTouchableWrapper
        onPress={() => {onPress()}}
        style={{
          height: wp( '15%' ),
          width: wp( '36%' ),
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: wp( '8%' ),
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.FiraSansMedium,
            color: Colors.blue
          }}
        >
          {strings.NotNow}
        </Text>
      </AppBottomSheetTouchableWrapper>
      {/* <View style={{
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

      </View> */}
    </View> )
  }
  const renderSuccessButton = () => {
    return ( <View style={{
      marginTop: 'auto',
      flexDirection: 'row',
      marginBottom: hp( 4 )
    }} >
      <AppBottomSheetTouchableWrapper
        onPress={onClickSetting}
        style={{
          ...styles.successModalButtonView
        }}
      >
        <Text style={styles.proceedButtonText}>{'Done'}</Text>
      </AppBottomSheetTouchableWrapper>
      {/* <Image
        source={require( '../../../assets/images/icons/success.png' )
        }
        style={styles.successImage}
      /> */}
    </View> )
  }

  return ( <View style={{
    ...styles.modalContentContainer
  }}>
    {swanAccountCreationStatus === SwanAccountCreationStatus.ERROR &&
    <TouchableOpacity
      activeOpacity={1}
      onPress={onClickSetting}
      style={{
        width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
        alignSelf: 'flex-end',
        backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
        marginTop: wp( 3 ), marginRight: wp( 3 )
      }}
    >
      <FontAwesome name="close" color={Colors.white} size={19} style={{
        // marginTop: hp( 0.5 )
      }} />
    </TouchableOpacity>
    }
    {renderMessage()}
    {showNote &&
    <View style={styles.statusIndicatorView}>
      <View style={styles.statusIndicatorInactiveView} />
      {/* <View style={styles.statusIndicatorInactiveView} /> */}
      <View style={styles.statusIndicatorActiveView} />
    </View>
    }
    {renderFooter()}
  </View>
  )
}

const styles = StyleSheet.create( {
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '6%' ),
    marginBottom: hp( 2 )
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  modalContentContainer: {
    backgroundColor: Colors.white,
  },
  avatarImage: {
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageLarge,
    borderRadius: wp( 14 )/2,
    marginRight: 14,
  },
  destinationTitleText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 20 ),
    color: Colors.black,
  },
  successModalHeaderView: {
    marginRight: wp( '7%' ),
    // marginLeft: wp( '5%' ),
    marginTop: wp( '3.6%' ),
    // flex: 1.7
  },
  modalTitleText: {
    marginBottom: wp( '4%' ),
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: wp( '6%' )
  },
  modalInfoText: {
    marginLeft: wp( '6%' ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify',
    // marginTop: wp( 1 ),
    marginBottom: wp( 4 ),
    marginRight: wp( 5 ),
    lineHeight: 18,
    letterSpacing: 0.6
  },
  successModalButtonView: {
    minHeight: 50,
    minWidth: 144,
    paddingHorizontal: wp( 4 ),
    paddingVertical: wp( 3 ),
    height: wp( '13%' ),
    // width: wp( '27%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    marginTop: 'auto',
    backgroundColor: Colors.blue,
    alignSelf: 'flex-start',
    marginLeft: wp( '6%' ),
    marginBottom: hp( 3 )
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
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
    resizeMode: 'stretch',
    marginBottom: hp( '-4%' ),
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
