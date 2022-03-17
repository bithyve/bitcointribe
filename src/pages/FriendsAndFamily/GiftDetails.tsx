import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
  StatusBar,
  ScrollView,
  Platform,
  Alert,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import HeaderTitle from '../../components/HeaderTitle'
import CommonStyles from '../../common/Styles/Styles'
import {
  AccountType,
  DeepLinkEncryptionType,
  Gift,
  GiftStatus,
  GiftType,
  TrustedContact,
} from '../../bitcoin/utilities/Interface'
import idx from 'idx'
import AccountShell from '../../common/data/models/AccountShell'
import ImageStyles from '../../common/Styles/ImageStyles'
import {
  associateGift,
  reclaimGift,
} from '../../store/actions/trustedContacts'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import LeftArrow from '../../assets/images/svgs/Left_arrow_new.svg'
import ArrowDown from '../../assets/images/svgs/icon_arrow_down.svg'
import ArrowUp from '../../assets/images/svgs/icon_arrow_up.svg'
import CheckingAcc from '../../assets/images/svgs/gift_icon_new.svg'
import RecipientAvatar from '../../components/RecipientAvatar'
import AccountSelection from './AccountSelection'
import ModalContainer from '../../components/home/ModalContainer'
import AddGiftToAccount from './AddGiftToAccount'
import ThemeList from './Theme'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import RadioButton from '../../components/RadioButton'
import Feather from 'react-native-vector-icons/Feather'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'


