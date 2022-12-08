import React, { useEffect, useState, useContext } from 'react'
import { View, StyleSheet, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../AppBottomSheetTouchableWrapper'
import useRampIntegrationState from '../../../utils/hooks/state-selectors/accounts/UseRampIntegrationState'
import { fetchRampReceiveAddress, fetchRampReservation } from '../../../store/actions/RampIntegration'
import useRampReservationFetchEffect from '../../../utils/hooks/ramp-integration/UseRampReservationFetchEffect'
import openLink from '../../../utils/OpenLink'
import { ListItem } from 'react-native-elements'
import { AccountType } from '../../../bitcoin/utilities/Interface'
import useReceivingAddressFromAccount from '../../../utils/hooks/account-utils/UseReceivingAddressFromAccount'
import useWallet from '../../../utils/hooks/state-selectors/UseWallet'
import { newAccountsInfo } from '../../../store/sagas/accounts'
import { addNewAccountShells } from '../../../store/actions/accounts'
import DropDown from '../../../utils/Dropdown'
import { LocalizationContext } from '../../../common/content/LocContext'
import CheckingAcc from '../../../assets/images/svgs/icon_checking.svg'
import AccountShell from '../../../common/data/models/AccountShell'
import RampLogo from '../../../assets/images/svgs/ramplogo.svg'
import useActiveAccountShells from '../../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import { hp, wp } from '../../../common/data/responsiveness/responsive'


type Props = {
  rampDeepLinkContent: string | null;
  rampFromDeepLink: boolean | null;
  rampFromBuyMenu: boolean | null;
  onClickSetting: ()=>any;
  onPress: () => any;
}

const BottomSheetRampInfo: React.FC<Props> = ( { rampDeepLinkContent, rampFromDeepLink, rampFromBuyMenu, onClickSetting, onPress }: Props ) => {
  const dispatch = useDispatch()
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'home' ]
  const common = translations[ 'common' ]
  const { rampHostedUrl } = useRampIntegrationState()
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  const wallet = useWallet()
  const [ pickReceiveAddressFrom, setPickReceiveAddressFrom ] = useState( AccountType.CHECKING_ACCOUNT )
  const rampReceiveAddress = useReceivingAddressFromAccount( AccountType.RAMP_ACCOUNT, pickReceiveAddressFrom )
  const [ dropdown, showDropdown ] = useState( false )
  const dropdownBoxList = [ {
    id: 1,
    type: AccountType.CHECKING_ACCOUNT
  },
  {
    id: 2,
    type: AccountType.DEPOSIT_ACCOUNT
  } ]
  function handleProceedButtonPress() {
    if( !hasButtonBeenPressed && rampFromBuyMenu ){dispatch( fetchRampReservation( rampReceiveAddress ) )}
    setHasButtonBeenPressed( true )
  }
  const accShell = useActiveAccountShells()

  useRampReservationFetchEffect( {
    onSuccess: () => {
      openLink( rampHostedUrl )
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
      } else setPickReceiveAddressFrom( AccountType.DEPOSIT_ACCOUNT )
    }
  }, [ pickReceiveAddressFrom, wallet ] )

  const checkingBal = AccountShell.getTotalBalance( accShell[ 1 ] )

  // eslint-disable-next-line quotes
  let rampMessage = strings.rampMessage

  let rampTitle = strings.rampTitle

  if( rampFromDeepLink && rampDeepLinkContent ) {
    rampMessage = rampDeepLinkContent.search( 'fail' )>=0
      ? strings.rampPaymentFail
      : strings.rampProcessed
    rampTitle = ( rampDeepLinkContent.search( 'fail' )>=0 )
      ? strings.rampFail
      : strings.beingProcessed
  }
  return ( <View style={{
    ...styles.modalContentContainer,
  }}>
    <View>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        style={{
          width: wp( 28 ), height: wp( 28 ), borderRadius: wp( 14 ),
          alignSelf: 'flex-end',
          backgroundColor: Colors.golden, alignItems: 'center', justifyContent: 'center',
          marginTop: wp( 10 ), marginRight: wp( 10 )
        }}
      >
        <FontAwesome name="close" color={Colors.white} size={wp( 19 )} />
      </TouchableOpacity>
      <Text style={[
        ListStyles.modalTitle,
        {
          fontFamily: Fonts.RobotoSlabMedium,
          fontSize: RFValue( 18 ),
          letterSpacing: RFValue( 0.54 ),
          lineHeight: RFValue( 22 ),
          marginBottom: hp( 4 ),
          marginLeft: wp( 30 ),
          marginRight: wp( 48 ),
        }
      ]}>{rampTitle}</Text>
      <Text style={styles.modalInfoText}>{rampMessage.split( '\n\n' )[ 0 ]}</Text>
      <Text style={styles.modalInfoText1}>{rampMessage.split( '\n\n' )[ 1 ]}</Text>
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
        height: wp( '14%' )
      }}>
        <ListItem.Subtitle
          style={[ ListStyles.infoHeaderSubtitleText, {
            // alignSelf: 'flex-start'
          } ]}
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
            <CheckingAcc
              style={styles.headerImage}
              height={wp( 42 )}
              width={wp( 42 )}
            />
          </View>
        </View>

        <ListItem.Content style={{
          height: 'auto',
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
          <ListItem.Subtitle
            style={[ ListStyles.infoHeaderSubtitleText, {
              alignSelf: 'baseline', color: Colors.greyText, fontFamily: Fonts.RobotoSlabRegular
            } ]}
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
        <ListItem.Content style={{
          height: hp( 46 )
        }}>
          <ListItem.Subtitle
            style={ListStyles.listItemSubtitle}
            numberOfLines={1}
          >
            {strings.bitcoinWill}
          </ListItem.Subtitle>

          <ListItem.Title
            style={styles.destinationTitleText}
            numberOfLines={1}
          >
            {rampReceiveAddress}
          </ListItem.Title>
          {/* <ListItem.Subtitle
          style={[ ListStyles.infoHeaderSubtitleText, {
            alignSelf: 'baseline', color: Colors.blue, fontFamily: Fonts.FiraSansMediumItalic
          } ]}
          numberOfLines={1}
        >
              Lorem ipsum dolor amet
        </ListItem.Subtitle> */}
        </ListItem.Content>
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 'auto',
        marginBottom: hp( 20 ),
        marginHorizontal: wp( 20 )
      }} >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Text style={{
            fontFamily: Fonts.RobotoSlabRegular,
            fontSize: RFValue( 10 ),
            color: Colors.lightTextColor,
            lineHeight: RFValue( 22 ),
          }}>
          Powered by&ensp;
          </Text>
          <RampLogo />
        </View>

        <AppBottomSheetTouchableWrapper
          disabled={rampFromBuyMenu ? hasButtonBeenPressed : false}
          onPress={rampFromBuyMenu ? handleProceedButtonPress : onClickSetting}
          style={{
            ...styles.successModalButtonView
          }}
        >
          <Text style={styles.proceedButtonText}>{rampFromBuyMenu ? strings.buyBitCoin : common.ok}</Text>
        </AppBottomSheetTouchableWrapper>
      </View>
      {/* {rampFromBuyMenu
        ? <View style={{
          alignSelf: 'flex-end',
          flexDirection: 'row',
          alignItems: 'center',
          alignContent: 'center',
          marginTop: hp( '1.5' ),
          marginRight: wp( '6%' ),
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
            source={require( '../../../assets/images/icons/ramp_logo_large.png' )}
            style={{
              marginLeft: 5,

            }}
          />
        </View>
        : null
      } */}
    </View>
  </View>
  )
}

const styles = StyleSheet.create( {
  containerStyle: {
    flexDirection: 'row',
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
    // marginBottom: 20,
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
  // modalTitleText: {
  //   color: Colors.blue,
  //   fontSize: RFValue( 18 ),
  //   fontFamily: Fonts.RobotoSlabRegular,
  //   width: wp( 30 ),
  //   marginLeft: 10,
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
    borderRadius: 11,
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
    fontFamily: Fonts.RobotoSlabMedium
  },
} )

export default BottomSheetRampInfo
