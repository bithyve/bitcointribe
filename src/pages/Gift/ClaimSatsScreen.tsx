import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import { Account, AccountType } from '../../bitcoin/utilities/Interface'
import { giftAccepted, giftCreationSuccess, refreshAccountShells } from '../../store/actions/accounts'

import axios from 'axios'
import { CKTapCard } from 'cktap-protocol-react-native'
import idx from 'idx'
import { RFValue } from 'react-native-responsive-fontsize'
import { Shadow } from 'react-native-shadow-2'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import wif from 'wif'
import CheckMark from '../../assets/images/svgs/checkmark.svg'
import Colors from '../../common/Colors'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import AccountShell from '../../common/data/models/AccountShell'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import { UsNumberFormat } from '../../common/utilities'
import AlertModalContents from '../../components/AlertModalContents'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import ModalContainer from '../../components/home/ModalContainer'
import { resetStackToAccountDetails } from '../../navigation/actions/NavigationActions'
import { updateSatCardAccount } from '../../store/actions/satCardAccount'
import { AccountsState } from '../../store/reducers/accounts'
import getAvatarForSubAccount from '../../utils/accounts/GetAvatarForSubAccountKind'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useActiveAccountShells from '../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import GiftUnwrappedComponent from './GiftUnwrappedComponent'
import NfcPrompt from './NfcPromptAndroid'

const { height, } = Dimensions.get( 'window' )


