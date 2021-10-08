import React, { useCallback, useContext, useEffect, useState, } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Text,
  ScrollView,
  FlatList
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
import DashedContainer from './DashedContainer'
import RecipientAvatar from '../../components/RecipientAvatar'
import ImageStyles from '../../common/Styles/ImageStyles'
import idx from 'idx'
import { Gift, GiftStatus, GiftType } from '../../bitcoin/utilities/Interface'
import ModalContainer from '../../components/home/ModalContainer'
import { syncGiftsStatus } from '../../store/actions/trustedContacts'
import BottomInfoBox from '../../components/BottomInfoBox'
import RightArrow from '../../assets/images/svgs/icon_arrow.svg'
import ManageGiftsList from './ManageGiftsList'
import IconAdd from '../../assets/images/svgs/icon_add.svg'

const listItemKeyExtractor = ( item ) => item.id

const ManageGifts = ( { navigation } ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  // const [ giftDetails, showGiftDetails ] = useState( false )
  // const [ giftInfo, setGiftInfo ] = useState( null )
  const gifts = useSelector( ( state ) => idx( state, ( _ ) => _.accounts.gifts ) )
  const [ giftsArr, setGiftsArr ] = useState( null )
  const [ active, setActive ] = useState( GiftStatus.CREATED )
  // const [ sentGifts, setSentClaimedGifts ] = useState( [] )
  // const [ receivedGifts, setReceicedGifts ] = useState( [] )

  const dispatch = useDispatch()

  useEffect( ()=> {
    const availableGifts = []
    const receivedArr = []
    const sentAndClaimed = []
    const expiredArr = []
    const sortedGifts = Object.values( gifts?? {
    } ).sort( function ( left: Gift, right: Gift ) {
      return moment.utc( right.timestamps.created ).unix() - moment.utc( left.timestamps.created ).unix()
    } )

    sortedGifts.forEach( ( gift: Gift ) => {
      if ( gift.type === GiftType.RECEIVED ) {
        receivedArr.push( gift )
      } else {
        if ( gift.status === GiftStatus.CREATED ) availableGifts.push( gift )
        if ( gift.status === GiftStatus.SENT || gift.status === GiftStatus.RECLAIMED || gift.status === GiftStatus.ACCEPTED ) sentAndClaimed.push( gift )
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
  }, [] )

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  const processGift = ( selectedGift: Gift, title, walletName ) => {

    switch( selectedGift.status ){
        case GiftStatus.CREATED:
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

  return (
    <View style={{
      // height: '50%',
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    }}>


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
          backgroundColor: Colors.backgroundColor
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
          {Object.values( gifts?? {
          } ).length !== 0 &&
          <TouchableOpacity
            onPress={() => navigation.navigate( 'CreateGift' )}
            style={{
              ...styles.selectedContactsView,
            }}
          >
            <Text style={[ styles.contactText, {
              fontSize: RFValue( 24 ),
            } ]}>+</Text>
            {/* <Image
                    style={styles.addGrayImage}
                    source={require( '../../assets/images/icons/icon_add_grey.png' )}
                  /> */}
            <Text style={styles.contactText}>{strings[ 'creatnew' ]}</Text>

          </TouchableOpacity>
          }
        </View>
        <ScrollView
          style={{
            marginHorizontal: wp( 4 )
          }}
          horizontal>
          {
            Object.keys( giftsArr?? {
            } ).map( ( item ) => {
              return(
                <TouchableOpacity
                  key={item}
                  style={[ styles.buttonNavigator, {
                    backgroundColor: active === item ? Colors.lightBlue : Colors.borderColor
                  } ]}
                  onPress={() =>buttonPress( item )}
                >
                  <Text style={[ styles.buttonText, {
                    color: active === item ? Colors.white : Colors.gray2
                  } ]}>
                    {item === GiftStatus.CREATED && 'Available' }
                    {item === GiftStatus.EXPIRED && 'Expired' }
                    {item === GiftStatus.SENT && 'Sent' }
                    {item === GiftType.RECEIVED && 'Received' }
                  </Text>
                </TouchableOpacity>
              )
            } )
          }
        </ScrollView>
        <View style={{
          height: 'auto'
        }}>


          <FlatList
            // extraData={selectedDestinationID}
            data={giftsArr?.[ `${active}` ]}
            keyExtractor={listItemKeyExtractor}
            renderItem={( { item, index } ) => {
              console.log( 'item.createdAt', item )
              const title = item.status === GiftStatus.CREATED ? 'Available Gift' : item.type === GiftType.SENT ? item.type === GiftStatus.SENT ? 'Sent to recipient' : 'Claimed by the recipient' : 'Received Gift'
              const walletName = item.type === GiftType.RECEIVED ? item.sender?.walletName : item.receiver?.walletName ? item.receiver?.walletName : item.receiver?.contactId?.length > 30 ? `${item.receiver?.contactId.substr( 0, 27 )}...` : item.receiver?.contactId
              return(
                <>
                  {active === GiftStatus.CREATED ?
                    <ManageGiftsList
                      titleText={'Available Gift'}
                      subText={'Lorem ipsum dolor sit amet'}
                      amt={numberWithCommas( item.amount )}
                      date={item.timestamps?.created}
                      image={<GiftCard />}
                      onPress={ () => processGift( item, title, walletName )}
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
                            title, walletName, gift: item, avatar: true
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
                          flexDirection: 'row', justifyContent: 'space-between', marginVertical: hp( 0.5 ), marginTop: hp( 1.5 )
                        }}>
                          <Text style={{
                            color: Colors.lightTextColor,
                            fontSize: RFValue( 10 ),
                            letterSpacing: 0.7,
                            fontFamily: Fonts.FiraSansRegular,
                            fontWeight: '700'
                          }}>
                            {title}
                          </Text>
                          <Text style={{
                            color: Colors.lightTextColor,
                            fontSize: RFValue( 10 ),
                            letterSpacing: 0.1,
                            fontFamily: Fonts.FiraSansRegular,
                            alignSelf: 'flex-end'
                          }}>
                            {moment( item.createdAt ).format( 'lll' )}
                          </Text>
                        </View>

                        <View style={{
                          ...styles.listItem
                        }}
                        >
                          <View style={styles.avatarContainer}>
                            {/* <RecipientAvatar recipient={contactDescription.contactDetails} contentContainerStyle={styles.avatarImage} /> */}
                          </View>
                          <View style={{
                            alignItems: 'flex-start', marginHorizontal: wp( 2 )
                          }}>
                            <Text style={{
                              textAlign: 'center', fontFamily: Fonts.FiraSansRegular, color: Colors.textColorGrey
                            }}>
                              {walletName}
                            </Text>
                            <Text style={{
                              ...styles.secondNamePieceText, fontFamily: Fonts.FiraSansRegular
                            }}>Lorem ipsum dolor sit amet</Text>
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
                          <RightArrow />
                        </View>

                      </TouchableOpacity>
                    </View>
                  }
                </>

              )

            }}
          />
        </View>
        {Object.values( gifts?? {
        } ).length === 0 &&
        <View style={{
          // marginTop: hp( '45%' )
        }}>
          <BottomInfoBox
            // backgroundColor={Colors.white}
            // title={'Note'}
            infoText={
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'
            }
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
            {[ 1, 2, 3 ].map( ( value, index ) => {
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
            } )}
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
    borderRadius: wp( 12/2 ),
    backgroundColor: Colors.backgroundColor,
    marginBottom: hp( 2 )
  },
  roundedViewSmall: {
    width: wp( 9 ),
    height: wp( 9 ),
    borderRadius: wp( 9/2 ),
    backgroundColor: Colors.backgroundColor,
    marginHorizontal: wp( 1 )
  },
  scrollViewContainer: {
    margin: wp( '3%' ),
    backgroundColor: Colors.white,
    paddingVertical: hp( 2 ),
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
  createGiftText:{
    color: Colors.darkBlue,
    fontSize: RFValue( 12 ),
    letterSpacing: 0.3,
    fontFamily: Fonts.FiraSansRegular,
  },
  centeredView: {
    // alignSelf: 'center',
    marginHorizontal: wp( 6 )
  },
  buttonText: {
    color: Colors.gray2
  },
  buttonNavigator:{
    width: wp( '20%' ),
    height: 64,
    marginRight: wp( 3 ),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderRadius: wp( 3 )
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
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: wp( 9 )/2,
  },
  listItem: {
    marginVertical: hp( 0.5 ),
    // borderRadius: wp( 2 ),
    // padding: wp( 3 ),
    alignItems:'center',
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
    borderRadius: wp ( 2 ),
    height: hp( 4 ),
    paddingHorizontal: wp( 2 )
  },
  contactText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
} )

export default ManageGifts