const GiftDetails = ( { navigation } ) => {


  const dispatch = useDispatch()
  const {
    title,
    contactName,
    contact,
    gift,
    avatar,
    contactDetails,
  }: {
    title: string;
    contactName: string;
    contact: TrustedContact,
    gift: Gift;
    avatar: boolean;
    contactDetails: any;
  } = navigation.state.params

  const [ isOpen, setIsOpen ] = useState( false )
  const [ acceptGift, setAcceptGiftModal ] = useState( false )

  const currencyKind = useSelector(
    ( state ) => state.preferences.giftCurrencyKind,
  )
  const currencyCode = useCurrencyCode()
  const exchangeRates = useSelector(
    ( state ) => state.accounts.exchangeRates
  )
  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  const deepLinkConfig = contact? contact.deepLinkConfig: gift.deepLinkConfig ? gift.deepLinkConfig: null

  useEffect( ()=> {
    if( gift.status === GiftStatus.SENT ) setIsOpen( true )
  }, [ gift ] )

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  const getTheme = () => {
    // props.themeId
    const filteredArr = ThemeList.filter( ( item ) => item.id === gift.themeId )
    return filteredArr[ 0 ]
  }

  const bottomButton = ( onPressButton, text ) =>{
    return <TouchableOpacity
      style={styles.bottomButton}
      onPress={() => onPressButton()}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
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
    <SafeAreaView style={styles.viewContainer}>
      <StatusBar
        backgroundColor={Colors.backgroundColor}
        barStyle="dark-content"
      />
      <ScrollView>
        <View style={styles.advancedButton}>
          <View
            style={[
              CommonStyles.headerContainer,
              {
                backgroundColor: Colors.backgroundColor,
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
                <LeftArrow/>
              </View>

            </TouchableOpacity>

          </View>

        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginRight: wp( 4 ),
          }}
        >
          <HeaderTitle
            firstLineTitle={'Gift Details'}
            secondLineTitle={'Logs of Gift status appear here'}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />
        </View>
        <TouchableOpacity
          onPress={() => setIsOpen( !isOpen )}
          style={
            gift.status === GiftStatus.SENT
              ? [
                styles.dashedContainer,
              ]
              :
              [
                styles.dashedContainer,
                {
                  borderColor: Colors.white,
                  shadowOpacity: isOpen ? 1 : 0,
                  borderWidth: 1
                },
              ]
          }
        >
          <View
            style={
              gift.status === GiftStatus.SENT
                ? styles.dashedStyle
                : styles.normalStyle
            }
          >
            <View
              style={{
                marginHorizontal: wp( 1 ),
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  color: Colors.lightTextColor,
                  fontSize: RFValue( 10 ),
                  fontFamily: Fonts.FiraSansRegular,
                  fontWeight: '600',
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  color: Colors.lightTextColor,
                  fontSize: RFValue( 10 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                {moment( gift.timestamps.created ).format( 'lll' )}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: hp( 1 ),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                }}
              >
                {avatar && contactName && contactDetails ? (
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
                    marginLeft: wp( 1 ),
                    alignSelf: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue( 11 ),
                      fontFamily: Fonts.FiraSansRegular,
                      fontWeight: '600',
                    }}
                  >
                    {contactName ? contactName : 'From Checking Account'}
                  </Text>
                  {/* <Text style={styles.subText}>
                    {walletName ?? 'Lorem ipsum dolor'}
                  </Text> */}
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: Colors.black,
                    fontSize: RFValue( 18 ),
                    fontFamily: Fonts.FiraSansRegular,
                    marginHorizontal: wp( 2 ),
                  }}
                >
                  {getAmt( gift.amount )}
                  <Text
                    style={{
                      color: Colors.lightTextColor,
                      fontSize: RFValue( 10 ),
                      fontFamily: Fonts.FiraSansRegular,
                    }}
                  >
                    {prefersBitcoin ? ' sats' : ` ${currencyCode}`}
                  </Text>
                </Text>
                {gift.status !== GiftStatus.CREATED ? (
                  isOpen ? (
                    <ArrowUp />
                  ) : (
                    <ArrowDown />
                  )
                ) : null}
              </View>
            </View>
            {/* {isOpen &&
            gift.status !== GiftStatus.CREATED &&
            gift.type === GiftType.SENT &&
            deepLinkConfig?.encryptionType === DeepLinkEncryptionType.OTP && (
              <View
                style={{
                  marginHorizontal: wp( 1 ),
                }}
              >
                <Text
                  style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.FiraSansRegular,
                    fontWeight: '600',
                  }}
                >
                  Share OTP with contact
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: wp( 3 ),
                    marginVertical: hp( 2 ),
                  }}
                >
                  {deepLinkConfig?.encryptionKey
                    .split( '' )
                    .map( ( num, index ) => {
                      return (
                        <View
                          key={index}
                          style={{
                            alignItems: 'center',
                            backgroundColor: Colors.backgroundColor,
                            marginHorizontal: wp( 1 ),
                            borderRadius: wp( 2 ),
                          }}
                        >
                          <Text
                            style={{
                              marginHorizontal: wp( 4 ),
                              marginVertical: wp( 3 ),
                            }}
                          >
                            {num}
                          </Text>
                        </View>
                      )
                    } )}
                </View>
              </View>
            )} */}
            {isOpen &&
            gift.status !== GiftStatus.CREATED &&
            gift.type === GiftType.SENT && gift.note &&
            gift.note !== '' && (
              <View
                style={{
                  marginHorizontal: wp( 1 ),
                }}
              >
                <Text
                  style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.FiraSansRegular,
                    fontWeight: '600',
                  }}
                >
                  Message to recipient
                </Text>
                <View
                  style={{
                    marginLeft: wp( 3 ),
                    marginVertical: hp( 2 ),
                    backgroundColor: Colors.backgroundColor,
                    marginHorizontal: wp( 2 ),
                    borderRadius: wp( 2 ),
                    marginRight: wp( 9 ),
                  }}
                >
                  <Text
                    style={{
                      marginHorizontal: wp( 3 ),
                      marginVertical: wp( 2 ),
                      color: Colors.textColorGrey,
                      fontSize: RFValue( 10 ),
                      letterSpacing: 0.5,
                      fontFamily: Fonts.FiraSansRegular,
                    }}
                  >
                    {gift.note}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={{
          backgroundColor: Colors.backgroundColor,
          paddingBottom: hp( 4 ),
          marginTop: 10
        }}>
          <View>
            <View
              style={{
                marginLeft: wp( 7 ),
              }}
            >
              <Text
                style={{
                  ...styles.modalTitleText,
                  fontSize: 14,
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
              Second Factor used for encryption
              </Text>
            </View>
            <View
              style={styles.deepLinkEncryptionTextContainer}
            >
              <Text style={styles.deepLinkEncryptionText}>
                {deepLinkConfig?.encryptionKey == undefined ? 'No Second Factor' : deepLinkConfig?.encryptionKey}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            marginVertical: hp( 2 ),
            // backgroundColor:'hotpink',
            marginBottom:hp( Platform.OS == 'ios' ? 12 : 10 ),
          }}
        >
          {Object.entries( gift.timestamps ?? {
          } )
            .reverse()
            .map( ( item, index ) => {
              if (
                gift.type === GiftType.RECEIVED &&
                ( item[ 0 ] == 'created' ||
                  item[ 0 ] == 'sent' ||
                  item[ 0 ] == 'reclaimed' ||
                  item[ 0 ] == 'associated' )
              ) {
                return null
              }
              return (
                <View key={index} style={styles.timeInfo}>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}
                  >
                    <View style={styles.dot} />
                    <Text
                      style={{
                        color: Colors.lightTextColor,
                        fontSize: RFValue( 10 ),
                        fontFamily: Fonts.FiraSansRegular,
                        fontWeight: '600',
                      }}
                    >
                      {moment( item[ 1 ] ).format( 'lll' )}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}
                  >
                    <View style={styles.line} />
                    <View
                      style={[
                        {
                          width: wp( '80%' ),
                          borderRadius: wp( 2 ),
                          paddingVertical: hp( 1.5 ),
                          marginTop: hp( 1 ),
                          marginBottom: hp( 1 ),
                          backgroundColor: Colors.gray7,
                          paddingHorizontal: hp( 1.5 ),
                        },
                      ]}
                    >
                      <Text style={styles.modalInfoText}>
                        Gift {item[ 0 ]}
                      </Text>
                      {/* <Text style={styles.subText}>Lorem ipsum dolor sit amet</Text> */}
                    </View>
                  </View>
                </View>
              )
            } )}

        </View>

        <ModalContainer onBackground={()=>setAcceptGiftModal( false )} visible={acceptGift} closeBottomSheet={() => {}}>
          <View style={styles.modalContentContainer}>
            <AddGiftToAccount
              getTheme={getTheme}
              navigation={navigation}
              giftAmount={gift.amount}
              giftId={( gift as Gift ).id}
              onCancel={() => setAcceptGiftModal( false )}
              closeModal={()=>setAcceptGiftModal( false )}
            />
          </View>
        </ModalContainer>
        {/* <ModalContainer visible={acceptGift} closeBottomSheet={() => {}} >
        <View style={styles.modalContentContainer}>
          <AccountSelection
            onClose={(  ) => {setAcceptGiftModal( false )}}
            onChangeType={( type ) => { }}
          />
        </View>
      </ModalContainer> */}

      </ScrollView>
      <View style={{
        marginBottom: wp( '0%' ), flexDirection: 'row',
        justifyContent: 'space-evenly', paddingHorizontal: wp( '2%' ),
        paddingVertical: wp( '4%' ),
        position:'absolute', width:'100%', bottom:0, backgroundColor: Colors.backgroundColor,
      }}>
        {/* Reclaim */}
        {gift.status === GiftStatus.SENT && gift.type === GiftType.SENT ? (
          bottomButton( () => {
            dispatch( reclaimGift( gift.id ) )
            navigation.navigate( 'ManageGifts' )
          }, 'Reclaim' )
        ) : null}
        {/* Resend */}
        { ( ( gift.type === GiftType.SENT && [ GiftStatus.CREATED, GiftStatus.RECLAIMED, GiftStatus.SENT, GiftStatus.REJECTED ].includes( gift.status ) ) || ( gift.type === GiftType.RECEIVED && gift.status === GiftStatus.ACCEPTED ) ) ? ( bottomButton( () => {
          navigation.navigate( 'EnterGiftDetails', {
            giftId: ( gift as Gift ).id,
            giftMsg:gift.note,
            setActiveTab: navigation.state.params.setActiveTab
          } )
        }, gift.status === GiftStatus.SENT ? 'Resend' : 'Send Gift' ) ) : null}
        {/* Add To Account */}
        {( ( gift.type === GiftType.SENT && [ GiftStatus.CREATED, GiftStatus.REJECTED, GiftStatus.RECLAIMED ].includes( gift.status ) ) || ( gift.type === GiftType.RECEIVED && gift.status === GiftStatus.ACCEPTED ) )
        && !gift.receiver.accountId ? (
            bottomButton( () => {
              setAcceptGiftModal( true )
            }, 'Add To Account' )
          ) : null}
      </View>
    </SafeAreaView>

  )
}