const ClaimSatsScreen = ( { navigation } ) => {
  const dispatch = useDispatch()
  const activeAccounts = useActiveAccountShells().filter( shell => shell?.primarySubAccount.type !== AccountType.LIGHTNING_ACCOUNT )
  const currencyKind: CurrencyKind = useSelector( state => state.preferences.giftCurrencyKind || CurrencyKind.BITCOIN )
  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )
  const fiatCurrencyCode = useCurrencyCode()
  const accountsState: AccountsState = useSelector( state => state.accounts )
  const currencyCode = useSelector( state => state.preferences.currencyCode )
  const [ showKeyboard, setKeyboard ] = useState( false )
  const [ numbersOfGift, setNumbersOfGift ] = useState( 1 )
  const [ initGiftCreation, setInitGiftCreation ] = useState( false )
  const accountState: AccountsState = useSelector( ( state ) => idx( state, ( _ ) => _.accounts ) )
  const giftCreationStatus = useSelector( state => state.accounts.giftCreationStatus )
  const accountShells: AccountShell[] = accountState.accountShells
  const [ showLoader, setShowLoader ] = useState( false )
  const [ accountListModal, setAccountListModal ] = useState( false )
  const [ advanceModal, setAdvanceModal ] = useState( false )
  const defaultGiftAccount = accountShells.find( shell => shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT && shell.primarySubAccount.instanceNumber === 0 )
  const [ selectedAccount, setSelectedAccount ]: [AccountShell, any] = useState( defaultGiftAccount )
  const account: Account = accountState.accounts[ selectedAccount.primarySubAccount.id ]
  const [ showErrorLoader, setShowErrorLoader ] = useState( false )
  const [ spendCode, setSpendCode ] = useState( '' )
  const [ isExclusive, setIsExclusive ] = useState( true )
  const [ showGiftModal, setShowGiftModal ] = useState( false )
  const [ showGiftFailureModal, setShowGiftFailureModal ] = useState( false )
  const [ showNFCModal, setNFCModal ] = useState( false )
  const [ showAlertModal, setShowAlertModal ] = useState( false )
  const [ errorMessage, setErrorMessage ] = useState( '' )

  const card = useRef( new CKTapCard() ).current

  const [ accType, setAccType ] = useState( AccountType.CHECKING_ACCOUNT )
  const sendingAccount = accountShells.find( shell => shell.primarySubAccount.type == accType && shell.primarySubAccount.instanceNumber === 0 )

  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sendingAccount )

  useEffect( () => {
    if ( accountsState.selectedGiftId && initGiftCreation && giftCreationStatus ) {
      const createdGift = accountsState.gifts ? accountsState.gifts[ accountsState.selectedGiftId ] : null
      if ( createdGift ) {
        // setCreatedGift( createdGift )
        // setGiftModal( true )
        setInitGiftCreation( false )
        setShowLoader( false )
        setShowErrorLoader( false )
        dispatch( giftCreationSuccess( null ) )
      }
    }
  }, [ accountsState.selectedGiftId, initGiftCreation, giftCreationStatus ] )

  useEffect( () => {
    setInitGiftCreation( false )
    setShowLoader( false )
    if ( giftCreationStatus ) {
      dispatch( giftCreationSuccess( null ) )
    } else if ( giftCreationStatus === false ) {
      // failed to create gift
      setShowLoader( false )
      setShowErrorLoader( true )
      dispatch( giftCreationSuccess( null )
      )
    }
  }, [ giftCreationStatus ] )

  const withModal = async ( callback ) => {
    try {
      setNFCModal( true )
      const resp = await card.nfcWrapper( callback )
      await card.endNfcSession()
      setNFCModal( false )
      return {
        response: resp, error: null
      }
    } catch ( error: any ) {
      setNFCModal( false )
      setErrorMessage( error.toString() )
      setShowAlertModal( true )
      return {
        response: null, error: error.toString()
      }

    }
  }
  const claimGifts = async() => {
    // For Claim Flow
    const status = await card.first_look()
    const { addr: address } = await card.address( true, false, status.active_slot )
    const { data } = await axios.get( `https://api.blockcypher.com/v1/btc/main/addrs/${address}` )
    const { balance, unconfirmed_balance } = data
    if( unconfirmed_balance >0 ){
      Alert.alert( 'Your gift is still being confirmed. Please wait for a while to claim' )
      return
    }
    if ( balance > 0 ) {
      // get the cvc from user
      // 'SEALED' or 'UNSEALED' or 'UNUSED'
      const activeSlotUsage = await card.get_slot_usage( status.active_slot )
      let privKey
      if ( activeSlotUsage.status === 'SEALED' ) {
        // ideal case
        const { pk } = await card.unseal_slot( spendCode )
        privKey = pk
      } else if( activeSlotUsage.status === 'UNSEALED' ){
        // will never get into this case (should have raised before)
        privKey = await card.get_privkey( spendCode, status.active_slot )
      }else{
        Alert.alert( 'Please setup the slot before use' )
        return
      }
      privKey = wif.encode( 128, privKey, true )
      // with this key move all the funds from the slot to checking account (rnd)
      dispatch( updateSatCardAccount( sourcePrimarySubAccount.id, privKey, address, selectedAccount ) )
      // For setup slot for next user
      // DO NOT RUN card.setup UNTIL THE FLOW WORKS COMPLETELY
      await card.first_look( )
      const setUpSlot = await card.setup( spendCode, undefined, true )
    }else{
      Alert.alert( 'Sorry this slot has no funds or the funds are yet to be confirmed' )
      return
    }
  }

  function onPressNumber( text ) {
    if ( spendCode && text == 'x' ) {
      setSpendCode( spendCode.slice( 0, -1 ) )
    }
    if( spendCode.length > 7 ) return

    let tmpPasscode = spendCode
    if ( text != 'x' ) {
      tmpPasscode += text
      setSpendCode( tmpPasscode )
    }
    // if ( isSendMax ) setIsSendMax( false )
  }

  const renderAccountList = () => {
    return <ScrollView style={{
      height: 'auto'
    }}>
      {activeAccounts.map( ( item, index ) => {
        if ( [ AccountType.TEST_ACCOUNT, AccountType.SWAN_ACCOUNT ].includes( item.primarySubAccount.type ) || !item.primarySubAccount.isUsable || item.primarySubAccount.isTFAEnabled ) return
        return (
          <View key={index} style={{
            backgroundColor: Colors.white
          }}>
            {accountElement( item, () => {
              setSelectedAccount( item )
              setAccountListModal( false )
            } )}
          </View>
        )
      } )}
    </ScrollView>
  }

  const AdvanceGiftOptions = ( { title, stateToUpdate, imageToShow } ) => {
    const [ timer, SetTimer ] = useState( null )
    const [ counter, SetCounter ] = useState( numbersOfGift )
    const [ timeLock, setTimeLock ] = useState( 1 )
    const [ limitedValidity, setLimitedValidity ] = useState( 1 )

    let flag = null

    const handleTimer = () => {
      flag == true ? plus() : flag == false && minus()
      flag !== null && SetTimer( () => setTimeout( () => handleTimer(), 500 ) )
    }
    const stopTimer = () => {
      flag = null
      SetTimer( null )
      clearTimeout( timer )
      setNumbersOfGift( counter )
    }

    const plus = () => {
      if ( stateToUpdate == 'gift' ) {
        SetCounter( ( prev ) => prev + 1 )
      } else if ( stateToUpdate == 'timeLock' ) {
        setTimeLock( timeLock + 1 )
      } else if ( stateToUpdate == 'limitedValidity' ) {
        setLimitedValidity( limitedValidity + 1 )
      }
    }

    const minus = () => {
      if ( stateToUpdate == 'gift' ) {
        if ( counter > 1 ) SetCounter( ( prev ) => prev - 1 )
      } else if ( stateToUpdate == 'timeLock' ) {
        if ( timeLock > 1 ) setTimeLock( timeLock - 1 )
      } else if ( stateToUpdate == 'limitedValidity' ) {
        if ( limitedValidity > 1 ) setLimitedValidity( limitedValidity - 1 )
      }
    }

    return (
      <View>
        <View style={{
          flexDirection: 'row',
          marginTop: wp( '5%' ), marginBottom: wp( '5%' ), justifyContent: 'center',
        }}>
          <Image source={imageToShow} style={{
            width: wp( '10%' ), height: wp( '6%' ), resizeMode: 'contain', alignSelf: 'center',
          }} />
          <View style={{
            marginLeft: wp( '4%' ),
            flex: 1,
            marginRight: wp( '2%' )
          }}>
            <Text style={{
              color: Colors.blue, fontSize: RFValue( 13 ), fontFamily: Fonts.Regular
            }}>{title}</Text>
            <Text style={{
              color: Colors.gray3, fontSize: RFValue( 11 ), fontFamily: Fonts.Regular
            }}>Gift Sats created will be of the
              <Text style={{
                fontWeight: 'bold', fontFamily: Fonts.Italic
              }}>{' '}same amount</Text>
              {' '}and can be
              <Text style={{
                fontWeight: 'bold', fontFamily: Fonts.Italic
              }}>{' '}sent separately</Text></Text>
          </View>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
          }}>
            <TouchableOpacity onPressIn={() => { flag = false; handleTimer() }} onPressOut={() => stopTimer()} style={{
              width: wp( '5%' ), height: wp( '5%' ), borderRadius: wp( '5%' ) / 2, backgroundColor: Colors.lightBlue, justifyContent: 'center', alignItems: 'center', marginRight: wp( '4%' )
            }}>
              <AntDesign name="minus"
                size={12}
                color={Colors.white} />
            </TouchableOpacity>
            <View style={{
              height: wp( '12%' ), width: wp( '12%' ), borderRadius: 10, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.borderColor, shadowOpacity: 0.6, shadowOffset: {
                width: 7, height: 7
              }, shadowRadius: 5, elevation: 5
            }}><Text style={{
                color: Colors.black, fontFamily: Fonts.Regular, fontSize: RFValue( 18 )
              }}>{stateToUpdate == 'gift'
                  ? counter :
                  stateToUpdate == 'timeLock' ?
                    timeLock :
                    limitedValidity
                }</Text>
            </View>
            <TouchableOpacity onPressIn={() => { flag = true; handleTimer() }} onPressOut={() => stopTimer()} style={{
              width: wp( '5%' ), height: wp( '5%' ), borderRadius: wp( '5%' ) / 2, backgroundColor: Colors.lightBlue, justifyContent: 'center', alignItems: 'center', marginLeft: wp( '4%' )
            }}>
              <AntDesign name="plus"
                size={12}
                color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setIsExclusive( !isExclusive )}
          style={{
            flexDirection: 'row',
            marginVertical: 7,
          }}
        >

          <View style={styles.imageView}>
            {isExclusive &&
              <CheckMark style={{
                marginLeft: 6,
                marginTop: 6
              }} />
            }
          </View>
          <Text style={{
            color: Colors.textColorGrey,
            fontSize: RFValue( 13 ),
            fontFamily: Fonts.Regular,
            marginHorizontal: wp( 3 )
          }}>
            <Text>
              {'Make each gift exclusive\n'}
            </Text>
            <Text style={{
              fontSize: RFValue( 11 ),
            }}>
              (Restricts the gift to <Text style={{
                fontWeight: 'bold', fontFamily: Fonts.Italic
              }}>one per Bitcoin Tribe app</Text> )
            </Text>
          </Text>

        </TouchableOpacity>
      </View>
    )
  }

  const renderAdvanceModal = () => {
    return <View style={{
      backgroundColor: Colors.bgColor, padding: wp( '5%' ),
    }}>
      <View style={{
        flexDirection: 'row',
      }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setAdvanceModal( false )}
          style={styles.modalCrossButton}
        >
          <FontAwesome name="close" color={Colors.white} size={19} />
        </TouchableOpacity>
      </View>

      <View style={{
        flexDirection: 'column'
      }}>
        <Text style={{
          color: Colors.blue, fontSize: RFValue( 20 ), fontFamily: Fonts.Regular
        }}>Create Multiple Gift Sats</Text>
        {/* <Text style={{
          color: Colors.gray3, fontSize: RFValue( 12 ), fontFamily: Fonts.Regular
        }}>Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit</Text> */}
      </View>
      <AdvanceGiftOptions
        title={'No. of Gifts'}
        // infoText={'Gift Sats created will be of the same amount and can be sent separately'}
        stateToUpdate={'gift'}
        imageToShow={require( '../../assets/images/icons/gift.png' )}
      />
    </View>
  }

  const accountElement = (
    item,
    onPressCallBack,
    activeOpacity = 0,
    width = '90%',
    message = `${currencyKind === CurrencyKind.BITCOIN ? 'Sats' : 'Money'} would be transferred to`,
  ) => {
    return (
      <TouchableOpacity
        style={{
          ...styles.accountSelectionView, width: width,
        }}
        onPress={() => onPressCallBack()}
        activeOpacity={activeOpacity}
      >
        <View style={{
          borderRadius: wp( 2 ),
        }}>
          <View style={{
            flexDirection: 'row',
            width: '100%',
            paddingVertical: hp( 2 ),
            paddingHorizontal: wp( 2 ),
            alignItems: 'center'
          }}>
            <View style={{
              width: wp( 13 ),
              height: '100%',
              marginTop: hp( 0.5 ),
            }} >
              {getAvatarForSubAccount( item.primarySubAccount, false, true )}
            </View>
            <View style={{
              marginHorizontal: wp( 3 ),
              flex: 1
            }}>
              <Text style={{
                color: Colors.gray4,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.Regular,
              }}>
                {message}
              </Text>
              <Text
                style={{
                  color: Colors.black,
                  fontSize: RFValue( 14 ),
                  fontFamily: Fonts.Regular,
                  marginVertical: RFValue( 4 )

                }}
              >
                {item.primarySubAccount.customDisplayName ?? item.primarySubAccount.defaultTitle}
              </Text>
              <Text style={styles.availableToSpendText}>
                {'Available to spend: '}
                <Text style={styles.balanceText}>
                  {prefersBitcoin
                    ? UsNumberFormat( item.primarySubAccount?.balances?.confirmed )
                    : accountsState.exchangeRates && accountsState.exchangeRates[ currencyCode ]
                      ? (
                        ( item.primarySubAccount?.balances?.confirmed / SATOSHIS_IN_BTC ) *
                        accountsState.exchangeRates[ currencyCode ].last
                      ).toFixed( 2 )
                      : 0}
                </Text>
                <Text>
                  {prefersBitcoin ? ' sats' : ` ${fiatCurrencyCode}`}
                </Text>
              </Text>
            </View>
            {activeOpacity === 0 && <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="gray"
              style={{
                alignSelf: 'center'
              }}
            />}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderButton = () => {
    return(
      <View
        style={{
          height: hp( '12%' ),
          flexDirection: 'row',
          marginTop: RFValue( 38 ),
          marginEnd: RFValue( 20 )
        }}
      >
        <Shadow viewStyle={{
          ...styles.successModalButtonView,
          backgroundColor: spendCode == '' ?Colors.lightBlue: Colors.blue
        }} distance={2}
        startColor={Colors.shadowBlue}
        offset={[ 42, 14 ]}>
          <AppBottomSheetTouchableWrapper
            disabled={spendCode == ''}
            onPress={() => onClaimSatsClick()}
            style={{
            // ...styles.successModalButtonView,
              shadowColor: Colors.shadowBlue,
            }}
            delayPressIn={0}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.white,
              }}
            >
              {'Claim sats'}
            </Text>
          </AppBottomSheetTouchableWrapper>
        </Shadow>
        <TouchableOpacity style={{
          height: wp( '12%' ), paddingHorizontal: RFValue( 20 ), marginStart:RFValue( 20 ),
          justifyContent:'center', alignItems:'center',
        // backgroundColor:'red'
        }} onPress={onCancelClick}>
          <Text style={{
            fontSize:RFValue( 13 ), color:Colors.blue, fontFamily:Fonts.Medium
          }}>{'Cancel'}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const onCancelClick = () => {
    navigation.goBack()
  }

  const onClaimSatsClick = async () => {
    const { response, error } = await withModal( claimGifts )
    if( error ){
      setShowGiftFailureModal( true )
      return
    }
    setShowGiftModal( true )
  }

  const onGiftFailureClose = () => {
    setShowGiftFailureModal( false )
  }

  const onGiftFailureClick = () => {
    setShowGiftFailureModal( false )
  }
  const onGiftClose = () => {
    setShowGiftModal( false )
  }

  const onGiftSuccessClick = () => {
    setShowGiftModal( false )
    dispatch( giftAccepted( '' ) )
    // closeModal()
    navigation.dispatch(
      resetStackToAccountDetails( {
        accountShellID: sourcePrimarySubAccount.accountShellID,
      } )
    )
    dispatch( refreshAccountShells( [ sendingAccount ], {
      hardRefresh: true
    } ) )
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1
      }}
      keyboardShouldPersistTaps='handled'
    >
      <SafeAreaView style={styles.viewContainer}>
        <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
        <View style={[ CommonStyles.headerContainer, {
          backgroundColor: Colors.backgroundColor,
          marginRight: wp( 4 ),
          marginVertical: height < 720 ? wp( 0 ) : 'auto'
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
        </View>
        <Text style={{
          color: Colors.blue,
          fontSize: height < 720 ? RFValue( 20 ) : RFValue( 24 ),
          letterSpacing: 0.01,
          marginLeft: 20,
          fontFamily: Fonts.Regular
        }} >
          {'Claim Sats'}
        </Text>
        <Text style={{
          color: Colors.textColorGrey,
          fontSize: RFValue( 12 ),
          letterSpacing: 0.6,
          marginHorizontal: 20,
          fontFamily: Fonts.Regular,
          marginTop: 16
        }} >
          {'Note that this transfers the available sats in the card to your Checking Account'}
        </Text>
        {accountElement( selectedAccount, () => setAccountListModal( !accountListModal ) )}
        <Text style={{
          fontFamily:Fonts.Regular, fontSize: RFValue( 12 ),
          letterSpacing: 0.48, color: Colors.gray13,
          marginTop: RFValue( 10 ), marginStart:20
        }}>
          {'Enter the '}
          <Text style={{
            fontFamily: Fonts.SemiBold, fontStyle: 'italic'
          }}>{'Spend Code'}</Text>
        </Text>
        <Shadow viewStyle={{
          ...styles.shadowModalInput,
          // backgroundColor: Colors.white,
        }} distance={2}
        startColor={Colors.shadowColor}
        offset={[ 22, 20 ]}>
          <Text style={[ styles.modalInputBox, {
            color: spendCode !== '' ? Colors.textColorGrey : Colors.gray1,
          } ]} onPress={() => setKeyboard( true )}>
            {/* {currencyKind == CurrencyKind.FIAT ? spendCode : UsNumberFormat( spendCode ) === '0' ? '' : UsNumberFormat( spendCode )} */}
            {spendCode}
            {( !showKeyboard && !spendCode ) &&
              <Text style={{
                fontSize: RFValue( 12 )
              }}>
                {'Enter the Spend Code'}
              </Text>
            }
            {( showKeyboard ) && <Text style={{
              color: Colors.lightBlue, fontSize: RFValue( 18 ),
            }}>|</Text>}
          </Text>
        </Shadow>
        {renderButton()}
        {showKeyboard &&
          <View style={{
            marginTop: 'auto'
          }}>
            <View style={styles.keyPadRow}>
              <TouchableOpacity
                onPress={() => onPressNumber( '1' )}
                style={styles.keyPadElementTouchable}
              >
                <Text
                  style={styles.keyPadElementText}
                  onPress={() => onPressNumber( '1' )}
                >
                  1
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onPressNumber( '2' )}
                style={styles.keyPadElementTouchable}
              >
                <Text
                  style={styles.keyPadElementText}
                  onPress={() => onPressNumber( '2' )}
                >
                  2
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onPressNumber( '3' )}
                style={styles.keyPadElementTouchable}
              >
                <Text
                  style={styles.keyPadElementText}
                  onPress={() => onPressNumber( '3' )}
                >
                  3
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keyPadRow}>
              <TouchableOpacity
                onPress={() => onPressNumber( '4' )}
                style={styles.keyPadElementTouchable}
              >
                <Text
                  style={styles.keyPadElementText}
                  onPress={() => onPressNumber( '4' )}
                >
                  4
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onPressNumber( '5' )}
                style={styles.keyPadElementTouchable}
              >
                <Text
                  style={styles.keyPadElementText}
                  onPress={() => onPressNumber( '5' )}
                >
                  5
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onPressNumber( '6' )}
                style={styles.keyPadElementTouchable}
              >
                <Text
                  style={styles.keyPadElementText}
                  onPress={() => onPressNumber( '6' )}
                >
                  6
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keyPadRow}>
              <TouchableOpacity
                onPress={() => onPressNumber( '7' )}
                style={styles.keyPadElementTouchable}
              >
                <Text
                  style={styles.keyPadElementText}
                  onPress={() => onPressNumber( '7' )}
                >
                  7
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onPressNumber( '8' )}
                style={styles.keyPadElementTouchable}
              >
                <Text
                  style={styles.keyPadElementText}
                  onPress={() => onPressNumber( '8' )}
                >
                  8
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onPressNumber( '9' )}
                style={styles.keyPadElementTouchable}
              >
                <Text
                  style={styles.keyPadElementText}
                  onPress={() => onPressNumber( '9' )}
                >
                  9
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keyPadRow}>
              <View style={styles.keyPadElementTouchable}>
                <Text style={{
                  flex: 1, padding: 15
                }}></Text>
              </View>
              <TouchableOpacity
                onPress={() => onPressNumber( '0' )}
                style={styles.keyPadElementTouchable}
              >
                <Text
                  style={styles.keyPadElementText}
                  onPress={() => onPressNumber( '0' )}
                >
                  0
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onPressNumber( 'x' )}
                style={styles.keyPadElementTouchable}
              >
                <Text
                  style={styles.keyPadElementText}
                  onPress={() => onPressNumber( 'x' )}
                >
                  <Ionicons
                    name="ios-backspace"
                    size={30}
                    color={Colors.blue}
                  />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      </SafeAreaView>
      <NfcPrompt visible={showNFCModal} close={()=> setNFCModal( false )}/>
      <ModalContainer onBackground={() => { setShowAlertModal( false ) }} visible={showAlertModal} closeBottomSheet={() => { }}>
        <AlertModalContents
          info={errorMessage != '' ? errorMessage : 'SatCards not detected'}
          proceedButtonText={'Please try again'}
          onPressProceed={() => {
            setShowAlertModal( false )
            navigation.goBack()
          }}
          isBottomImage={true}
          bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
      <ModalContainer onBackground={() => setAccountListModal( false )} visible={accountListModal} closeBottomSheet={() => setAccountListModal( false )}>
        {renderAccountList()}
      </ModalContainer>
      <ModalContainer onBackground={() => setAdvanceModal( false )} visible={advanceModal} closeBottomSheet={() => setAdvanceModal( false )}>
        {renderAdvanceModal()}
      </ModalContainer>
      <ModalContainer onBackground={onGiftClose} visible={showGiftModal} closeBottomSheet={onGiftClose}  >
        <GiftUnwrappedComponent
          selectedAccount={selectedAccount}
          currencyKind={currencyKind}
          prefersBitcoin={prefersBitcoin}
          title={'Your Gift is unwrapped'}
          info={'Gifts sats received!'}
          // infoSelected={'Checking Account.'}
          // info2={'Your checking account balance is '}
          // info2Selected={'100,000 sats'}
          proceedButtonText={'View Account'}
          onCloseClick={onGiftClose}
          onPressProceed={onGiftSuccessClick}
          closeModal
          isBottomImage
          showAccountDetail
        />
      </ModalContainer>

      <ModalContainer onBackground={onGiftFailureClose} visible={showGiftFailureModal} closeBottomSheet={onGiftFailureClose}  >
        <GiftUnwrappedComponent
          title={'Claim Unsuccessful'}
          info={'Sats were not transferred from your\nSATSCARD™. Please try again.'}
          proceedButtonText={'Try again'}
          onPressIgnore={onGiftFailureClose}
          onPressProceed={onGiftFailureClick}
          isIgnoreButton
          cancelButtonText={'Back'}
          closeModal
          isBottomImage
          bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
    </ScrollView>
  )
}

