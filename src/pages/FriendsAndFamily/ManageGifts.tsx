import React, { useMemo, useContext, useEffect, useState, } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Text,
  ScrollView,
  FlatList, Image, RefreshControl
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
import { Gift, GiftStatus, GiftType, TrustedContact, Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import ModalContainer from '../../components/home/ModalContainer'
import { syncGiftsStatus } from '../../store/actions/trustedContacts'
import BottomInfoBox from '../../components/BottomInfoBox'
import RightArrow from '../../assets/images/svgs/icon_arrow.svg'
import ManageGiftsList from './ManageGiftsList'
import IconAdd from '../../assets/images/svgs/icon_add.svg'
import IconAddLight from '../../assets/images/svgs/icon_add_dark.svg'
import CheckingAcc from '../../assets/images/svgs/icon_checking.svg'
import AccountCheckingHome from '../../assets/images/accIcons/icon_checking.svg'
import GiftKnowMore from '../../components/know-more-sheets/GiftKnowMoreModel'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RecipientAvatar from '../../components/RecipientAvatar'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import ToggleContainer from './CurrencyToggle'

const listItemKeyExtractor = ( item ) => item.id

const ManageGifts = ( props ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]
  const { navigation } = props
  const giftScreenNav = props.route.params?.giftType
  const [ timer, setTimer ] = useState( true )
  // const [ giftDetails, showGiftDetails ] = useState( false )
  // const [ giftInfo, setGiftInfo ] = useState( null )
  const gifts = useSelector( ( state ) => idx( state, ( _ ) => _.accounts.gifts ) )
  const trustedContacts: Trusted_Contacts = useSelector(
    ( state ) => state.trustedContacts.contacts,
  )

  const exchangeRates = useSelector(
    ( state ) => state.accounts.exchangeRates
  )
  const [ giftsArr, setGiftsArr ] = useState( null )
  let statusGift = GiftStatus.CREATED
  if( giftScreenNav == 0 || giftScreenNav == '0' ){
    statusGift = GiftStatus.CREATED
  } else {
    statusGift = GiftStatus.SENT
  }
  const [ active, setActive ] = useState( statusGift )
  const [ knowMore, setKnowMore ] = useState( false )
  // const [ sentGifts, setSentClaimedGifts ] = useState( [] )
  // const [ receivedGifts, setReceicedGifts ] = useState( [] )
  const currencyKind = useSelector(
    ( state ) => state.preferences.giftCurrencyKind,
  )
  const currencyCode = useCurrencyCode()

  const dispatch = useDispatch()

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
    } ).sort( function ( left: Gift, right: Gift ) {
      return moment.utc( right.timestamps.created ).unix() - moment.utc( left.timestamps.created ).unix()
    } )

    sortedGifts.forEach( ( gift: Gift ) => {
      if ( gift.type === GiftType.SENT ) {
        if ( gift.status === GiftStatus.CREATED || gift.status === GiftStatus.RECLAIMED ) availableGifts.push( gift )
        if ( gift.status === GiftStatus.SENT || gift.status === GiftStatus.ACCEPTED || gift.status === GiftStatus.REJECTED ) sentAndClaimed.push( gift )
        if ( gift.status === GiftStatus.EXPIRED || gift.status === GiftStatus.ASSOCIATED ) expiredArr.push( gift )
      } else if( gift.type === GiftType.RECEIVED ) {
        if ( gift.status === GiftStatus.EXPIRED || gift.status === GiftStatus.ASSOCIATED ) expiredArr.push( gift )
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

  const processGift = ( selectedGift: Gift, title, contactName, contact?: TrustedContact ) => {

    if( selectedGift.type === GiftType.SENT ){
      if( selectedGift.status === GiftStatus.CREATED || selectedGift.status === GiftStatus.RECLAIMED ){
        navigation.navigate( 'GiftDetails', {
          title, contactName, contact, gift: selectedGift, avatar: false, setActiveTab: buttonPress
        } )
      }
    } else if ( selectedGift.type === GiftType.RECEIVED ) {
      if( selectedGift.status === GiftStatus.ACCEPTED ){
        navigation.navigate( 'GiftDetails', {
          title, contactName, contact, gift: selectedGift, avatar: false, setActiveTab: buttonPress
        } )
      }
    }
  }
  // const renderGiftDetailsModel = useCallback( () => {
  //   return(
  //     <View style={{
  //       backgroundColor: Colors.white,
  //       height: hp( 30 ),
  //       paddingHorizontal: wp( 6 )
  //     }}>
  //       <TouchableOpacity
  //         activeOpacity={1}
  //         onPress={() => {showGiftDetails( false )}}
  //         style={{
  //           width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
  //           alignSelf: 'flex-end',
  //           backgroundColor: Colors.CLOSE_ICON_COLOR, alignItems: 'center', justifyContent: 'center',
  //           marginTop: wp( 3 ),
  //         }}
  //       >
  //         <FontAwesome name="close" color={Colors.white} size={19} style={{
  //         // marginTop: hp( 0.5 )
  //         }} />
  //       </TouchableOpacity>
  //       <Text style={styles.modalTitleText}>{giftInfo.type === GiftType.SENT ? giftInfo.type === GiftStatus.SENT ? 'Sent to recipient' : 'Claimed by the recipient' : 'Received Gift' }</Text>
  //       <Text></Text>
  //       <Text>Amount: {giftInfo.amount}</Text>
  //     </View>
  //   )
  // }, [ giftInfo ] )

  const buttonPress = ( type ) => {
    setActive( type )
  }

  const getSectionDescription = () => {
    if ( active === GiftStatus.CREATED ) {
      if( giftsArr?.[ `${active}` ].length === 0 ) return 'All the gifts you create and receive would be visible below'
      else return 'All the gifts you have created and not sent, plus gifts you have received are shown here'
    }
    if ( active === GiftStatus.SENT ) {
      return 'All the gifts you have sent are shown here'
    }
    if ( active === GiftStatus.EXPIRED ) {
      return 'All the gifts that were not accepted or you expired are shown here'
    }
  }

  const getAmt = ( sats ) => {
    if( prefersBitcoin ) {
      return numberWithCommas( sats )
    } else {
      if( exchangeRates && exchangeRates[ currencyCode ] ) {
        return ( exchangeRates[ currencyCode ].last /SATOSHIS_IN_BTC * sats ).toFixed( 2 )
      } else {
        return numberWithCommas( sats )
      }
    }
  }

  return (
    <View style={{
      // height: '50%',
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    }}>
      <ModalContainer onBackground={()=>setKnowMore( false )} visible={knowMore} closeBottomSheet={() => setKnowMore( false )}>
        <GiftKnowMore closeModal={() => setKnowMore( false )} />
      </ModalContainer>
      <View style={{
        height: 'auto',
        backgroundColor: Colors.backgroundColor,
      }}>
        <SafeAreaView
          style={{
            backgroundColor: Colors.backgroundColor
          }}
        />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        {/* {giftDetails &&
      <ModalContainer visible={giftDetails} closeBottomSheet={() => {}} >
        {renderGiftDetailsModel()}
      </ModalContainer>
        } */}
        <View style={[ CommonStyles.headerContainer, {
          backgroundColor: Colors.backgroundColor, flexDirection: 'row', justifyContent: 'space-between',
          marginRight: 10,
        } ]}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              navigation.goBack()
            }}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.homepageButtonColor}
                size={17}
              />
            </View>
          </TouchableOpacity>
          {/* <ToggleContainer /> */}
        </View>

        <View style={{
          flexDirection: 'row', marginHorizontal: 15, marginTop: 6, alignItems: 'flex-end'
        }}>
          <AccountCheckingHome height={57} width={53} />
          <Text style={[ styles.pageTitle, {
            fontSize: RFValue( 24 ),
            marginStart: 13,
            marginBottom: 5,
          } ]}>
            {strings[ 'giftsats' ]}
          </Text>
          <ToggleContainer />
        </View>
        <Text style={{
          marginHorizontal: 15, fontSize: RFValue( 11 ), color: '#525252', fontFamily: Fonts.Light, marginTop: 18
        }}>{'Give sats as gifts to your friends and family, view and manage created gifts. '}
          <Text onPress={() => setKnowMore( true )} style={{
            color:'#A36363'
          }}>{common[ 'knowMore' ]}</Text>
        </Text>
        <ScrollView
          contentContainerStyle={{
            flexDirection: 'row', alignItems: 'center', marginVertical: RFValue( 20 ), marginHorizontal: RFValue( 15 ),
            flex:1
          }}
          horizontal>
          {
            Object.keys( giftsArr ?? {
            } ).map( ( item ) => {
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.6}
                  style={{
                    justifyContent: 'space-between', alignItems: 'center', flex: 1
                  }}
                  onPress={() => buttonPress( item )}
                >
                  <Text style={{
                    color: Colors.blue, fontSize: RFValue( 14 ), fontFamily: Fonts.Medium
                  }} >
                    {item === GiftStatus.CREATED && 'Available'}
                    {item === GiftStatus.EXPIRED && 'Expired'}
                    {item === GiftStatus.SENT && 'Sent'}
                  </Text>
                  <View style={{
                    height: RFValue( 4 ), backgroundColor: Colors.blue, marginTop: RFValue( 7 ), width: '100%',
                    opacity:active === item ? 1:0.3
                  }} />
                </TouchableOpacity>
              )
            } )
          }
        </ScrollView>
        {/* <View style={{
          height: 'auto'
        }}> */}
        {/* {Object.values( gifts ?? {
        } ).length > 0 &&
          <BottomInfoBox
            // backgroundColor={Colors.white}
            // title={'Note'}
            infoText={getSectionDescription()}
          />
        } */}
        { active === GiftStatus.CREATED &&
        <TouchableOpacity
          onPress={() => navigation.navigate( 'CreateGift', {
            setActiveTab: buttonPress
          } )}
          style={{
            flexDirection: 'row', alignItems: 'center', marginHorizontal: wp( 9 ),
            marginVertical: hp( 1 )
          }}>
          <Image
            style={{
              width: 30, height: 30
            }}
            source={require( '../../assets/images/icons/icon_add.png' )}
          />
          <Text style={styles.createGiftText}>
          Create New Gift
          </Text>
        </TouchableOpacity>
        }

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
            right: 0, top: 0, left: 0, bottom: hp( 9 )
          }}
          contentContainerStyle={{
            paddingBottom: 300
          }}
          showsVerticalScrollIndicator={false}
          data={giftsArr?.[ `${active}` ]}
          keyExtractor={listItemKeyExtractor}
          renderItem={( { item, index }: {item:Gift, index: Number} ) => {
            let title: string
            if( item.type === GiftType.SENT ){
              if( item.status === GiftStatus.CREATED || item.status === GiftStatus.RECLAIMED ) title = 'Available Gift'
              else if( item.status === GiftStatus.SENT ) title = 'Sent to recipient'
              else if( item.status === GiftStatus.ACCEPTED ) title = 'Accepted by recipient'
              else if( item.status === GiftStatus.EXPIRED || item.status === GiftStatus.ASSOCIATED ) title = 'Gift expired'
              else if( item.status === GiftStatus.REJECTED ) title = 'Rejected by recipient'
            } else if ( item.type === GiftType.RECEIVED ){
              if( item.status === GiftStatus.ACCEPTED ) title = 'Received Gift'
              else if( item.status === GiftStatus.EXPIRED || item.status === GiftStatus.ASSOCIATED ) title = 'Gift expired'
            }

            let contactName = item.type === GiftType.RECEIVED ? item.sender?.walletName : item.receiver?.walletName ? item.receiver?.walletName : item.receiver?.contactId?.length > 30 ? `${item.receiver?.contactId.substr( 0, 27 )}...` : item.receiver?.contactId
            const contactId = item.type === GiftType.SENT? item.receiver?.contactId: item.sender?.contactId //permanent channel address of the contact

            let associatedContact: TrustedContact
            if( contactId ){ // gift sent to a contact (gift + F&F)
              for( const contact of  Object.values( trustedContacts ) ){
                if( contactId === contact.permanentChannelAddress ) {
                  associatedContact = contact
                  break
                }
              }
            }

            const contactDetails = associatedContact?.contactDetails? associatedContact.contactDetails: null
            if( contactDetails ) {
              contactName = contactDetails.contactName
              contactDetails.displayedName = contactDetails.contactName
            }

            return (
              <>
                {active === GiftStatus.CREATED ?
                  <ManageGiftsList
                    titleText={'Available Gift'}
                    currency={prefersBitcoin ? ' sats' : currencyCode}
                    amt={getAmt( item.amount )}
                    date={item.timestamps?.created}
                    image={<Gifts />}
                    onPress={() => processGift( item, title, contactName, associatedContact )}
                  />
                  :
                  <View
                    style={{
                      marginHorizontal: wp( 6 ), marginTop: hp( 1 )
                    }}>
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        navigation.navigate( 'GiftDetails', {
                          title, contactName, contact: associatedContact, gift: item, avatar: true, contactDetails, setActiveTab: buttonPress
                        } )
                      }
                      }
                      style={{
                        backgroundColor: Colors.backgroundColor1,
                        borderRadius: wp( 2 ),
                        padding: wp( 3 ),
                        borderColor: Colors.blue,
                        borderWidth: 1
                      }}
                    >
                      <View style={{
                        ...styles.listItem
                      }}
                      >
                        {contactName && contactDetails ?
                          <View style={styles.avatarContainer}>
                            <RecipientAvatar recipient={contactDetails} contentContainerStyle={styles.avatarImage} />
                          </View>
                          :
                          <CheckingAcc />
                        }
                        <View style={{
                          alignItems: 'flex-start', marginHorizontal: wp( 2 )
                        }}>
                          <Text style={{
                            color: Colors.gray13,
                            fontSize: RFValue( 8 ),
                            letterSpacing: 0.4,
                            fontFamily: Fonts.Regular,
                            // fontWeight: '600'
                          }}>
                            {title}
                          </Text>
                          <Text style={{
                            fontFamily: Fonts.Medium,
                            fontSize: RFValue( 12 ),
                            // textAlign: 'center',
                            color: Colors.gray13,
                            marginTop:6,
                            letterSpacing: 0.6,
                          }}>
                            {contactName ? contactName : 'Checking Account'}
                          </Text>
                          <Text style={{
                            color: Colors.gray13,
                            fontSize: RFValue( 8 ),
                            letterSpacing: 0.4,
                            fontFamily: Fonts.Regular,
                          }}>
                            {moment( item.timestamps?.created ).format( 'lll' )}
                          </Text>
                        </View>
                        <View style={{
                          marginLeft: 'auto',
                          marginRight: wp( 2 ),
                        }}>
                          <Text style={{
                            color: Colors.gray13,
                            fontSize: RFValue( 16 ),
                            fontFamily: Fonts.SemiBold,
                          }}>
                            {getAmt( item.amount )}
                            <Text style={{
                              color: Colors.gray13,
                              fontSize: RFValue( 8 ),
                              letterSpacing: 0.24,
                              fontFamily: Fonts.Regular
                            }}>{prefersBitcoin ? ' sats' : currencyCode}
                            </Text>
                          </Text>
                        </View>
                        <Image source={require( '../../assets/images/icons/icon_arrow.png' )}
                          style={{
                            width: RFValue( 10 ),
                            height: RFValue( 16 ),
                            resizeMode: 'contain',
                            marginStart:RFValue( 11 )
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                }
              </>
            )
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  roundedView: {
    width: wp( 12 ),
    height: wp( 12 ),
    borderRadius: wp( 12 / 2 ),
    backgroundColor: Colors.backgroundColor,
    marginBottom: hp( 2 )
  },
  roundedViewSmall: {
    width: wp( 9 ),
    height: wp( 9 ),
    borderRadius: wp( 9 / 2 ),
    backgroundColor: Colors.backgroundColor,
    marginHorizontal: wp( 1 )
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
    color: Colors.blueTextNew,
    fontSize: RFValue( 12 ),
    letterSpacing: 0.3,
    fontFamily: Fonts.Medium,
    marginHorizontal: wp( 2 )
  },
  centeredView: {
    // alignSelf: 'center',
    marginHorizontal: wp( 6 )
  },
  buttonText: {
    color: Colors.gray2,
    fontFamily: Fonts.Medium
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
    fontFamily: Fonts.Regular,
  },
  secondNamePieceText: {
    fontSize: RFValue( 10 ),
    color: Colors.lightTextColor
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
    borderColor: Colors.gray2
  },
  listItem: {
    marginVertical: hp( 0.5 ),
    // borderRadius: wp( 2 ),
    // padding: wp( 3 ),
    alignItems: 'center',
    // backgroundColor: Colors.backgroundColor1,
    flexDirection: 'row'
  },
  proceedButtonText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium
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
    alignSelf: 'flex-start'
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
    marginRight: wp( 4 )
  },
  contactText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
    color: Colors.white,
  },
  pageTitle: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    letterSpacing: 0.7,
    // fontFamily: Fonts.Regular,
    fontFamily: Fonts.Medium,
    alignItems: 'center',
    marginHorizontal: wp( 4 ),
  },
} )

export default ManageGifts

