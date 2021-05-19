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
import useRampIntegrationState from '../../../utils/hooks/state-selectors/accounts/UseRampIntegrationState'
import { fetchRampReceiveAddress, fetchRampReservation } from '../../../store/actions/RampIntegration'
import useRampReservationFetchEffect from '../../../utils/hooks/ramp-integration/UseRampReservationFetchEffect'
import openLink from '../../../utils/OpenLink'
import { ListItem } from 'react-native-elements'

type Props = {
  rampDeepLinkContent: string | null;
  rampFromDeepLink: boolean | null;
  rampFromBuyMenu: boolean | null;
  onClickSetting: ()=>any;
  onPress: () => any;
}

const BottomSheetRampInfo: React.FC<Props> = ( { rampDeepLinkContent, rampFromDeepLink, rampFromBuyMenu, onClickSetting, onPress }: Props ) => {
  const dispatch = useDispatch()
  const { rampHostedUrl, rampReceiveAddress } = useRampIntegrationState()
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  function handleProceedButtonPress() {
    if( !hasButtonBeenPressed && rampFromBuyMenu ){dispatch( fetchRampReservation() )}
    setHasButtonBeenPressed( true )
  }

  useEffect( () => {
    dispatch( fetchRampReceiveAddress() )
  }, [] )


  useRampReservationFetchEffect( {
    onSuccess: () => {
      openLink( rampHostedUrl )
    },
    onFailure: () => {
      setHasButtonBeenPressed( true )
    }
  } )

  // eslint-disable-next-line quotes
  let rampMessage = 'Ramp enables BTC purchases using Apple Pay, Debit/Credit card, Bank Transfer and open banking where available. Payment methods available may vary based on your country.\n\nBy proceeding, you understand that Ramp will process the payment and transfer for the purchased bitcoin.'

  let rampTitle = 'Buy bitcoin with Ramp'

  if( rampFromDeepLink && rampDeepLinkContent ) {
    rampMessage = rampDeepLinkContent.search( 'fail' )>=0
      ? 'Ramp was not able to process your payment. Please try after sometime or use a different payment method'
      : 'Your order is being processed by Ramp, once successful the purchased bitcoin will be transferred to your Ramp account'
    rampTitle = ( rampDeepLinkContent.search( 'fail' )>=0 )
      ? 'Ramp order failed'
      : 'Order being processed'
  }
  return ( <View style={{
    ...styles.modalContentContainer
  }}>
    <View style={{
      height: '95%'
    }}>
      <View style={styles.successModalHeaderView}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onPress}
          style={{ flexDirection: 'row' }}
        >
          <FontAwesome name="long-arrow-left" color={Colors.blue} size={19} style={{ marginTop: hp( 0.5 ) }} />
          <Text style={styles.modalTitleText}>{rampTitle}</Text>
        </TouchableOpacity>
        <Text style={{
          ...styles.modalInfoText,
          marginTop: wp( 1.5 ),
          marginBottom: wp( 5 ),
        }}>{rampMessage}</Text>
      </View>
      <View style={{
          flexDirection: 'row',
          // marginLeft: wp( '1.5%' ),
          alignSelf: 'center',
          width: wp( '90%' ),
          height: hp( 9 ),
          backgroundColor: Colors.backgroundColor1,
          alignItems: 'center',
          marginBottom: wp( 2 ),
          borderRadius: wp( 2 )
        }}>
          <View style={styles.headerImageView}>
            <View style={styles.headerImageInitials}>
              <Image
                source={require( '../../../assets/images/icons/ramp_logo_notext.png' )}
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
              Ramp Account
            </ListItem.Title>
          </ListItem.Content>
        </View>

        <View style={{
          flexDirection: 'row',
          alignSelf: 'center',
          width: wp( '90%' ),
          height: hp( 9 ),
          backgroundColor: Colors.backgroundColor1,
          alignItems: 'center',
          marginBottom: wp( 2 ),
          borderRadius: wp( 2 )
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
              {rampReceiveAddress}
            </ListItem.Title>
          </ListItem.Content>
        </View>
      {rampFromBuyMenu
          ? <View style={{
            alignSelf: 'flex-end',
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center',
            marginTop: hp( '1.5' ),
            marginRight: wp( '9%' ),
          }}>
            <Text style={{
              fontStyle: 'italic',
              fontSize: RFValue( 11 ),
              color: Colors.textColorGrey
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
      <View style={{
        flexDirection: 'column', alignItems: 'flex-start', marginTop: 'auto'
      }} >
        <AppBottomSheetTouchableWrapper
          disabled={rampFromBuyMenu ? hasButtonBeenPressed : false}
          onPress={rampFromBuyMenu ? handleProceedButtonPress : onClickSetting}
          style={{
            ...styles.successModalButtonView
          }}
        >
          <Text style={styles.proceedButtonText}>{rampFromBuyMenu ? 'Buy bitcoin' : 'OK'}</Text>

        </AppBottomSheetTouchableWrapper>
      </View>

    </View>

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
    backgroundColor: Colors.white,
  },
  avatarImage: {
    ...ImageStyles.circledAvatarContainer,
    width: 45,
    height: 45,
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
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
    width: wp( 30 ),
    marginLeft: 10
  },
  modalInfoText: {
    marginLeft: wp( '7%' ),
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

export default BottomSheetRampInfo