const styles = StyleSheet.create( {
  keyPadRow: {
    flexDirection: 'row',
    height: hp( '8%' ),
  },
  errorText: {
    fontFamily: Fonts.MediumItalic,
    color: Colors.red,
    fontSize: RFValue( 11, 812 ),
    fontStyle: 'italic',
  },
  keyPadElementTouchable: {
    flex: 1,
    height: hp( '8%' ),
    fontSize: RFValue( 18 ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPadElementText: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    fontFamily: Fonts.Regular,
    fontStyle: 'normal',
  },
  cardBitCoinImage: {
    width: wp( '3.5%' ),
    height: wp( '3.5%' ),
    marginRight: 5,
    resizeMode: 'contain',
    // marginBottom: wp( '0.7%' ),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Regular,
    letterSpacing: 0.54
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    marginRight: wp( 10 ),
    letterSpacing: 0.6,
    marginBottom: hp( 2 )
  },
  modalContentContainer: {
    backgroundColor: Colors.backgroundColor,
    paddingBottom: hp( 4 ),
  },
  viewContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  buttonView: {
    height: wp( '12%' ),
    width: wp( '27%' ),
    paddingHorizontal: wp( 2 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
  },
  disabledButtonView: {
    height: wp( '12%' ),
    width: wp( '27%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.lightBlue,
  },
  imageView: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 1, height: 1
    },
  },
  shadowModalInput:{
    height: 50,
    width: '80%',
    borderRadius: 10,
    backgroundColor: Colors.white,
    marginTop: 12,
    elevation:5,
    marginHorizontal: 20,
    // backgroundColor:'red',
    justifyContent: 'center',
    // alignItems:'center'
  },
  modalInputBox: {
    // flex: 1,
    // height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    paddingLeft: 15,
    borderRadius: 10,
    // justifyContent: 'center',
    // alignItems:'center',
    // textAlignVertical:'center',
    // textAlign:'center',
    // backgroundColor:'red',
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    backgroundColor: Colors.white
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
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
    fontFamily: Fonts.Italic,
    lineHeight: 15,
  },
  balanceText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Italic,
  },
  proceedButtonText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium
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
    fontFamily: Fonts.Regular,
    color: Colors.white,
  },
  accountSelectionView: {
    width: '90%',
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 10,
    elevation: 2,
    alignSelf: 'center',
    marginTop: hp( 2 ),
    marginBottom: hp( 2 ),
    backgroundColor:Colors.white,
    borderRadius:10
  },
  modalCrossButton: {
    width: wp( 7 ),
    height: wp( 7 ),
    borderRadius: wp( 7 / 2 ),
    backgroundColor: Colors.CLOSE_ICON_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto'
  },
  homeHeaderAmountText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 20 ),
    marginRight: 5,
    color: Colors.black,
  },
  homeHeaderAmountUnitText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 11 ),
    // marginBottom: 3,
    color: Colors.gray2,
    marginTop: hp( 0.7 )
  },
  successModalButtonView: {
    height: wp( '12%' ),
    minWidth: wp( '22%' ),
    paddingLeft: wp( '5%' ),
    paddingRight: wp( '5%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( '8%' ),
    marginBottom: hp( '3%' ),
  },
} )

export default ClaimSatsScreen

