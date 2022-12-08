import React, { useEffect, useState, useContext } from 'react'
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../AppBottomSheetTouchableWrapper'
import useWyreIntegrationState from '../../../utils/hooks/state-selectors/accounts/UseWyreIntegrationState'
import { fetchWyreReservation } from '../../../store/actions/WyreIntegration'
import useWyreReservationFetchEffect from '../../../utils/hooks/wyre-integration/UseWyreReservationFetchEffect'
import openLink from '../../../utils/OpenLink'
import { ListItem } from 'react-native-elements'
import useReceivingAddressFromAccount from '../../../utils/hooks/account-utils/UseReceivingAddressFromAccount'
import { AccountType } from '../../../bitcoin/utilities/Interface'
import useWallet from '../../../utils/hooks/state-selectors/UseWallet'
import { newAccountsInfo } from '../../../store/sagas/accounts'
import { addNewAccountShells } from '../../../store/actions/accounts'
import DropDown from '../../../utils/Dropdown'
import { LocalizationContext } from '../../../common/content/LocContext'
import CheckingAcc from '../../../assets/images/svgs/icon_checking.svg'
import AccountShell from '../../../common/data/models/AccountShell'
import useActiveAccountShells from '../../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import { hp, wp as wp } from '../../../common/data/responsiveness/responsive'

type Props = {
  wyreFromDeepLink: boolean | null;
  wyreFromBuyMenu: boolean | null;
  wyreDeepLinkContent: string | null;
  onClickSetting: () => any;
  onPress: () => any;
}

