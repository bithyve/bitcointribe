import moment from 'moment'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Alert, FlatList, Image, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch, useSelector } from 'react-redux'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
// import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import idx from 'idx'
import Gifts from '../../assets/images/svgs/gift_card_2.svg'
import CheckingAcc from '../../assets/images/svgs/icon_checking.svg'
import { DeepLinkEncryptionType, Gift, GiftStatus, GiftType, TrustedContact, Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import { processRequestQR } from '../../common/CommonFunctions'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import ImageStyles from '../../common/Styles/ImageStyles'
import ModalContainer from '../../components/home/ModalContainer'
import GiftKnowMore from '../../components/know-more-sheets/GiftKnowMoreModel'
import RecipientAvatar from '../../components/RecipientAvatar'
import Toast from '../../components/Toast'
import { acceptExistingContactRequest } from '../../store/actions/BHR'
import { fetchGiftFromTemporaryChannel, initializeTrustedContact, InitTrustedContactFlowKind, rejectGift, rejectTrustedContact, syncGiftsStatus } from '../../store/actions/trustedContacts'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import AcceptGift from './AcceptGift'
import ToggleContainer from './CurrencyToggle'
import ManageGiftsList from './ManageGiftsList'

const QRScanner = require( '../../assets/images/icons/qr.png' )

const listItemKeyExtractor = ( item ) => item.id

const ManageGifts = ( props ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]
  const { navigation } = props
  const giftScreenNav = props.route.params?.giftType
  const [ timer, setTimer ] = useState( true )
  const [ giftData, setGiftData ] = useState<any | undefined>( undefined )
  const [ trustedContactRequest, setTrustedContactRequest ] = useState<any| undefined>( undefined )
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
  const [ giftLoading, setGiftLoading ] = useState( false )
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

  const onToogleGiftLoading=()=>{
    setGiftLoading( ()=>!giftLoading )
  }


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

  const handleGiftData=( data:any|undefined )=>{
    setGiftData( data )
  }


  const onCodeScanned = async ( qrData ) => {
    const {  giftRequest } = await processRequestQR( qrData )
    handleGiftData( giftRequest )
  }

  const openQrscanner=()=>{
    navigation.navigate( 'GiftQRScannerScreen', {
      onCodeScanned:  onCodeScanned,
    } )
  }

  const onGiftRequestAccepted = ( key? ) => {
    try {
      // this.closeBottomSheet()
      let decryptionKey: string
      try{
        switch( giftData.encryptionType ){
            case DeepLinkEncryptionType.DEFAULT:
              decryptionKey = giftData.encryptedChannelKeys
              break

            case DeepLinkEncryptionType.OTP:
            case DeepLinkEncryptionType.LONG_OTP:
            case DeepLinkEncryptionType.SECRET_PHRASE:
              decryptionKey = TrustedContactsOperations.decryptViaPsuedoKey( giftData.encryptedChannelKeys, key )
              break
        }
      } catch( err ){
        onToogleGiftLoading()
        Toast( 'Invalid key', true, true )
        return
      }

      dispatch( fetchGiftFromTemporaryChannel( giftData.channelAddress, decryptionKey ) )
    } catch ( error ) {
      onToogleGiftLoading()
      Alert.alert( 'Incompatible request, updating your app might help' )
    }
  }

  const onGiftRequestRejected = ( ) => {
    try {
      const giftRequest = {
        ...giftData
      }
      dispatch( rejectGift( giftRequest.channelAddress ) )
      handleGiftData( undefined )
    } catch ( error ) {
      Alert.alert( 'Incompatible request, updating your app might help' )
    }
  }
  const onTrustedContactRequestAccepted = ( key ) => {
    setGiftData( undefined )
    try {
      let channelKeys: string[]
      try{
        switch( trustedContactRequest.encryptionType ){
            case DeepLinkEncryptionType.DEFAULT:
              channelKeys = trustedContactRequest.encryptedChannelKeys.split( '-' )
              break
            case DeepLinkEncryptionType.NUMBER:
            case DeepLinkEncryptionType.EMAIL:
            case DeepLinkEncryptionType.OTP:
              const decryptedKeys = TrustedContactsOperations.decryptViaPsuedoKey( trustedContactRequest.encryptedChannelKeys, key )
              channelKeys = decryptedKeys.split( '-' )
              break
        }

        trustedContactRequest.channelKey = channelKeys[ 0 ]
        trustedContactRequest.contactsSecondaryChannelKey = channelKeys[ 1 ]
      } catch( err ){
        onToogleGiftLoading()
        Toast( 'Invalid key', true, true  )
        return
      }

      if( trustedContactRequest.isExistingContact ){
        dispatch( acceptExistingContactRequest( trustedContactRequest.channelKey, trustedContactRequest.contactsSecondaryChannelKey ) )
      } else {
        navigation.navigate( 'ContactsListForAssociateContact', {
          postAssociation: ( contact ) => {
            dispatch( initializeTrustedContact( {
              contact,
              flowKind: InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT,
              channelKey: trustedContactRequest.channelKey,
              contactsSecondaryChannelKey: trustedContactRequest.contactsSecondaryChannelKey,
              isPrimaryKeeper: trustedContactRequest.isPrimaryKeeper,
              isKeeper: trustedContactRequest.isKeeper,
              isCurrentLevel0:false
            } ) )
            // TODO: navigate post approval (from within saga)
            navigation.navigate( 'Home' )
          }
        } )
      }
    } catch ( error ) {
      onToogleGiftLoading()
      Alert.alert( 'Incompatible request, updating your app might help' )
    }
  }

  const onTrustedContactRejected = () => {
    try {
      let channelKeys: string[]
      try{
        switch( trustedContactRequest.encryptionType ){
            case DeepLinkEncryptionType.DEFAULT:
              channelKeys = trustedContactRequest.encryptedChannelKeys.split( '-' )
              break

            case DeepLinkEncryptionType.NUMBER:
            case DeepLinkEncryptionType.EMAIL:
            case DeepLinkEncryptionType.OTP:
              const decryptedKeys = TrustedContactsOperations.decryptViaPsuedoKey( trustedContactRequest.encryptedChannelKeys, key )
              channelKeys = decryptedKeys.split( '-' )
              break
        }

        trustedContactRequest.channelKey = channelKeys[ 0 ]
        trustedContactRequest.contactsSecondaryChannelKey = channelKeys[ 1 ]
      } catch( err ){
        onToogleGiftLoading()
        Toast( 'Invalid key', true, true  )
        return
      }
      dispatch( rejectTrustedContact( {
        channelKey: trustedContactRequest.channelKey, isExistingContact: trustedContactRequest.isExistingContact
      } ) )
    } catch ( error ) {
      Alert.alert( 'Incompatible request, updating your app might help' )
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
      {giftData? <ModalContainer onBackground={()=>handleGiftData( undefined )} visible={giftData?true:false} closeBottomSheet={() => handleGiftData( undefined )}>
        <AcceptGift
          navigation={navigation}
          closeModal={() => handleGiftData( undefined )}
          onGiftRequestAccepted={onGiftRequestAccepted}
          onGiftRequestRejected={onGiftRequestRejected}
          walletName={giftData.walletName}
          giftAmount={giftData.amount}
          inputType={giftData.encryptionType}
          hint={giftData.encryptionHint}
          note={giftData.note}
          themeId={giftData.themeId}
          giftId={giftData.channelAddress}
          isGiftWithFnF={giftData.isContactGift}
          isContactAssociated={giftData.isAssociated}
          onPressAccept={onTrustedContactRequestAccepted}
          onPressReject={onTrustedContactRejected}
          version={giftData.version}
          stopReset={true}
        />
      </ModalContainer>:null}
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
          <TouchableOpacity style={styles.qrWrapper} onPress={openQrscanner}>
            <Image source={QRScanner} style={styles.qrIcon}/>
          </TouchableOpacity>
          <ToggleContainer />
        </View>
        <View style={styles.tabWrapper}>
          <ScrollView
            contentContainerStyle={[ {
              flexDirection: 'row', alignItems: 'center', marginVertical: RFValue( 2 ), marginHorizontal: RFValue( 5 ),
              flex:1
            } ]}
            horizontal>
            {
              Object.keys( giftsArr ?? {
              } ).map( ( item ) => {
                return (
                  <TouchableOpacity
                    key={item}
                    style={styles.itemWrapper}
                    activeOpacity={0.6}
                    onPress={() => buttonPress( item )}
                  >
                    <View style={active===item?styles.activeItem:styles.inactiveItem}>
                      <Text style={active===item?styles.activeItemFont:styles.inactiveItemFont} >
                        {item === GiftStatus.CREATED && 'AVAILABLE'}
                        {item === GiftStatus.EXPIRED && 'EXPIRED'}
                        {item === GiftStatus.SENT && 'SENT'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              } )
            }
          </ScrollView>
        </View>
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
        {/* { active === GiftStatus.CREATED &&
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
        } */}
        <Text style={styles.flatlistHeader}>
          {active === GiftStatus.CREATED?'Available Gifts':active === GiftStatus.SENT?'Sent Gifts':'Expired Gifts'}
        </Text>
        {giftsArr?.[ `${active}` ].length==0 && <Text style={styles.flatlistHeaderNote}>
          {active === GiftStatus.CREATED?'No gifts are available for claiming.':active === GiftStatus.SENT?'No gifts to display. Try creating new gifts to share with your loved ones.':'All gifts that are not accepted within 7 days will be listed here.'}
        </Text>}
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
                            color: Colors.blue,
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
  qrWrapper:{
    tintColor:Colors.black,
    flex: 8,
    alignItems:'flex-end',
    justifyContent:'center'
  },
  qrIcon:{
    width:24,
    tintColor:Colors.blue,
    height:24,
    marginBottom:2
  },
  tabWrapper:{
    overflow:'hidden',
    borderRadius:12,
    backgroundColor:Colors.white,
    height:50,
    marginLeft:15,
    marginRight:15,
    marginBottom:10,
    marginTop:10,
    shadowColor: Colors.borderColor,
    shadowOffset: {
      width: 0, height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeItem:{
    height:40,
    borderRadius:12,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:Colors.testAccCard,
  },
  inactiveItem:{
    height:40,
    borderRadius:12,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:Colors.white,
  },
  activeItemFont:{
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Medium
  },
  inactiveItemFont:{
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Medium
  },
  itemWrapper:{
    flex:1,
    height:50,
    justifyContent:'center',
    backgroundColor:Colors.white,
  },
  flatlistHeader:{
    fontSize: RFValue( 16 ),
    color:Colors.blue,
    marginTop:10,
    marginLeft:20,
    fontFamily:Fonts.Medium
  },
  flatlistHeaderNote:{
    fontSize: RFValue( 12 ),
    color:Colors.textColorGrey,
    marginBottom:10,
    marginLeft:20,
    marginTop:10,
    fontFamily:Fonts.Medium,
    lineHeight:RFValue( 17 )
  }
} )

export default ManageGifts
