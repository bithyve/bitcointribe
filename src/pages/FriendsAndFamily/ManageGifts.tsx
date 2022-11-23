import React, { useMemo, useContext, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Text,
  ScrollView,
  FlatList,
  Image,
  RefreshControl,
  Dimensions,
  Alert,
  Platform,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import HeaderTitle from '../../components/HeaderTitle'
import CommonStyles from '../../common/Styles/Styles'
import { LocalizationContext } from '../../common/content/LocContext'
// import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import Gifts from '../../assets/images/satCards/gifts.svg'
import ImageStyles from '../../common/Styles/ImageStyles'
import idx from 'idx'
import {
  Gift,
  GiftStatus,
  GiftType,
  TrustedContact,
  Trusted_Contacts,
} from '../../bitcoin/utilities/Interface'
import ModalContainer from '../../components/home/ModalContainer'
import { syncGiftsStatus } from '../../store/actions/trustedContacts'
import BottomInfoBox from '../../components/BottomInfoBox'
import RightArrow from '../../assets/images/svgs/icon_arrow.svg'
import ManageGiftsList from './ManageGiftsList'
import IconAdd from '../../assets/images/svgs/icon_add.svg'
import IconAddLight from '../../assets/images/svgs/icon_add_dark.svg'
import CreateGiftIcon from '../../assets/images/gifts/createGift.svg'
import ClaimSatsCard from '../../assets/images/gifts/claimSatsCard.svg'
import CheckingAcc from '../../assets/images/svgs/icon_checking.svg'
import GiftKnowMore from '../../components/know-more-sheets/GiftKnowMoreModel'
import BackIcon from '../../assets/images/backWhite.svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RecipientAvatar from '../../components/RecipientAvatar'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import ToggleContainer from '../Home/ToggleContainer'
import VerifySatModalContents from '../Gift/VerifySatModalContents'
import NfcPrompt from '../Gift/NfcPromptAndroid'
import { CKTapCard } from 'cktap-protocol-react-native'
import axios from 'axios'
import AlertModalContents from '../../components/AlertModalContents'
const { width, height: screenHeight } = Dimensions.get( 'window' )

const listItemKeyExtractor = ( item ) => item.id

const ManageGifts = ( props ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]
  const { navigation } = props
  const giftScreenNav = navigation.getParam( 'giftType' )
  const [ timer, setTimer ] = useState( true )
  // const [ giftDetails, showGiftDetails ] = useState( false )
  // const [ giftInfo, setGiftInfo ] = useState( null )
  const gifts = useSelector( ( state ) => idx( state, ( _ ) => _.accounts.gifts ) )
  const trustedContacts: Trusted_Contacts = useSelector(
    ( state ) => state.trustedContacts.contacts
  )

  const exchangeRates = useSelector( ( state ) => state.accounts.exchangeRates )
  const [ showVerification, setShowVerification ] = useState( false )
  const [ giftsArr, setGiftsArr ] = useState( null )
  let statusGift = GiftStatus.CREATED
  if ( giftScreenNav == 0 || giftScreenNav == '0' ) {
    statusGift = GiftStatus.CREATED
  } else {
    statusGift = GiftStatus.SENT
  }
  const [ active, setActive ] = useState( statusGift )
  const [ knowMore, setKnowMore ] = useState( false )
  // const [ sentGifts, setSentClaimedGifts ] = useState( [] )
  // const [ receivedGifts, setReceicedGifts ] = useState( [] )
  const currencyKind = useSelector(
    ( state ) => state.preferences.giftCurrencyKind
  )
  const currencyCode = useCurrencyCode()

  const dispatch = useDispatch()
  const card = new CKTapCard()
  const [ showNFCModal, setShowNFCModal ] = useState( false )
  const [ showAlertModal, setShowAlertModal ] = useState( false )
  const [ errorMessage, setErrorMessage ] = useState( '' )

  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  useEffect( () => {
    if ( timer ) {
      setTimeout( () => {
        setTimer( false )
      }, 2000 )
    }
  }, [] )

  useEffect( () => {
    const availableGifts = []
    const sentAndClaimed = []
    const expiredArr = []
    const sortedGifts = Object.values( gifts ?? {
    } ).sort( function (
      left: Gift,
      right: Gift
    ) {
      return (
        moment.utc( right.timestamps.created ).unix() -
        moment.utc( left.timestamps.created ).unix()
      )
    } )

    sortedGifts.forEach( ( gift: Gift ) => {
      if ( gift.type === GiftType.SENT ) {
        if (
          gift.status === GiftStatus.CREATED ||
          gift.status === GiftStatus.RECLAIMED
        )
          availableGifts.push( gift )
        if (
          gift.status === GiftStatus.SENT ||
          gift.status === GiftStatus.ACCEPTED ||
          gift.status === GiftStatus.REJECTED
        )
          sentAndClaimed.push( gift )
        if (
          gift.status === GiftStatus.EXPIRED ||
          gift.status === GiftStatus.ASSOCIATED
        )
          expiredArr.push( gift )
      } else if ( gift.type === GiftType.RECEIVED ) {
        if (
          gift.status === GiftStatus.EXPIRED ||
          gift.status === GiftStatus.ASSOCIATED
        )
          expiredArr.push( gift )
        else availableGifts.push( gift )
      }
    } )
    const obj = {
    }
    obj[ `${GiftStatus.CREATED}` ] = availableGifts
    obj[ `${GiftStatus.SENT}` ] = sentAndClaimed
    obj[ `${GiftStatus.EXPIRED}` ] = expiredArr

    setGiftsArr( obj )
    // setAvailableGifts( availableGifts )
    // setReceicedGifts( receivedArr )
    // setSentClaimedGifts( sentAndClaimed )
  }, [ gifts ] )

  useEffect( () => {
    dispatch( syncGiftsStatus() )
    getIsVisited()
  }, [] )

  function performRefreshOnPullDown() {
    dispatch( syncGiftsStatus() )
  }

  const getIsVisited = async () => {
    const isVisited = await AsyncStorage.getItem( 'GiftVisited' )
    if ( !isVisited ) {
      setKnowMore( true )
      AsyncStorage.setItem( 'GiftVisited', 'true' )
    }
  }
  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  const processGift = (
    selectedGift: Gift,
    title,
    contactName,
    contact?: TrustedContact
  ) => {
    if ( selectedGift.type === GiftType.SENT ) {
      if (
        selectedGift.status === GiftStatus.CREATED ||
        selectedGift.status === GiftStatus.RECLAIMED
      ) {
        navigation.navigate( 'GiftDetails', {
          title,
          contactName,
          contact,
          gift: selectedGift,
          avatar: false,
          setActiveTab: buttonPress,
        } )
      }
    } else if ( selectedGift.type === GiftType.RECEIVED ) {
      if ( selectedGift.status === GiftStatus.ACCEPTED ) {
        navigation.navigate( 'GiftDetails', {
          title,
          contactName,
          contact,
          gift: selectedGift,
          avatar: false,
          setActiveTab: buttonPress,
        } )
      }
    }
  }

  const buttonPress = ( type ) => {
    setActive( type )
  }

  const getSectionDescription = () => {
    if ( active === GiftStatus.CREATED ) {
      if ( giftsArr?.[ `${active}` ].length === 0 )
        return 'All the gifts you create and receive would be visible below'
      else
        return 'All the gifts you have created and not sent, plus gifts you have received are shown here'
    }
    if ( active === GiftStatus.SENT ) {
      return 'All the gifts you have sent are shown here'
    }
    if ( active === GiftStatus.EXPIRED ) {
      return 'All the gifts that were not accepted or you expired are shown here'
    }
  }

  const getAmt = ( sats ) => {
    if ( prefersBitcoin ) {
      return numberWithCommas( sats )
    } else {
      if ( exchangeRates && exchangeRates[ currencyCode ] ) {
        return (
          ( exchangeRates[ currencyCode ].last / SATOSHIS_IN_BTC ) *
          sats
        ).toFixed( 2 )
      } else {
        return numberWithCommas( sats )
      }
    }
  }

  const onCloseClick = ()=>{
    setShowVerification( false )
  }

  const onViewHealthClick = async () => {
    setShowVerification( false )
    const { response, error } = await withModal( async ()=>{
      const cardData = await card.first_look()
      const { addr:address } = await card.address( true, false, cardData.active_slot )
      const { data } = await axios.get( `https://api.blockcypher.com/v1/btc/main/addrs/${address}` )
      const { balance, unconfirmed_balance } = data
      if( unconfirmed_balance > 0 ){
        Alert.alert( 'There are unconfirmed balance on the current slot' )
      }
      console.log( {
        num_slots:cardData.num_slots,
        active_slot:cardData.active_slot,
        balance
      } )
      return{
        num_slots:cardData.num_slots,
        active_slot:cardData.active_slot,
        balance
      }
    } )
    if( error ){
      console.log( error )
      return
    }
    const { num_slots, active_slot,  balance } = response
    props.navigation.navigate( 'GiftCreated', {
      numSlots: num_slots,
      activeSlot: active_slot,
      slotFromIndex: !balance?3:4,
      slotBalance: balance,
    } )
  }

  const withModal = async ( callback ) => {
    try {
      console.log( 'scanning...1' )
      if( Platform.OS == 'android' )
        setShowNFCModal( true )
      const resp = await card.nfcWrapper( callback )
      await card.endNfcSession()
      setShowNFCModal( false )
      return {
        response: resp, error: null
      }
    } catch ( error: any ) {
      console.log( error.toString() )
      setShowNFCModal( false )
      setErrorMessage( error.toString() )
      setShowAlertModal( true )
      return {
        response: null, error: error.toString()
      }
    }
  }

  return (
    <View
      style={{
        // height: '50%',
        flex: 1,
        backgroundColor: Colors.backgroundColor,
      }}
    >
      <ModalContainer
        onBackground={() => setKnowMore( false )}
        visible={knowMore}
        closeBottomSheet={() => setKnowMore( false )}
      >
        <GiftKnowMore closeModal={() => setKnowMore( false )} />
      </ModalContainer>
      <View
        style={{
          height: 'auto',
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <SafeAreaView
          style={{
            backgroundColor: Colors.blueTextNew,
          }}
        />
        <StatusBar
          backgroundColor={Colors.blueTextNew}
          barStyle="dark-content"
        />
        <View
          style={{
            width,
            borderBottomLeftRadius: 25,
            backgroundColor: Colors.blueTextNew,
            marginBottom: 20,
          }}
        >
          <View
            style={[
              CommonStyles.headerContainer,
              {
                backgroundColor: Colors.blueTextNew,
                flexDirection: 'row',
                marginRight: 10,
                marginBottom: 20,
              },
            ]}
          >
            <TouchableOpacity
              style={CommonStyles.headerLeftIconContainer}
              onPress={() => {
                navigation.goBack()
              }}
            >
              <View style={CommonStyles.headerLeftIconInnerContainer}>
                <BackIcon />
              </View>
            </TouchableOpacity>
            <View style={CommonStyles.headerCenterIconContainer}>
              <Text style={CommonStyles.headerCenterIconInnerContainer}>
                Gifts & Tips
              </Text>
            </View>
            {/* <View
              style={[
                CommonStyles.headerRightIconContainer,
                { marginLeft: 150 },
              ]}
            > */}
            <ToggleContainer />
            {/* </View> */}
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate( 'CreateGift', {
                setActiveTab: buttonPress,
              } )
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: wp( 9 ),
              marginVertical: hp( 3 ),
            }}
          >
            <View
              style={{
                backgroundColor: Colors.white,
                height: 40,
                width: 40,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CreateGiftIcon />
            </View>
            <View style={{
              flexDirection: 'column', marginLeft: 10
            }}>
              <Text style={styles.createGiftText}>Create a New Gift</Text>
              <Text style={styles.createGiftSubText}>
                Create gifts and send to your family & friends
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setShowVerification( true )
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: wp( 9 ),
              marginVertical: hp( 3 ),
              marginBottom: hp( 7 ),
            }}
          >
            <View
              style={{
                backgroundColor: Colors.white,
                height: 40,
                width: 40,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ClaimSatsCard />
            </View>
            <View style={{
              flexDirection: 'column', marginLeft: 10
            }}>
              <View style={{
                flexDirection: 'row'
              }}>
                <Text style={styles.createGiftText}>Claim your SATSCARD™ </Text>
              </View>
              <Text style={styles.createGiftSubText}>
                Move sats from your SATSCARD™ into your account.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: RFValue( 20 ),
            marginHorizontal: RFValue( 15 ),
            flex: 1,
          }}
          horizontal
        >
          {Object.keys( giftsArr ?? {
          } ).map( ( item ) => {
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.6}
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flex: 1,
                  height: 40,
                  borderRadius: active === item ? 8 : 0,
                  backgroundColor:
                    active === item ? Colors.goldenYellow : Colors.white,
                }}
                onPress={() => buttonPress( item )}
              >
                <Text
                  style={{
                    color: active === item ? Colors.white : Colors.black,
                    fontSize: RFValue( 12 ),
                    height: 40,
                    marginTop: 10,
                    fontFamily: Fonts.RobotoSlabRegular,
                  }}
                >
                  {item === GiftStatus.CREATED && 'AVAILABLE'}
                  {item === GiftStatus.SENT && 'SENT'}
                  {item === GiftStatus.EXPIRED && 'EXPIRED'}
                </Text>
              </TouchableOpacity>
            )
          } )}
        </ScrollView>
        {active === GiftStatus.CREATED && (
          <View
            style={{
              flexDirection: 'column',
              marginHorizontal: wp( 9 ),
              marginVertical: hp( 1 ),
            }}
          >
            <Text style={styles.GiftText}>Available Gifts</Text>
            <Text style={styles.GiftSubText}>
              Lorem dolor sit amet, consectetur dolor sit
            </Text>
          </View>
        )}

        {active === GiftStatus.SENT && (
          <View
            style={{
              flexDirection: 'column',
              marginHorizontal: wp( 9 ),
              marginVertical: hp( 1 ),
            }}
          >
            <Text style={styles.GiftText}>Sent Gifts</Text>
            <Text style={styles.GiftSubText}>
              Lorem dolor sit amet, consectetur dolor sit
            </Text>
          </View>
        )}

        <FlatList
          // extraData={selectedDestinationID}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                performRefreshOnPullDown()
              }}
            />
          }
          style={{
            height: hp( giftsArr?.[ `${active}` ].length === 0 ? 0 : 69 ),
          }}
          contentInset={{
            right: 0,
            top: 0,
            left: 0,
            bottom: hp( 9 ),
          }}
          contentContainerStyle={{
            paddingBottom: 300,
          }}
          showsVerticalScrollIndicator={false}
          data={giftsArr?.[ `${active}` ]}
          keyExtractor={listItemKeyExtractor}
          renderItem={( { item, index }: { item: Gift; index: Number } ) => {
            let title: string
            if ( item.type === GiftType.SENT ) {
              if (
                item.status === GiftStatus.CREATED ||
                item.status === GiftStatus.RECLAIMED
              )
                title = 'Available Gift'
              else if ( item.status === GiftStatus.SENT )
                title = 'Sent to recipient'
              else if ( item.status === GiftStatus.ACCEPTED )
                title = 'Accepted by recipient'
              else if (
                item.status === GiftStatus.EXPIRED ||
                item.status === GiftStatus.ASSOCIATED
              )
                title = 'Gift expired'
              else if ( item.status === GiftStatus.REJECTED )
                title = 'Rejected by recipient'
            } else if ( item.type === GiftType.RECEIVED ) {
              if ( item.status === GiftStatus.ACCEPTED ) title = 'Received Gift'
              else if (
                item.status === GiftStatus.EXPIRED ||
                item.status === GiftStatus.ASSOCIATED
              )
                title = 'Gift expired'
            }

            let contactName =
              item.type === GiftType.RECEIVED
                ? item.sender?.walletName
                : item.receiver?.walletName
                  ? item.receiver?.walletName
                  : item.receiver?.contactId?.length > 30
                    ? `${item.receiver?.contactId.substr( 0, 27 )}...`
                    : item.receiver?.contactId
            const contactId =
              item.type === GiftType.SENT
                ? item.receiver?.contactId
                : item.sender?.contactId //permanent channel address of the contact

            let associatedContact: TrustedContact
            if ( contactId ) {
              // gift sent to a contact (gift + F&F)
              for ( const contact of Object.values( trustedContacts ) ) {
                if ( contactId === contact.permanentChannelAddress ) {
                  associatedContact = contact
                  break
                }
              }
            }

            const contactDetails = associatedContact?.contactDetails
              ? associatedContact.contactDetails
              : null
            if ( contactDetails ) {
              contactName = contactDetails.contactName
              contactDetails.displayedName = contactDetails.contactName
            }

            return (
              <>
                {active === GiftStatus.CREATED ? (
                  <ManageGiftsList
                    titleText={'Available Gift'}
                    currency={prefersBitcoin ? ' sats' : currencyCode}
                    amt={getAmt( item.amount )}
                    date={item.timestamps?.created}
                    image={<Gifts />}
                    onPress={() =>
                      processGift( item, title, contactName, associatedContact )
                    }
                  />
                ) : (
                  <View
                    style={{
                      marginHorizontal: wp( 6 ),
                      marginTop: hp( 1 ),
                    }}
                  >
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        navigation.navigate( 'GiftDetails', {
                          title,
                          contactName,
                          contact: associatedContact,
                          gift: item,
                          avatar: true,
                          contactDetails,
                          setActiveTab: buttonPress,
                        } )
                      }}
                      style={{
                        backgroundColor: Colors.backgroundColor1,
                        borderRadius: wp( 2 ),
                        padding: wp( 3 ),
                        borderColor: Colors.blue,
                        borderWidth: 1,
                      }}
                    >
                      <View
                        style={{
                          ...styles.listItem,
                        }}
                      >
                        {contactName && contactDetails ? (
                          <View style={styles.avatarContainer}>
                            <RecipientAvatar
                              recipient={contactDetails}
                              contentContainerStyle={styles.avatarImage}
                            />
                          </View>
                        ) : (
                          <CheckingAcc />
                        )}
                        <View
                          style={{
                            alignItems: 'flex-start',
                            marginHorizontal: wp( 2 ),
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.gray13,
                              fontSize: RFValue( 8 ),
                              letterSpacing: 0.4,
                              fontFamily: Fonts.RobotoSlabRegular,
                              // fontWeight: '600'
                            }}
                          >
                            {title}
                          </Text>
                          <Text
                            style={{
                              fontFamily: Fonts.RobotoSlabRegular,
                              fontSize: RFValue( 12 ),
                              // textAlign: 'center',
                              color: Colors.gray13,
                              marginTop: 6,
                              letterSpacing: 0.6,
                            }}
                          >
                            {contactName ? contactName : 'Checking Account'}
                          </Text>
                          <Text
                            style={{
                              color: Colors.gray13,
                              fontSize: RFValue( 8 ),
                              letterSpacing: 0.4,
                              fontFamily: Fonts.RobotoSlabRegular,
                            }}
                          >
                            {moment( item.timestamps?.created ).format( 'lll' )}
                          </Text>
                        </View>
                        <View
                          style={{
                            marginLeft: 'auto',
                            marginRight: wp( 2 ),
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.gray13,
                              fontSize: RFValue( 16 ),
                              fontFamily: Fonts.RobotoSlabMedium,
                            }}
                          >
                            {getAmt( item.amount )}
                            <Text
                              style={{
                                color: Colors.gray13,
                                fontSize: RFValue( 8 ),
                                letterSpacing: 0.24,
                                fontFamily: Fonts.RobotoSlabRegular,
                              }}
                            >
                              {prefersBitcoin ? ' sats' : currencyCode}
                            </Text>
                          </Text>
                        </View>
                        <Image
                          source={require( '../../assets/images/icons/icon_arrow.png' )}
                          style={{
                            width: RFValue( 10 ),
                            height: RFValue( 16 ),
                            resizeMode: 'contain',
                            marginStart: RFValue( 11 ),
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )
          }}
        />
      </View>

      <ModalContainer onBackground={onCloseClick} visible={showVerification} closeBottomSheet={onCloseClick}>
        <VerifySatModalContents
          title={'Tap SATSCARD'}
          scTitleText={'TM'}
          info={'Get your SATSCARD'}
          info1={'TM'}
          info2={' ready to tap on your phone'}
          proceedButtonText={'Detect SATSCARD'}
          proceedButtonSubText={'TM'}
          subPoints={'Touch your SATSCARD™ on your phone after clicking \'Detect SATSCARD™\''}
          bottomImage={require( '../../assets/images/satCards/illustration.png' )}
          onCloseClick={onCloseClick}
          onPressProceed={onViewHealthClick}
          closeModal
        />
      </ModalContainer>
      <NfcPrompt visible={showNFCModal} />
      <ModalContainer onBackground={() => setShowAlertModal( false )}
        visible={showAlertModal} closeBottomSheet={() => { }}>
        <AlertModalContents
          info={errorMessage != '' ? errorMessage : 'SatCards not detected'}
          proceedButtonText={ errorMessage == 'Sorry, this device doesn\'t support NFC' ?'Ok' : 'Ok'}
          onPressProceed={() => {
            setShowAlertModal( false )
          }}
          isBottomImage={true}
          bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
    </View>
  )
}

