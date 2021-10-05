import React, { useEffect, useState, useContext } from 'react'
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
import useWallet from '../../../utils/hooks/state-selectors/UseWallet'
import { newAccountsInfo } from '../../../store/sagas/accounts'
import { addNewAccountShells } from '../../../store/actions/accounts'
import DropDown from '../../../utils/Dropdown'
import { LocalizationContext } from '../../../common/content/LocContext'

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
  return ( <View style={{
    ...styles.modalContentContainer
  }}>
    <View style={{
      // height: hp( 74 )
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
        <Text style={ListStyles.modalTitle}>{wyreTitle}</Text>
        <Text style={{
          ...styles.modalInfoText
        }}>{wyreMessage}</Text>
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
        <ListItem.Content style={{
          flex: 1,
        }}>
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
        </ListItem.Content>
      </View>

      <View style={styles.containerStyle}>
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

      <View style={{
        flexDirection: 'column', marginTop: 'auto', alignItems: 'flex-start',
      }} >
        <AppBottomSheetTouchableWrapper
          disabled={wyreFromBuyMenu ? hasButtonBeenPressed : false}
          onPress={wyreFromBuyMenu ? handleProceedButtonPress : onClickSetting}
          style={{
            ...styles.successModalButtonView
          }}
        >
          <Text style={styles.proceedButtonText}>{wyreFromBuyMenu ? strings.buyBitCoin : common.ok}</Text>

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
          marginBottom: hp( '2%' )
        }}>
          <Text style={{
            fontStyle: 'italic',
            fontSize: RFValue( 11 ),
            color: Colors.textColorGrey
          }}>
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
        : null
      }
    </View>
  </View>
  )
}

const styles = StyleSheet.create( {
  containerStyle: {
    flexDirection: 'row',
    marginLeft: wp( '3%' ),
    // alignSelf: 'center',
    width: wp( '85%' ),
    height: hp( '11%' ),
    backgroundColor: Colors.white,
    alignItems: 'center',
    marginBottom: hp ( 2 ),
    borderRadius: wp( 2 ),
    // elevation: 10,
    // shadowColor: Colors.borderColor,
    // shadowOpacity: 10,
    // shadowOffset: {
    //   width: 2, height: 2
    // },
  },
  headerImageView: {
    width: wp( '17%' ),
    height: wp( '17%' ),
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
    borderRadius: wp( '17%' ) / 2,
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
    width: wp( '15%' ),
    height: wp( '15%' ),
    borderRadius: wp( '15%' ) / 2,
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
    alignContent: 'center',
    marginVertical: hp( 0.3 ),
    letterSpacing: RFValue( 0.01 )
  },
  successModalHeaderView: {
    marginRight: wp( '10%' ),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
    width: wp( 30 ),
    marginLeft: 10
  },
  modalInfoText: {
    marginLeft: wp( '7%' ),
    marginRight: wp( '11%' ),
    color: Colors.lightTextColor,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify',
    letterSpacing: RFValue( 0.6 ),
    lineHeight: RFValue( 18 ),
    marginTop: wp( 1.5 ),
    marginBottom: wp( 3 )
  },
  successModalButtonView: {
    minHeight: 50,
    minWidth: 110,
    height: wp( '13%' ),
    width: wp( '30%' ),
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
    // marginTop: hp( 2 )
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
