import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
  StatusBar,
  ScrollView,
  Alert
} from 'react-native'
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
import { AccountType, Gift, GiftStatus } from '../../bitcoin/utilities/Interface'
import idx from 'idx'
import AccountShell from '../../common/data/models/AccountShell'
import ImageStyles from '../../common/Styles/ImageStyles'
import { reclaimGift } from '../../store/actions/trustedContacts'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import ArrowDown from '../../assets/images/svgs/icon_arrow_down.svg'
import ArrowUp from '../../assets/images/svgs/icon_arrow_up.svg'
import CheckingAcc from '../../assets/images/svgs/icon_checking.svg'
import RecipientAvatar from '../../components/RecipientAvatar'
import AccountSelection from './AccountSelection'
import ModalContainer from '../../components/home/ModalContainer'

const GiftDetails = ( { navigation } ) => {
  const dispatch = useDispatch()
  const { title, walletName, gift, avatar, contactDetails }: { title: string, walletName: string, gift: Gift, avatar: boolean, contactDetails:any } = navigation.state.params
  const [ isOpen, setIsOpen ] = useState( false )
  const [ acceptGift, setAcceptGiftModal ] = useState( false )
  const accountShells: AccountShell[] = useSelector( ( state ) => idx( state, ( _ ) => _.accounts.accountShells ) )
  //   const sendingAccount = accountShells.find( shell => shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT && shell.primarySubAccount.instanceNumber === 0 )

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }


  return (
    <ScrollView contentContainerStyle={{
      flexGrow: 1, height: '100%'
    }}
    keyboardShouldPersistTaps='handled'
    >
      <SafeAreaView style={styles.viewContainer}>
        <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
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
          flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginRight: wp( 4 )
        }}>
          <HeaderTitle
            firstLineTitle={'Gift Card Details'}
            secondLineTitle={'Logs of Gift status appear here'}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />
        </View>
        <TouchableOpacity
          onPress={() => setIsOpen( !isOpen )}
          style={gift.status === GiftStatus.CREATED ? [ styles.dashedContainer, {
            // position: isOpen ? 'absolute': 'relative'
          } ] : [ styles.dashedContainer, {
            borderColor: Colors.white,
            shadowOpacity: isOpen ? 1 : 0,
          } ]}>
          <View style={gift.status === GiftStatus.CREATED ? styles.dashedStyle : styles.normalStyle}>

            <View style={{
              marginHorizontal: wp( 1 ), flexDirection: 'row', justifyContent: 'space-between',
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
              }}>
                at {moment( gift.timestamps.created ).format( 'lll' )}
              </Text>
            </View>
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: hp( 1 )
            }}>
              <View style={{
                flexDirection: 'row',
              }}>
                {avatar && walletName && contactDetails ?
                  <View style={styles.avatarContainer}>
                    <RecipientAvatar recipient={contactDetails} contentContainerStyle={styles.avatarImage} />
                  </View>
                  :
                  <CheckingAcc />
                }
                <View style={{
                  marginLeft: wp( 1 ),
                  alignSelf: 'center'
                }}>
                  <Text style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue( 11 ),
                    fontFamily: Fonts.FiraSansRegular,
                    fontWeight: '600'
                  }}>
                    {walletName ? walletName : 'Checking Account'}
                  </Text>
                  {/* <Text style={styles.subText}>
                    {walletName ?? 'Lorem ipsum dolor'}
                  </Text> */}
                </View>

              </View>
              <View style={{
                flexDirection: 'row', alignItems: 'center'
              }}>


                <Text style={{
                  color: Colors.black,
                  fontSize: RFValue( 18 ),
                  fontFamily: Fonts.FiraSansRegular, marginHorizontal: wp( 2 )
                }}>
                  {numberWithCommas( gift.amount )}
                  <Text style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.FiraSansRegular
                  }}> sats
                  </Text>
                </Text>
                {gift.status !== GiftStatus.CREATED ?
                  isOpen ? <ArrowUp /> : <ArrowDown /> : null}
              </View>
            </View>
          </View>
          {isOpen && gift.status !== GiftStatus.CREATED && gift?.deepLinkConfig?.encryptionType === 'OTP' &&
            <View style={{
              marginHorizontal: wp( 1 )
            }}>
              <Text style={{
                color: Colors.lightTextColor,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.FiraSansRegular,
                fontWeight: '600',
              }}>
                Share OTP with contact
              </Text>
              <View style={{
                flexDirection: 'row', marginLeft: wp( 3 ), marginVertical: hp( 2 )
              }}>
                {gift?.deepLinkConfig?.encryptionKey.split( '' ).map( ( num, index ) => {
                  return (
                    <View
                      key={index}
                      style={{

                        alignItems: 'center', backgroundColor: Colors.backgroundColor, marginHorizontal: wp( 1 ), borderRadius: wp( 2 )
                      }}>
                      <Text style={{
                        marginHorizontal: wp( 4 ), marginVertical: wp( 3 )
                      }}>{num}</Text>
                    </View>
                  )
                } )}
              </View>
            </View>
          }
          {isOpen && gift.status !== GiftStatus.CREATED && gift.note !== '' &&
            <View style={{
              marginHorizontal: wp( 1 ),
            }}>
              <Text style={{
                color: Colors.lightTextColor,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.FiraSansRegular,
                fontWeight: '600'
              }}>
                Message to recipient
              </Text>
              <View
                style={{
                  marginLeft: wp( 3 ), marginVertical: hp( 2 ),
                  alignItems: 'center', backgroundColor: Colors.backgroundColor, marginHorizontal: wp( 2 ), borderRadius: wp( 2 ), marginRight: wp( 9 )
                }}>
                <Text style={{
                  marginHorizontal: wp( 3 ), marginVertical: wp( 2 ), color: Colors.textColorGrey,
                  fontSize: RFValue( 10 ),
                  letterSpacing: 0.5,
                  fontFamily: Fonts.FiraSansRegular,
                }}>{gift.note}</Text>
              </View>

            </View>
          }
        </TouchableOpacity>
        <View style={{
          marginVertical: hp( 2 )
        }}>
          {Object.entries( gift.timestamps ?? {
          } ).reverse().map( ( item, index ) => {
            return(
              <View key={index} style={styles.timeInfo}>
                <View style={{
                  flexDirection: 'row',
                }}>
                  <View style={styles.dot} />
                  <Text style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.FiraSansRegular,
                    fontWeight: '600'
                  }}>

                    {moment( item[ 1 ] ).format( 'lll' )}
                  </Text>
                </View>
                <View style={{
                  flexDirection: 'row', alignItems: 'flex-start'
                }}>
                  <View style={styles.line} />
                  <View style={[ styles.normalStyle, {
                    width: wp( '80%' ), borderRadius: wp( 2 ), paddingVertical: hp( 1 ), marginTop: hp( 1 )
                  } ]}>
                    <Text style={[ styles.modalInfoText, {
                      marginBottom: hp( 1 )
                    } ]}>
                      Gift Card {item[ 0 ]}
                    </Text>
                    {/* <Text style={styles.subText}>Lorem ipsum dolor sit amet</Text> */}
                  </View>
                </View>


              </View>
            )
          } )}

        </View>
      </SafeAreaView>

      {gift.status === GiftStatus.SENT ?
        (
          <View style={{
            ...styles.keeperViewStyle
          }}><TouchableOpacity
              style={{
                ...styles.bottomButton,
              }}
              onPress={() => {
                dispatch( reclaimGift( gift.id ) )
                navigation.goBack()
              }}
            >
              <Text style={[ styles.buttonText, {
              } ]}>Reclaim Gift Card</Text>
              {/* <Text style={styles.buttonSubText}>Lorem ipsum dolor sit amet</Text> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...styles.bottomButton,
              }}
              onPress={() => {
              }}
            >
              <Text style={[ styles.buttonText, {
              } ]}>Send Reminder</Text>
              {/* <Text style={styles.buttonSubText}>Lorem ipsum dolor sit amet</Text> */}
            </TouchableOpacity>
          </View>
        ) : null}
      {gift.status === GiftStatus.CREATED || gift.status === GiftStatus.RECLAIMED ?
        (
          <View style={{
            ...styles.keeperViewStyle
          }}><TouchableOpacity
              style={{
                ...styles.bottomButton,
              }}
              onPress={() => {
              // dispatch( reclaimGift( gift.id ) )
                navigation.navigate( 'EnterGiftDetails', {
                  giftId: ( gift as Gift ).id,
                } )
              }}
            >
              <Text style={[ styles.buttonText, {
              } ]}>Send Gift Card</Text>
              {/* <Text style={styles.buttonSubText}>Lorem ipsum dolor sit amet</Text> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...styles.bottomButton,
              }}
              onPress={() => {
              }}
            >
              <Text style={[ styles.buttonText, {
              } ]}>Expire Gift Card</Text>
              {/* <Text style={styles.buttonSubText}>Lorem ipsum dolor sit amet</Text> */}
            </TouchableOpacity>
          </View>
        ) : null}
      {gift.status === GiftStatus.ACCEPTED ?
        (
          <View style={{
            ...styles.keeperViewStyle
          }}><TouchableOpacity
              style={{
                ...styles.bottomButton,
              }}
              onPress={() => {
              // dispatch( reclaimGift( gift.id ) )
                navigation.navigate( 'EnterGiftDetails', {
                  giftId: ( gift as Gift ).id,
                } )
              }}
            >
              <Text style={[ styles.buttonText, {
              } ]}>Send Gift Card</Text>
              {/* <Text style={styles.buttonSubText}>Lorem ipsum dolor sit amet</Text> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...styles.bottomButton,
              }}
              onPress={() => {setAcceptGiftModal( true )
              }}
            >
              <Text style={[ styles.buttonText, {
              } ]}>Add To Account</Text>
              {/* <Text style={styles.buttonSubText}>Lorem ipsum dolor sit amet</Text> */}
            </TouchableOpacity>
          </View>
        ) : null}
      <ModalContainer visible={acceptGift} closeBottomSheet={() => {}} >
        <View style={styles.modalContentContainer}>
          <AccountSelection
            onClose={( ) => {setAcceptGiftModal( false )}}
            onChangeType={( type ) => {
              setAcceptGiftModal( false )
              setTimeout( () => {
                Alert.alert(
                  '',
                  `Are you sure you want to add gift to your ${type} account?`,
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log( 'Cancel Pressed' ),
                      style: 'cancel'
                    },
                    {
                      text: 'YES', onPress: () => console.log( 'OK Pressed' )
                    }
                  ],
                )
              }, 500 )
            }}
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
    backgroundColor: Colors.lightTextColor,
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
      width: 10, height: 10
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
    height: wp( '18%' ),
    width: wp( '45%' ),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.borderColor,
    alignSelf: 'center',
  },
  buttonSubText: {
    marginTop: hp( 0.4 ),
    color: Colors.white,
    fontSize: RFValue( 11 ),
    letterSpacing: 0.5,
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    width: wp( '46%' )
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
    width: wp( '46%' ),
    textAlign: 'center'
  },
  keeperViewStyle: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundColor,
    paddingHorizontal: wp( '4%' ),
    justifyContent: 'space-between',
    height: wp( '30' ),
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
    marginRight: wp( 10 )
  },
  modalContentContainer: {
    backgroundColor: Colors.backgroundColor,
    paddingBottom: hp( 4 ),
  },
  viewContainer: {
    flex: 1,
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
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    marginLeft: wp( 2 )
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
      width: 15, height: 15
    },
    backgroundColor: Colors.lightBlue,
    marginLeft: wp( 2 )
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
      width: 1, height: 1
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
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: Colors.white,
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 10, height: 10
    },
    backgroundColor: Colors.white,
  },
  accImage: {
    marginRight: wp( 4 )
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
    fontFamily: Fonts.FiraSansMedium
  },
  selectedContactsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.blue,
    borderRadius: wp( 2 ),
    height: hp( 4 ),
    paddingHorizontal: wp( 2 )
  },
  contactText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
} )

export default GiftDetails
