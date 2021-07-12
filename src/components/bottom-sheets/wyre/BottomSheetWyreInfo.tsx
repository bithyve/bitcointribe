import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../AppBottomSheetTouchableWrapper'
import useWyreIntegrationState from '../../../utils/hooks/state-selectors/accounts/UseWyreIntegrationState'
import { fetchWyreReservation } from '../../../store/actions/WyreIntegration'
import useWyreReservationFetchEffect from '../../../utils/hooks/wyre-integration/UseWyreReservationFetchEffect'
import openLink from '../../../utils/OpenLink'
import { ListItem } from 'react-native-elements'
import useReceivingAddressFromAccount from '../../../utils/hooks/account-utils/UseReceivingAddressFromAccount'
import { AccountType } from '../../../bitcoin/utilities/Interface'

type Props = {
  wyreFromDeepLink: boolean | null;
  wyreFromBuyMenu: boolean | null;
  wyreDeepLinkContent: string | null;
  onClickSetting: () => any;
  onPress: () => any;
}

const BottomSheetWyreInfo: React.FC<Props> = ( { wyreDeepLinkContent, wyreFromBuyMenu, wyreFromDeepLink, onClickSetting, onPress }: Props ) => {
  const dispatch = useDispatch()
  const { wyreHostedUrl } = useWyreIntegrationState()
  const [ pickReceiveAddressFrom, setPickReceiveAddressFrom ] = useState( AccountType.CHECKING_ACCOUNT )
  const wyreReceiveAddress = useReceivingAddressFromAccount( AccountType.WYRE_ACCOUNT, pickReceiveAddressFrom )
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  function handleProceedButtonPress() {
    if( !hasButtonBeenPressed ){dispatch( fetchWyreReservation() )}
    setHasButtonBeenPressed( true )
  }

  useWyreReservationFetchEffect( {
    onSuccess: () => {
      openLink( wyreHostedUrl )
    },
    onFailure: () => {
      setHasButtonBeenPressed( true )
    }
  } )

  // eslint-disable-next-line quotes
  let wyreMessage = `Wyre enables BTC purchases using Apple Pay, debit card, bank transfer as well as easy transfers using open banking where available. Payment methods available may vary based on your country. \n\nBy proceeding, you understand that Wyre will process the payment and transfer for the purchased bitcoin.`

  let wyreTitle = 'Buy bitcoin with Wyre'

  if( wyreDeepLinkContent && wyreDeepLinkContent.search( 'fail' )>=0 ) {
    wyreMessage = 'Wyre was not able to process your payment. Please try after sometime or use a different payment method'
    wyreTitle = 'Wyre order failed'
  }
  if( wyreDeepLinkContent && wyreDeepLinkContent.search( 'success' )>=0 ) {
    wyreMessage = 'Your order is successful, the purchased bitcoin will be transferred to your Wyre account shortly'
    wyreTitle = 'Order successful'
  }
  return ( <View style={{
    ...styles.modalContentContainer
  }}>
    <TouchableOpacity
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
    </TouchableOpacity>
    {/* <Text style={styles.modalTitleText}>{wyreTitle}</Text> */}
    <View style={styles.successModalHeaderView}>
      <Text style={styles.modalTitleText}>{wyreTitle}</Text>
      <Text style={{
        ...styles.modalInfoText,
        marginTop: wp( 1.5 ),
        marginBottom: wp( 5 ),
      }}>{wyreMessage}</Text>
    </View>

    <View style={{
      flexDirection: 'row',
      alignSelf: 'center',
      width: wp( '90%' ),
      height: hp( 9 ),
      backgroundColor: Colors.white,
      alignItems: 'center',
      marginBottom: wp( 2 ),
      borderRadius: wp( 2 ),
      elevation: 10,
      shadowColor: Colors.borderColor,
      shadowOpacity: 10,
      shadowOffset: {
        width: 2, height: 2
      },
    }}>
      <View style={styles.headerImageView}>
        <View style={styles.headerImageInitials}>
          <Image
            source={require( '../../../assets/images/icons/wyre_notext_small.png' )}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>
      </View>
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
            Wyre Account
        </ListItem.Title>
      </ListItem.Content>
    </View>

    <View style={{
      flexDirection: 'row',
      // marginLeft: wp( '1.5%' ),
      alignSelf: 'center',
      width: wp( '90%' ),
      height: hp( 9 ),
      backgroundColor: Colors.white,
      alignItems: 'center',
      marginBottom: wp( 2 ),
      borderRadius: wp( 2 ),
      elevation: 10,
      shadowColor: Colors.borderColor,
      shadowOpacity: 10,
      shadowOffset: {
        width: 2, height: 2
      },
    }}>
      <View style={styles.headerImageView}>
        <View style={styles.headerImageInitials}>
          <Image
            source={require( '../../../assets/images/icons/icon_address_type.png' )}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>
      </View>
      <ListItem.Content style={{
        flex: 1
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
          {wyreReceiveAddress}
        </ListItem.Title>
      </ListItem.Content>
    </View>

    <View style={{
      flexDirection: 'column', marginTop: 'auto', alignItems: 'flex-start', marginBottom: hp( '1%' )
    }} >
      <AppBottomSheetTouchableWrapper
        disabled={wyreFromBuyMenu ? hasButtonBeenPressed : false}
        onPress={wyreFromBuyMenu ? handleProceedButtonPress : onClickSetting}
        style={{
          ...styles.successModalButtonView
        }}
      >
        <Text style={styles.proceedButtonText}>{wyreFromBuyMenu ? 'Buy Bitcoins' : 'OK'}</Text>

      </AppBottomSheetTouchableWrapper>
    </View>
    {wyreFromBuyMenu
      ? <View style={{
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        marginTop: hp( '1.5' ),
        marginRight: wp( '5%' ),
      }}>
        <Text style={{
          fontStyle: 'italic',
          fontSize: RFValue( 11 ),
          color: Colors.textColorGrey
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
  </View>
  )
}

const styles = StyleSheet.create( {
  headerImageView: {
    width: wp( '15%' ),
    height: wp( '15%' ),
    borderColor: 'red',
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp( '15%' ) / 2,
    margin: 5
  },
  headerImage: {
    width: wp( '7%' ),
    height: wp( '7%' ),
    borderRadius: wp( '7%' ) / 2,
  },
  headerImageInitials: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundColor,
    width: wp( '13%' ),
    height: wp( '13%' ),
    borderRadius: wp( '13%' ) / 2,
  },
  modalContentContainer: {
    backgroundColor: Colors.backgroundColor1,

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
    marginLeft: wp( '3%' ),
    // marginTop: hp( '1%' )
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
    width: wp( 30 ),
    marginLeft: 10
  },
  modalInfoText: {
    marginLeft: wp( '3%' ),
    marginRight: wp( '6%' ),
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
    marginLeft: wp( '6%' ),
    marginTop: hp( 2 )
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
