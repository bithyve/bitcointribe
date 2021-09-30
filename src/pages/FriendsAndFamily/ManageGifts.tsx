import React, { useCallback, useContext, useEffect, useState, } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Text,
  ScrollView
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

const ManageGifts = ( { navigation } ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  // const [ giftDetails, showGiftDetails ] = useState( false )
  // const [ giftInfo, setGiftInfo ] = useState( null )
  const gifts = useSelector( ( state ) => idx( state, ( _ ) => _.accounts.gifts ) )
  const [ availableGifts, setAvailableGifts ] = useState( [] )
  const [ otherGifts, setOtherGifts ] = useState( [] )
  const dispatch = useDispatch()

  useEffect( ()=> {
    const availableGifts = []
    const otherGifts = []
    Object.values( gifts?? {
    } ).forEach( ( gift: Gift ) => {
      if ( gift.status === GiftStatus.CREATED ) availableGifts.push( gift )
      else otherGifts.push( gift )
    } )

    setAvailableGifts( availableGifts )
    setOtherGifts( otherGifts )
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
            title, walletName, createdAt: selectedGift.createdAt, amount: selectedGift.amount
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

  return (
    <View style={{
      height: '100%',
      backgroundColor: Colors.backgroundColor,
      alignSelf: 'center',
      width: '100%',
    }}>
      <ScrollView style={{
        flex: 1, backgroundColor: Colors.backgroundColor
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
        </View>
        {availableGifts.length > 0 &&
      availableGifts.map( ( item, index ) => {
        const title = 'Available Gift'
        const walletName = item.type === GiftType.RECEIVED ? item.sender?.walletName : item.receiver?.walletName ? item.receiver?.walletName : item.receiver?.contactId?.length > 30 ? `${item.receiver?.contactId.substr( 0, 27 )}...` : item.receiver?.contactId
        return (
          <DashedContainer
            key={index}
            titleText={'Available Gift'}
            subText={'Lorem ipsum dolor sit amet'}
            amt={numberWithCommas( item.amount )}
            date={item.createdAt}
            image={<GiftCard />}
            onPress={ () => processGift( item, title, walletName )}
          />
        )
      } )
        }
        <View
          style={{
            marginHorizontal: wp( 6 ), marginTop: hp( 1 )
          }}>
          {otherGifts.length > 0 &&
          otherGifts.map( ( item, index ) => {
            const title = item.type === GiftType.SENT ? item.type === GiftStatus.SENT ? 'Sent to recipient' : 'Claimed by the recipient' : 'Received Gift'
            const walletName = item.type === GiftType.RECEIVED ? item.sender?.walletName : item.receiver?.walletName ? item.receiver?.walletName : item.receiver?.contactId?.length > 30 ? `${item.receiver?.contactId.substr( 0, 27 )}...` : item.receiver?.contactId
            return(
              <TouchableOpacity
                key={index}
                onPress={() => {
                  navigation.navigate( 'GiftDetails', {
                    title, walletName, createdAt: item.createdAt, amount: item.amount
                  } )
                }
                }
              >
                {/* <View style={{
                backgroundColor: Colors.backgroundColor1, borderRadius: wp( 2 )
              }}>

              </View> */}
                <View style={{
                  flexDirection: 'row', justifyContent: 'space-between', marginVertical: hp( 0.5 )
                }}>
                  <Text style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.FiraSansRegular,
                    fontWeight: '600'
                  }}>
                    {title}
                  </Text>
                  <Text style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue( 10 ),
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
                    marginLeft: 'auto'
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

                </View>
              </TouchableOpacity>
            )

          } )}
        </View>

      </ScrollView>
      {availableGifts.length == 0 && otherGifts.length === 0 &&
      <BottomInfoBox
        backgroundColor={Colors.white}
        title={'Note'}
        infoText={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'
        }
      />
      }
    </View>
  )
}

const styles = StyleSheet.create( {
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
    borderRadius: wp( 2 ),
    padding: wp( 3 ),
    // justifyContent:'center',
    // alignItems:'center',
    backgroundColor: Colors.backgroundColor1,
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
    // marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // marginRight: 20,
    // marginTop: 5,
    // paddingBottom: 15,
    // paddingTop: 15,
    // borderBottomWidth: 1,
    // borderColor: Colors.borderColor,
    backgroundColor: Colors.blue,
    borderRadius: wp ( 2 ),
    // width: wp( 22 )
    // padding: wp( 1 ),
    //width: wp( 24 ),
    height: hp( 4 ),
    paddingHorizontal: wp( 2 )
  },
  contactText: {
    // marginLeft: 10,
    // marginHorizontal: wp ( 1 ),
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
    // padding: wp( 2 )
  },
} )

export default ManageGifts