const styles = StyleSheet.create( {
  avatarImage: {
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: wp( 9 ) / 2,
    marginHorizontal: wp( 1 ),
  },
  line: {
    height: hp( 7.2 ),
    width: wp( 0.05 ),
    backgroundColor: Colors.currencyGray,
    marginHorizontal: wp( 3 ),
  },
  subText: {
    color: Colors.lightTextColor,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 8 / 2,
    backgroundColor: Colors.lightTextColor,
    marginHorizontal: wp( 2 ),
    alignSelf: 'center'
  },
  timeInfo: {
    width: '87%',
    alignSelf: 'center',
    alignItems: 'flex-start',
  },
  dashedStyle: {
    backgroundColor: Colors.gray7,
    borderRadius: wp( 2 ),
    paddingTop: hp( 1 ),
    paddingHorizontal: wp( 4 ),
    borderColor: Colors.lightBlue,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  normalStyle: {
    backgroundColor: Colors.gray7,
    paddingTop: hp( 1 ),
    paddingHorizontal: wp( 2 ),
  },
  dashedContainer: {
    width: '90%',
    backgroundColor: Colors.gray7,
    shadowColor: '#6C6C6C1A',
    shadowOpacity: 1,
    shadowOffset: {
      width: 10,
      height: 10
    },
    shadowRadius: 10,
    elevation: 6,
    alignSelf: 'center',
    borderRadius: wp( 2 ),
    marginTop: hp( 1 ),
    marginBottom: hp( 1 ),
    paddingVertical: wp( 1 ),
    paddingHorizontal: wp( 1 ),
    borderColor: Colors.lightBlue,
    borderWidth: 1,
  },
  avatarContainer: {
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: wp( 9 ) / 2,
  },
  bottomButton: {
    backgroundColor: Colors.lightBlue,
    height: wp( '13%' ),
    width: '40%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.borderColor,
    alignSelf: 'center',
    paddingLeft: wp( '5%' ),
    paddingRight: wp( '5%' ),
  },
  buttonSubText: {
    marginTop: hp( 0.4 ),
    color: Colors.white,
    fontSize: RFValue( 11 ),
    letterSpacing: 0.5,
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    width: wp( '46%' ),
  },
  buttonText: {
    color: Colors.backgroundColor1,
    fontSize: RFValue( 15 ),
    letterSpacing: 0.01,
    fontFamily: Fonts.FiraSansMedium,
    // marginLeft: 10,
    // marginRight: 10,
    marginLeft: 0,
    marginRight: 0,
    // width: wp( '46%' ),
    textAlign: 'center'
  },
  keeperViewStyle: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundColor,
    paddingHorizontal: wp( '2%' ),
    paddingVertical: wp( '2%' ),
    justifyContent: 'space-between',
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: wp( 10 ),
  },
  modalContentContainer: {
    backgroundColor: Colors.backgroundColor,
    paddingBottom: hp( 4 ),
  },
  viewContainer: {
    // flex: 1,
    flexGrow: 1,
    backgroundColor: Colors.backgroundColor,
  },
  buttonView: {
    height: wp( '12%' ),
    // width: wp( '27%' ),
    paddingHorizontal: wp( 2 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15,
      height: 15,
    },
    backgroundColor: Colors.blue,
    marginLeft: wp( 2 ),
  },
  disabledButtonView: {
    height: wp( '12%' ),
    width: wp( '27%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15,
      height: 15,
    },
    backgroundColor: Colors.lightBlue,
    marginLeft: wp( 2 ),
  },
  imageView: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  },
  modalInputBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    backgroundColor: Colors.white,
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    width: wp( '85%' ),
    height: 50,
    paddingLeft: 15,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
  },
  // inputBoxFocused: {
  //   borderWidth: 0.5,
  //   borderRadius: 10,
  //   marginLeft: 20,
  //   marginRight: 20,
  //   elevation: 10,
  //   shadowColor: Colors.borderColor,
  //   shadowOpacity: 10,
  //   shadowOffset: {
  //     width: 10,
  //     height: 10,
  //   },
  //   backgroundColor: Colors.white,
  // },
  accImage: {
    marginRight: wp( 4 ),
  },
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
    lineHeight: 15,
  },
  balanceText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
  },
  proceedButtonText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  selectedContactsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.blue,
    borderRadius: wp( 2 ),
    height: hp( 4 ),
    paddingHorizontal: wp( 2 ),
  },
  contactText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  cardContainer:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fff',
    width:'80%',
    alignSelf:'center',
    padding:13,
    borderRadius:8,
    paddingHorizontal:20,
    marginVertical:10,
  },
  identificationHeading:{
    color:'#006DB4',
    fontSize:13,
    fontWeight:'400',
    fontFamily: Fonts.FiraSansRegular,

  },
  identificationDescription:{
    color:'#6C6C6C',
    fontSize:11,
    fontWeight:'400',
    width:225,
    fontFamily: Fonts.FiraSansRegular,

  },
  radioBtnContainer:{
    marginRight:10
  },
  advancedButton: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    width: '94%'
  },
  textInputContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    width:'85%',
    alignSelf:'center',
    marginTop:10,
    backgroundColor:'#fff',
    padding:14,
    borderRadius:10
  },
  textInput:{
    width:'92%'
  },
  btnContainer:{
    marginTop:10,
    backgroundColor:'#006DB4',
    width:100,
    padding:14,
    borderRadius:6,
    marginLeft: 30,
    justifyContent:'center',
    alignItems:'center',
  },
  btnText: {
    color: '#fff',
    fontWeight:'500',
    fontSize:15,
    fontFamily: Fonts.FiraSansRegular
  },
  deepLinkEncryptionText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: wp( 10 ),
    justifyContent:'center',
    textAlign: 'center',
    letterSpacing: 2
  },
  deepLinkEncryptionTextContainer: {
    width: wp( '80%' ),
    borderRadius: wp( 2 ),
    paddingVertical: hp( 1.5 ),
    marginTop: hp( 1 ),
    marginLeft: 40,
    backgroundColor: Colors.gray7,
    paddingHorizontal: hp( 1.5 ),
  }
} )

export default GiftDetails