const styles = StyleSheet.create( {
  roundedView: {
    width: wp( 12 ),
    height: wp( 12 ),
    borderRadius: wp( 12 / 2 ),
    backgroundColor: Colors.backgroundColor,
    marginBottom: hp( 2 ),
  },
  roundedViewSmall: {
    width: wp( 9 ),
    height: wp( 9 ),
    borderRadius: wp( 9 / 2 ),
    backgroundColor: Colors.backgroundColor,
    marginHorizontal: wp( 1 ),
  },
  scrollViewContainer: {
    marginHorizontal: wp( '3%' ),
    marginVertical: wp( '1.8%' ),
    backgroundColor: Colors.white,
    paddingVertical: hp( 1 ),
    borderRadius: 10,
    // height: wp( '20%' ),
    width: wp( '90%' ),
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createGiftText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    letterSpacing: 0.3,
    fontFamily: Fonts.RobotoSlabRegular,
    marginHorizontal: wp( 2 ),
  },
  createGiftSubText: {
    color: Colors.white,
    fontSize: RFValue( 8 ),
    letterSpacing: 0.3,
    fontFamily: Fonts.RobotoSlabLight,
    marginHorizontal: wp( 2 ),
  },
  GiftText: {
    color: Colors.blueTextNew,
    fontSize: RFValue( 16 ),
    letterSpacing: 0.3,
    fontFamily: Fonts.RobotoSlabRegular,
  },
  GiftSubText: {
    color: Colors.greyText,
    fontSize: RFValue( 9 ),
    letterSpacing: 0.3,
  },
  centeredView: {
    // alignSelf: 'center',
    marginHorizontal: wp( 6 ),
  },
  buttonText: {
    color: Colors.gray2,
    fontFamily: Fonts.RobotoSlabRegular,
  },
  buttonNavigator: {
    width: wp( '20%' ),
    height: 64,
    marginRight: wp( 2 ),
    marginLeft: wp( 1 ),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderRadius: wp( 3 ),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.RobotoSlabRegular,
  },
  secondNamePieceText: {
    fontSize: RFValue( 10 ),
    color: Colors.lightTextColor,
  },
  avatarImage: {
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: wp( 9 ) / 2,
    marginHorizontal: wp( 1 ),
  },
  avatarContainer: {
    width: wp( 10 ),
    height: wp( 10 ),
    borderRadius: wp( 10 ) / 2,
    borderWidth: 0.6,
    borderColor: Colors.gray2,
  },
  listItem: {
    marginVertical: hp( 0.5 ),
    // borderRadius: wp( 2 ),
    // padding: wp( 3 ),
    alignItems: 'center',
    // backgroundColor: Colors.backgroundColor1,
    flexDirection: 'row',
  },
  proceedButtonText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.RobotoSlabRegular,
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor,
  },
  selectedContactsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.lightBlue,
    borderRadius: wp( 2 ),
    height: hp( 3.6 ),
    paddingHorizontal: wp( 2 ),
    marginTop: wp( 2.7 ),
    alignSelf: 'flex-start',
  },
  createView: {
    position: 'absolute',
    bottom: hp( 5 ),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.lightBlue,
    borderRadius: wp( 2 ),
    height: hp( 5 ),
    paddingHorizontal: wp( 2 ),
    marginRight: wp( 4 ),
  },
  contactText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.RobotoSlabRegular,
    color: Colors.white,
  },
  pageTitle: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    letterSpacing: 0.7,
    // fontFamily: Fonts.RobotoSlabRegular,
    fontFamily: Fonts.RobotoSlabRegular,
    alignItems: 'center',
    marginHorizontal: wp( 4 ),
  },
} )

export default ManageGifts