const BottomSheetWyreInfo: React.FC<Props> = ( { wyreDeepLinkContent, wyreFromBuyMenu, wyreFromDeepLink, onClickSetting, onPress }: Props ) => {
  const dispatch = useDispatch()
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'home' ]
  const common = translations[ 'common' ]
  const { wyreHostedUrl } = useWyreIntegrationState()
  const wallet = useWallet()
  const [ dropdown, showDropdown ] = useState( false )
  const dropdownBoxList = [ {
    id: 1,
    type: AccountType.CHECKING_ACCOUNT
  },
  {
    id: 2,
    type: AccountType.DEPOSIT_ACCOUNT
  } ]
  const [ pickReceiveAddressFrom, setPickReceiveAddressFrom ] = useState( AccountType.CHECKING_ACCOUNT )
  const wyreReceiveAddress = useReceivingAddressFromAccount( AccountType.WYRE_ACCOUNT, pickReceiveAddressFrom )
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  function handleProceedButtonPress() {
    if( !hasButtonBeenPressed ){dispatch( fetchWyreReservation( wyreReceiveAddress ) )}
    setHasButtonBeenPressed( true )
  }

  useWyreReservationFetchEffect( {
    onSuccess: () => {
      openLink( wyreHostedUrl )
      onClickSetting()
    },
    onFailure: () => {
      setHasButtonBeenPressed( true )
    }
  } )

  useEffect( ()=> {
    if( pickReceiveAddressFrom === AccountType.DEPOSIT_ACCOUNT ){
      if( !wallet.accounts[ AccountType.DEPOSIT_ACCOUNT ] ){
      // create deposit account if an instance doesn't exist
        const accountsInfo: newAccountsInfo = {
          accountType: AccountType.DEPOSIT_ACCOUNT,
        }
        dispatch( addNewAccountShells( [ accountsInfo ] ) )
      }
    }
  }, [ pickReceiveAddressFrom, wallet ] )

  // eslint-disable-next-line quotes
  let wyreMessage = strings.wyreMessage

  let wyreTitle = strings.wyreTitle

  if( wyreDeepLinkContent && wyreDeepLinkContent.search( 'fail' )>=0 ) {
    wyreMessage = strings.wyrePaymentFail
    wyreTitle = strings.wyreFail
  }
  if( wyreDeepLinkContent && wyreDeepLinkContent.search( 'success' )>=0 ) {
    wyreMessage = strings.wyreProcessed
    wyreTitle = strings.Ordersuccessful
  }

  const accShell = useActiveAccountShells()

  const checkingBal = AccountShell.getTotalBalance( accShell[ 1 ] )

  return (
    <View
      style={{
        ...styles.modalContentContainer,
      }}
    >
      <View
        style={
          {
            // height: hp( 74 )
          }
        }
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onPress}
          style={{
            width: wp( 28 ),
            height: wp( 28 ),
            borderRadius: wp( 14 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.golden,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: hp( 10 ),
            marginRight: wp( 10 ),
          }}
        >
          <FontAwesome
            name="close"
            color={Colors.white}
            size={19}
            style={
              {
                // marginTop: hp( 0.5 )
              }
            }
          />
        </TouchableOpacity>
        {/* <Text style={styles.modalTitleText}>{wyreTitle}</Text> */}
        <View>
          <Text
            style={[
              ListStyles.modalTitle,
              {
                fontFamily: Fonts.RobotoSlabMedium,
                fontSize: RFValue( 18 ),
                letterSpacing: RFValue( 0.54 ),
                lineHeight: RFValue( 22 ),
                marginBottom: hp( 4 ),
                marginLeft: wp( 30 ),
                marginRight: wp( 48 ),
              },
            ]}
          >
            {wyreTitle}
          </Text>
          <Text style={styles.modalInfoText}>
            {wyreMessage.split( '\n\n' )[ 0 ]}
          </Text>
          <Text style={styles.modalInfoText1}>
            {wyreMessage.split( '\n\n' )[ 1 ]}
          </Text>
        </View>
        {/* <TouchableOpacity
      onPress={() => showDropdown( true )}
      style={styles.containerStyle}>
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
              Account Type
        </ListItem.Subtitle>


        <ListItem.Title
          style={styles.destinationTitleText}
          numberOfLines={1}
        >
          {pickReceiveAddressFrom}
        </ListItem.Title>
      </ListItem.Content>
    </TouchableOpacity>
    {dropdown ? (
      <DropDown onClose={( value ) => { setPickReceiveAddressFrom( value.type )
        showDropdown( false ) }}
      dropdownBoxList={dropdownBoxList} />
    ) : null} */}
        <View style={styles.containerStyle}>
          <View style={styles.headerImageView}>
            <View style={styles.headerImageInitials}>
              <Image
                source={require( '../../../assets/images/icons/wyre_notext_small.png' )}
                style={styles.headerImage}
                resizeMode="contain"
              />
            </View>
          </View>
          <ListItem.Content
            style={{
              height: 'auto',
              marginVertical: hp( 16 ),
            }}
          >
            <ListItem.Subtitle
              style={ListStyles.infoHeaderSubtitleText}
              numberOfLines={1}
            >
              {strings.bitcoinWill}
            </ListItem.Subtitle>

            <ListItem.Title
              style={styles.destinationTitleText}
              numberOfLines={1}
            >
              Checking Account
            </ListItem.Title>
            <ListItem.Subtitle
              style={[
                ListStyles.infoHeaderSubtitleText,
                {
                  alignSelf: 'baseline',
                  color: Colors.greyText,
                  fontFamily: Fonts.RobotoSlabRegular
                },
              ]}
              numberOfLines={1}
            >
              Balance {checkingBal} sats
            </ListItem.Subtitle>
          </ListItem.Content>
        </View>

        <View style={styles.containerStyle}>
          <View style={styles.headerImageView}>
            <View style={[ styles.headerImageInitials, {
              height: wp( 42 ),
              width: wp( 42 ),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: wp( 21 ),
              backgroundColor: '#59A65C'
            } ]}>
              {/* <Image
                source={require( '../../../assets/images/icons/icon_address_type.png' )}
                style={styles.headerImage}
                resizeMode="contain"
              /> */}
              <Text style={{
                color: Colors.backgroundColor,
                fontSize: RFValue( 22 ),
                textAlign: 'center',
                fontFamily: Fonts.RobotoSlabMedium,
                lineHeight: RFValue( 22 ),
                // backgroundColor: '#59A65C',
                // height: wp( 42 ),
                // width: wp( 42 ),
                // borderRadius: wp( 21 ),
                textAlignVertical: 'center'
              }}>
                @
              </Text>
            </View>
          </View>
          <ListItem.Content
            style={{
              flex: 1,
            }}
          >
            <ListItem.Subtitle
              style={ListStyles.infoHeaderSubtitleText}
              numberOfLines={1}
            >
              {strings.bitcoinWill}
            </ListItem.Subtitle>

            <ListItem.Title
              style={styles.destinationTitleText}
              numberOfLines={1}
            >
              {wyreReceiveAddress}
            </ListItem.Title>
          </ListItem.Content>
        </View>

        <View
          style={{
            flexDirection: 'column',
            marginTop: 'auto',
            alignItems: 'flex-end',
            marginBottom: hp( 20 ),
            marginHorizontal: wp( 20 )
          }}
        >
          <AppBottomSheetTouchableWrapper
            disabled={wyreFromBuyMenu ? hasButtonBeenPressed : false}
            onPress={
              wyreFromBuyMenu ? handleProceedButtonPress : onClickSetting
            }
            style={{
              ...styles.successModalButtonView,
              alignSelf: 'flex-end'
            }}
          >
            <Text style={styles.proceedButtonText}>
              {wyreFromBuyMenu ? strings.buyBitCoin : common.ok}
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
        {/* {wyreFromBuyMenu ? (
          <View
            style={{
              alignSelf: 'flex-end',
              flexDirection: 'row',
              alignItems: 'center',
              alignContent: 'center',
              marginTop: hp( '1.5' ),
              marginRight: wp( '5%' ),
              marginBottom: hp( '2%' ),
            }}
          >
            <Text
              style={{
                fontStyle: 'italic',
                fontSize: RFValue( 11 ),
                color: Colors.textColorGrey,
              }}
            >
              {strings.Poweredby}
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
        ) : null} */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  containerStyle: {
    flexDirection: 'row',
    marginHorizontal: wp( 30 ),
    paddingRight: wp( 30 ),
    paddingVertical: hp( 19 ),
    width: wp( 295 ),
    height: hp( 100 ),
    backgroundColor: Colors.bgColor,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: hp( 20 ),
    borderRadius: wp( 10 ),
    // elevation: 10,
    // shadowColor: Colors.borderColor,
    // shadowOpacity: 10,
    // shadowOffset: {
    //   width: 2, height: 2
    // },
  },
  headerImageView: {
    width: wp( 46 ),
    height: hp( 44 ),
    // elevation: 10,
    // shadowColor: Colors.bgColor,
    // shadowOpacity: 10,
    // shadowOffset: {
    //   width: 2, height: 2
    // },
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp( 23 ),
    marginRight: wp( 9 ),
  },
  headerImage: {
    width: wp( 46 ),
    height: hp( 44 ),
    borderRadius: wp( 23 ),
    resizeMode: 'contain'
  },
  headerImageInitials: {
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: Colors.backgroundColor,
    width: wp( 44 ),
    height: hp( 47 ),
    borderRadius: wp( 44 ) / 2,
  },
  modalContentContainer: {
    backgroundColor: Colors.bgColor,
    height: 'auto',
  },
  avatarImage: {
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageLarge,
    borderRadius: wp( 14 )/2,
    // marginRight: wp( 16 ),
  },
  destinationTitleText: {
    fontFamily: Fonts.RobotoSlabRegular,
    fontSize: RFValue( 20 ),
    color: Colors.black,
    alignContent: 'center',
    letterSpacing: RFValue( 0.01 )
  },
  // successModalHeaderView: {
  //   marginRight: wp( '10%' ),
  // },
  // modalTitleText: {
  //   color: Colors.blue,
  //   fontSize: RFValue( 18 ),
  //   fontFamily: Fonts.FiraSansRegular,
  //   width: wp( 30 ),
  //   marginLeft: 10
  // },
  modalInfoText: {
    marginLeft: wp( 30 ),
    marginRight: wp( 85 ),
    color: Colors.lightTextColor,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.RobotoSlabLight,
    textAlign: 'justify',
    letterSpacing: RFValue( 0.48 ),
    lineHeight: RFValue( 18 ),
    marginBottom: RFValue( 12 ),
  },
  modalInfoText1: {
    marginLeft: wp( 30 ),
    marginRight: wp( 85 ),
    color: '#6C6C6C',
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.RobotoSlabLight,
    textAlign: 'justify',
    letterSpacing: RFValue( 0.6 ),
    lineHeight: RFValue( 18 ),
    marginBottom: hp( 77 )
  },
  successModalButtonView: {
    height: hp( 60 ),
    width: wp( 120 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    alignSelf: 'flex-start',
    marginLeft: wp( 30 ),
    marginTop: hp( 30 )
  },
  // successModalImage: {
  //   width: wp( '25%' ),
  //   height: hp( '18%' ),
  //   marginLeft: 'auto',
  //   resizeMode: 'cover'
  // },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    height: hp( 18 ),
    fontFamily: Fonts.RobotoSlabMedium
  },
} )

export default BottomSheetWyreInfo
