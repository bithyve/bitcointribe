import React, { useCallback, useContext, useEffect, useState, } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Text,
  ScrollView,
  FlatList, Image
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
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import ImageStyles from '../../common/Styles/ImageStyles'
import idx from 'idx'
import { Gift, GiftStatus, GiftType } from '../../bitcoin/utilities/Interface'
import ModalContainer from '../../components/home/ModalContainer'
import { syncGiftsStatus } from '../../store/actions/trustedContacts'
import BottomInfoBox from '../../components/BottomInfoBox'
import RightArrow from '../../assets/images/svgs/icon_arrow.svg'
import ManageGiftsList from './ManageGiftsList'
import IconAdd from '../../assets/images/svgs/icon_add.svg'
import IconAddLight from '../../assets/images/svgs/icon_add_light.svg'
import CheckingAcc from '../../assets/images/svgs/icon_checking.svg'
import GiftKnowMore from '../../components/know-more-sheets/GiftKnowMoreModel'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RecipientAvatar from '../../components/RecipientAvatar'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'

const listItemKeyExtractor = ( item ) => item.id

const ManageGifts = ( { navigation } ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]
  const [ timer, setTimer ] = useState( true )
  // const [ giftDetails, showGiftDetails ] = useState( false )
  // const [ giftInfo, setGiftInfo ] = useState( null )
  const gifts = useSelector( ( state ) => idx( state, ( _ ) => _.accounts.gifts ) )
  const trustedContacts: Trusted_Contacts = useSelector(
    ( state ) => state.trustedContacts.contacts,
  )
  const trustedContactsArr = Object.values( trustedContacts ?? {
  } )
  const [ giftsArr, setGiftsArr ] = useState( null )
  const [ active, setActive ] = useState( GiftStatus.CREATED )
  const [ knowMore, setKnowMore ] = useState( false )
  // const [ sentGifts, setSentClaimedGifts ] = useState( [] )
  // const [ receivedGifts, setReceicedGifts ] = useState( [] )

  const dispatch = useDispatch()

  useEffect( () => {
    if ( timer ) {
      setTimeout( () => {
        setTimer( false )
      }, 2000 )
    }
  }, [] )

  useEffect( () => {
    const availableGifts = []
    const receivedArr = []
    const sentAndClaimed = []
    const expiredArr = []
    const sortedGifts = Object.values( gifts ?? {
    } ).sort( function ( left: Gift, right: Gift ) {
      return moment.utc( right.timestamps.created ).unix() - moment.utc( left.timestamps.created ).unix()
    } )

    sortedGifts.forEach( ( gift: Gift ) => {
      if ( gift.type === GiftType.RECEIVED ) {
        receivedArr.push( gift )
      } else {
        if ( gift.status === GiftStatus.CREATED || gift.status === GiftStatus.RECLAIMED ) availableGifts.push( gift )
        if ( gift.status === GiftStatus.SENT || gift.status === GiftStatus.ACCEPTED ) sentAndClaimed.push( gift )
        if ( gift.status === GiftStatus.EXPIRED ) expiredArr.push( gift )
      }
    } )
    const obj = {
    }
    obj[ `${GiftStatus.CREATED}` ] = availableGifts
    obj[ `${GiftStatus.SENT}` ] = sentAndClaimed
    obj[ `${GiftType.RECEIVED}` ] = receivedArr
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

  const processGift = ( selectedGift: Gift, title, walletName ) => {

    switch ( selectedGift.status ) {
        case GiftStatus.CREATED:
        case GiftStatus.RECLAIMED:
          navigation.navigate( 'GiftDetails', {
            title, walletName, gift: selectedGift, avatar: false
          } )
          // navigation.navigate( 'AddContact', {
          //   fromScreen: 'ManageGift',
          //   giftId: selectedGift.id
          // } )
          break
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
  //           backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
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

  const getText = () => {
    if ( active === GiftStatus.CREATED ) {
      return 'Gifts that you have created and are ready to be sent are visible below'
    }
    if ( active === GiftStatus.SENT ) {
      return 'Gifts you\'ve sent are visible below'
    }
    if ( active === GiftStatus.EXPIRED ) {
      return 'Gifts that were unclaimed and thus expired are visible below'
    }
    if ( active === GiftType.RECEIVED ) {
      return 'Gifts you\'ve received are visible below'
    }
  }

  return (
    <View style={{
      // height: '50%',
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    }}>
      <ModalContainer visible={knowMore} closeBottomSheet={() => setKnowMore( false )}>
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
          backgroundColor: Colors.backgroundColor, flexDirection: 'row', justifyContent: 'space-between'
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
                color={Colors.blue}
                size={17}
              />
            </View>
          </TouchableOpacity>

        </View>

        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 'auto'
        }}>
          <HeaderTitle
            firstLineTitle={'Manage Gifts'}
            secondLineTitle={'View and manage created Gifts'}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />
          <TouchableOpacity
            onPress={() => setKnowMore( true )}
            style={{
              ...styles.selectedContactsView,
            }}
          >
            <Text style={styles.contactText}>{common[ 'knowMore' ]}</Text>

          </TouchableOpacity>

        </View>
        <ScrollView
          style={{
            marginHorizontal: wp( 4 ), paddingVertical: hp( 2 )
          }}
          horizontal>
          {
            Object.keys( giftsArr ?? {
            } ).map( ( item ) => {
              return (
                <TouchableOpacity
                  key={item}
                  style={[ styles.buttonNavigator, {
                    backgroundColor: active === item ? Colors.lightBlue : Colors.borderColor,
                    shadowColor: active === item ? '#77B9EB96' : Colors.white,
                    shadowOpacity: 0.9,
                    shadowOffset: {
                      width: 5, height: 6
                    },
                    shadowRadius: 10,
                    elevation: 6,
                  } ]}
                  onPress={() => buttonPress( item )}
                >
                  <Text style={[ styles.buttonText, {
                    color: active === item ? Colors.white : Colors.gray2
                  } ]}>
                    {item === GiftStatus.CREATED && 'Available'}
                    {item === GiftStatus.EXPIRED && 'Expired'}
                    {item === GiftStatus.SENT && 'Sent'}
                    {item === GiftType.RECEIVED && 'Received'}
                  </Text>
                </TouchableOpacity>
              )
            } )
          }
        </ScrollView>
        {/* <View style={{
          height: 'auto'
        }}> */}
        {Object.values( gifts ?? {
        } ).length > 0 && giftsArr?.[ `${active}` ].length === 0 &&
          <BottomInfoBox
            // backgroundColor={Colors.white}
            // title={'Note'}
            infoText={getText()}
          />
        }
        {Object.values( gifts ?? {
        } ).length > 0 && active === GiftStatus.CREATED &&
        <TouchableOpacity
          onPress={() => navigation.navigate( 'CreateGift' )}
          style={{
            flexDirection: 'row', alignItems: 'center', marginHorizontal: wp( 9 ),
            marginVertical: hp( 2 )
          }}>
          <IconAddLight />
          <Text style={styles.createGiftText}>
          Create New Gift
          </Text>
        </TouchableOpacity>
        }

        <FlatList
          // extraData={selectedDestinationID}
          style={{
            height: hp( giftsArr?.[ `${active}` ].length === 0 ? 0 : 69 ),
          }}
          contentInset={{
            right: 0, top: 0, left: 0, bottom: hp( 9 )
          }}
          showsVerticalScrollIndicator={false}
          data={giftsArr?.[ `${active}` ]}
          keyExtractor={listItemKeyExtractor}
          renderItem={( { item, index } ) => {
            const title = item.status === GiftStatus.CREATED ? 'Available Gift' : item.type === GiftType.SENT ? item.type === GiftStatus.SENT ? 'Sent to recipient' : 'Claimed by the recipient' : 'Received Gift'
            let walletName = item.type === GiftType.RECEIVED ? item.sender?.walletName : item.receiver?.walletName ? item.receiver?.walletName : item.receiver?.contactId?.length > 30 ? `${item.receiver?.contactId.substr( 0, 27 )}...` : item.receiver?.contactId
            // let image
            let contactDetails : RecipientDescribing
            if ( item.type === GiftType.SENT && item.receiver?.contactId ) {
              const arr =trustedContactsArr.filter( value => {
                return item.permanentChannelAddress === value.receiver?.contactId
              } )
              contactDetails = arr[ 0 ]?.contactDetails
              walletName = arr[ 0 ]?.contactDetails?.contactName
              // image = arr[ 0 ]?.contactDetails?.image?.uri
            }
            if ( item.type === GiftType.RECEIVED && item.sender?.contactId ) {
              const arr =trustedContactsArr.filter( value => {
                console.log( value.permanentChannelAddress, value.sender?.contactId )

                return item.permanentChannelAddress === value.sender?.contactId
              } )
              contactDetails = arr[ 0 ]?.contactDetails
              walletName = arr[ 0 ]?.contactDetails?.contactName
              // image = arr[ 0 ]?.contactDetails?.image?.uri
            }
            if( contactDetails ) {
              contactDetails.displayedName = walletName
            }
            return (
              <>
                {active === GiftStatus.CREATED ?
                  <ManageGiftsList
                    titleText={'Available Gift'}
                    // subText={'Lorem ipsum dolor sit amet'}
                    amt={numberWithCommas( item.amount )}
                    date={item.timestamps?.created}
                    image={<GiftCard />}
                    onPress={() => processGift( item, title, walletName )}
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
                          title, walletName, gift: item, avatar: true, contactDetails
                        } )
                      }
                      }
                      style={{
                        backgroundColor: Colors.backgroundColor1,
                        borderRadius: wp( 2 ),
                        padding: wp( 3 ),
                      }}
                    >
                      <View style={{
                        ...styles.listItem
                      }}
                      >
                        {walletName && contactDetails ?
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
                            color: Colors.lightTextColor,
                            fontSize: RFValue( 10 ),
                            letterSpacing: 0.8,
                            fontFamily: Fonts.FiraSansRegular,
                            fontWeight: '600'
                          }}>
                            {title}
                          </Text>
                          <Text style={{
                            fontSize: RFValue( 12 ), textAlign: 'center', fontFamily: Fonts.FiraSansRegular, color: Colors.textColorGrey
                          }}>
                            {walletName ? walletName : 'Checking Account'}
                          </Text>
                          <Text style={{
                            color: Colors.lightTextColor,
                            fontSize: RFValue( 10 ),
                            letterSpacing: 0.1,
                            fontFamily: Fonts.FiraSansRegular,
                          }}>
                            {moment( item.createdAt ).format( 'lll' )}
                          </Text>
                        </View>
                        <View style={{
                          marginLeft: 'auto',
                          marginRight: wp( 2 ),
                        }}>
                          <Text style={{
                            color: Colors.black,
                            fontSize: RFValue( 18 ),
                            fontFamily: Fonts.FiraSansRegular,
                          }}>
                            {numberWithCommas( item.amount )}
                            <Text style={{
                              color: Colors.lightTextColor,
                              fontSize: RFValue( 10 ),
                              fontFamily: Fonts.FiraSansRegular
                            }}> sats
                            </Text>
                          </Text>
                        </View>
                        <RightArrow style={{
                          marginHorizontal: wp( 1 )
                        }}/>
                      </View>

                    </TouchableOpacity>
                  </View>
                }
              </>

            )

          }}
        />
        {/* </View> */}


        {Object.values( gifts ?? {
        } ).length === 0 &&
          <View style={{
            // marginTop: hp( '45%' )
          }}>
            <BottomInfoBox
              // backgroundColor={Colors.white}
              // title={'Note'}
              infoText={getText()}
            />
            <View style={styles.centeredView}>
              <TouchableOpacity
                onPress={() => navigation.navigate( 'CreateGift' )}
                style={{
                  flexDirection: 'row', alignItems: 'center'
                }}>
                <IconAdd />
                <Text style={styles.createGiftText}>
                  Create New Gift
                </Text>
              </TouchableOpacity>
              {/* <ScrollView style={{
              flex: 1
            }}> */}
              {/* {timer && [ 1, 2, 3 ].map( ( value, index ) => {
                return (
                  <View key={index} style={styles.scrollViewContainer}>

                    <View>
                      <View style={styles.roundedView} />
                      <View
                        style={{
                          backgroundColor: Colors.backgroundColor,
                          height: wp( '4%' ),
                          width: wp( '22%' ),
                          borderRadius: 10,
                        }}
                      />
                      <View
                        style={{
                          backgroundColor: Colors.backgroundColor,
                          height: wp( '4%' ),
                          width: wp( '34%' ),
                          borderRadius: 10,
                          marginTop: hp( 1 ),
                        }}
                      />

                    </View>
                    <View>

                      <View
                        style={{
                          backgroundColor: Colors.backgroundColor,
                          height: wp( '4%' ),
                          width: wp( '35%' ),
                          borderRadius: 10,
                          marginTop: hp( 0.5 ),
                          alignSelf: 'flex-end'
                        }}
                      />
                      <View style={{
                        flexDirection: 'row', marginTop: hp( 5 ), flex: 1, alignItems: 'flex-end'
                      }}>
                        <View
                          style={{
                            backgroundColor: Colors.backgroundColor,
                            height: wp( '8%' ),
                            width: wp( '32%' ),
                            borderRadius: 20,

                          }}
                        />
                        <View style={styles.roundedViewSmall} />
                      </View>
                    </View>
                  </View>
                )
              } )} */}
              {/* </ScrollView> */}
            </View>

          </View>
        }
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
    color: Colors.blueText,
    fontSize: RFValue( 12 ),
    letterSpacing: 0.3,
    fontFamily: Fonts.FiraSansMedium,
    marginHorizontal: wp( 2 )
  },
  centeredView: {
    // alignSelf: 'center',
    marginHorizontal: wp( 6 )
  },
  buttonText: {
    color: Colors.gray2,
    fontFamily: Fonts.FiraSansMedium
  },
  buttonNavigator: {
    width: wp( '20%' ),
    height: 64,
    marginRight: wp( 3 ),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderRadius: wp( 3 ),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
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
    fontFamily: Fonts.FiraSansMedium
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
    marginRight: wp( 4 ),
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
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
} )

export default ManageGifts

