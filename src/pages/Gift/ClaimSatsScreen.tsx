import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Dimensions,
  Switch,
  Keyboard
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import HeaderTitle from '../../components/HeaderTitle'
import CommonStyles from '../../common/Styles/Styles'
import CheckingAccount from '../../assets/images/accIcons/icon_checking.svg'
import Dollar from '../../assets/images/svgs/icon_dollar.svg'
import CheckMark from '../../assets/images/svgs/checkmark.svg'
import ModalContainer from '../../components/home/ModalContainer'
import GiftCard from '../../assets/images/svgs/gift_icon_new.svg'
import BottomInfoBox from '../../components/BottomInfoBox'
import Illustration from '../../assets/images/svgs/illustration.svg'
import { generateGifts, giftAccepted, giftCreationSuccess, refreshAccountShells } from '../../store/actions/accounts'
import { AccountsState } from '../../store/reducers/accounts'
import { Account, AccountType, Gift, TxPriority } from '../../bitcoin/utilities/Interface'
import idx from 'idx'
import useSpendableBalanceForAccountShell from '../../utils/hooks/account-utils/UseSpendableBalanceForAccountShell'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import AccountShell from '../../common/data/models/AccountShell'
import MaterialCurrencyCodeIcon, {
  materialIconCurrencyCodes,
} from '../../components/MaterialCurrencyCodeIcon'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  getCurrencyImageByRegion, processRequestQR,
} from '../../common/CommonFunctions/index'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind'
import { UsNumberFormat } from '../../common/utilities'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { translations } from '../../common/content/LocContext'
import FormStyles from '../../common/Styles/FormStyles'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { updateUserName } from '../../store/actions/storage'
import getAvatarForSubAccount from '../../utils/accounts/GetAvatarForSubAccountKind'
import Loader from '../../components/loader'
import useActiveAccountShells from '../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import LoaderModal from '../../components/LoaderModal'
import { calculateSendMaxFee } from '../../store/actions/sending'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import { Shadow } from 'react-native-shadow-2'
import VerifySatModalContents from './VerifySatModalContents'
import ClaimSatComponent from './ClaimSatComponent'
import GiftUnwrappedComponent from './GiftUnwrappedComponent'
import { CKTapCard } from 'cktap-protocol-react-native'
import { associateGift } from '../../store/actions/trustedContacts'
import { resetStackToAccountDetails } from '../../navigation/actions/NavigationActions'

const { height, } = Dimensions.get( 'window' )


const ClaimSatsScreen = ( { navigation } ) => {
  const dispatch = useDispatch()
  const activeAccounts = useActiveAccountShells().filter( shell => shell?.primarySubAccount.type !== AccountType.LIGHTNING_ACCOUNT )
  const currencyKind: CurrencyKind = useSelector( state => state.preferences.giftCurrencyKind || CurrencyKind.BITCOIN )
  const strings = translations[ 'accounts' ]
  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )
  const fiatCurrencyCode = useCurrencyCode()
  const accountsState: AccountsState = useSelector( state => state.accounts )
  const currencyCode = useSelector( state => state.preferences.currencyCode )
  const exchangeRates = useSelector( state => state.accounts.exchangeRates )
  const [ inputStyle, setInputStyle ] = useState( styles.inputBox )
  // const [ amount, setAmount ] = useState( '' )
  const [ showKeyboard, setKeyboard ] = useState( false )
  const [ numbersOfGift, setNumbersOfGift ] = useState( 1 )
  const [ initGiftCreation, setInitGiftCreation ] = useState( false )
  const [ includeFees, setFees ] = useState( false )
  const [ addfNf, setAddfNf ] = useState( false )
  const [ giftModal, setGiftModal ] = useState( false )
  const [ createdGift, setCreatedGift ] = useState( null )
  const accountState: AccountsState = useSelector( ( state ) => idx( state, ( _ ) => _.accounts ) )
  const giftCreationStatus = useSelector( state => state.accounts.giftCreationStatus )
  const sendMaxFee = useSelector( ( state ) => idx( state, ( _ ) => _.sending.sendMaxFee ) )
  const [ isSendMax, setIsSendMax ] = useState( false )
  const accountShells: AccountShell[] = accountState.accountShells
  const [ showLoader, setShowLoader ] = useState( false )
  const [ accountListModal, setAccountListModal ] = useState( false )
  const [ advanceModal, setAdvanceModal ] = useState( false )
  const defaultGiftAccount = accountShells.find( shell => shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT && shell.primarySubAccount.instanceNumber === 0 )
  const [ selectedAccount, setSelectedAccount ]: [AccountShell, any] = useState( defaultGiftAccount )
  const spendableBalance = useSpendableBalanceForAccountShell( selectedAccount )
  const account: Account = accountState.accounts[ selectedAccount.primarySubAccount.id ]
  const [ averageLowTxFee, setAverageLowTxFee ] = useState( 0 )
  const [ minimumGiftValue, setMinimumGiftValue ] = useState( 1000 )
  const [ showErrorLoader, setShowErrorLoader ] = useState( false )
  const [ spendCode, setSpendCode ] = useState( '' )
  const [ isExclusive, setIsExclusive ] = useState( true )
  const [ showGiftModal, setShowGiftModal ] = useState( false )
  const [ showGiftFailureModal, setShowGiftFailureModal ] = useState( false )
  const card = useRef( new CKTapCard() ).current

  const [ accType, setAccType ] = useState( AccountType.CHECKING_ACCOUNT )
  const sendingAccount = accountShells.find( shell => shell.primarySubAccount.type == accType && shell.primarySubAccount.instanceNumber === 0 )

  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sendingAccount )

  const currentSatsAmountFormValue = useMemo( () => {
    return Number( spendCode )
  }, [ spendCode ] )

  useEffect( () => {
    let minimumGiftVal = 1000
    if ( includeFees ) minimumGiftVal += averageLowTxFee
    setMinimumGiftValue( minimumGiftVal )
  }, [ includeFees ] )

  useEffect( () => {
    if ( numbersOfGift ) setFees( false )
  }, [ numbersOfGift ] )

  function convertFiatToSats( fiatAmount: number ) {
    return accountsState.exchangeRates && accountsState.exchangeRates[ currencyCode ]
      ? Math.trunc(
        ( fiatAmount / accountsState.exchangeRates[ currencyCode ].last ) * SATOSHIS_IN_BTC
      )
      : 0
  }

  function convertSatsToFiat( sats ) {
    return accountsState.exchangeRates && accountsState.exchangeRates[ currencyCode ]
      ? ( ( sats / SATOSHIS_IN_BTC ) * accountsState.exchangeRates[ currencyCode ].last ).toFixed( 2 )
      : '0'
  }

  const isAmountInvalid = useMemo( () => {
    let giftAmount = currentSatsAmountFormValue
    console.log( giftAmount )

    const numberOfGifts = numbersOfGift ? Number( numbersOfGift ) : 1
    if ( prefersBitcoin ) {
      if ( !includeFees && averageLowTxFee ) giftAmount += averageLowTxFee
      return giftAmount * numberOfGifts > spendableBalance
    } else {
      const giftAmountInFiat = giftAmount ? giftAmount : 1
      const spendableBalanceInFiat = parseFloat( convertSatsToFiat( spendableBalance ) )
      return giftAmountInFiat * numberOfGifts > spendableBalanceInFiat
    }

  }, [ currentSatsAmountFormValue, averageLowTxFee, spendableBalance, includeFees, prefersBitcoin, numbersOfGift, currencyKind ] )

  useEffect( () => {
    if ( accountsState.selectedGiftId && initGiftCreation && giftCreationStatus ) {
      const createdGift = accountsState.gifts ? accountsState.gifts[ accountsState.selectedGiftId ] : null
      if ( createdGift ) {
        setCreatedGift( createdGift )
        setGiftModal( true )
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

  useEffect( () => {
    if ( isSendMax && sendMaxFee ) setAverageLowTxFee( sendMaxFee )
    else if ( account && accountState.averageTxFees ) setAverageLowTxFee( accountState.averageTxFees[ account.networkType ][ TxPriority.LOW ].averageTxFee )
  }, [ account, accountState.averageTxFees, isSendMax, sendMaxFee ] )

  useEffect( () => {
    if ( isSendMax && sendMaxFee ) setAverageLowTxFee( sendMaxFee )
    else if ( account && accountState.averageTxFees ) setAverageLowTxFee( accountState.averageTxFees[ account.networkType ][ TxPriority.LOW ].averageTxFee )
  }, [ account, accountState.averageTxFees, isSendMax, sendMaxFee ] )

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  useEffect( () => {
    if ( isSendMax ) setSpendCode( `${spendableBalance - sendMaxFee}` )
  }, [ sendMaxFee, isSendMax ] )

  useEffect( () => {
    if ( currencyKind == CurrencyKind.BITCOIN ) {
      const newAmount = convertFiatToSats( parseFloat( spendCode ) ).toString()
      setSpendCode( newAmount == 'NaN' ? '' : newAmount )
    } else if ( currencyKind == CurrencyKind.FIAT ) {
      const newAmount = convertSatsToFiat( parseFloat( spendCode ) ).toString()
      setSpendCode( newAmount == 'NaN' ? '' : newAmount )
    }
  }, [ currencyKind ] )

  function handleSendMaxPress() {
    dispatch( calculateSendMaxFee( {
      numberOfRecipients: Number( numbersOfGift ),
      accountShell: selectedAccount,
    } ) )
    setIsSendMax( true )
  }
  const fetchBanalnceOfSlot  = ( address: string ) =>{
    // TODO: implement
    return 100
  }
  const claimGifts = async() =>{
    // For Claim Flow
    await card.first_look()
    const { addr:address, pubkey } = await card.address( true, true, card.active_slot )
    const balance = fetchBanalnceOfSlot( address )
    if( balance!==0 ){
      // get the cvc from user
      const unSealSlot = await card.unseal_slot( 'spendCode/cvc' )
      // unSealSlot ->
      // {
      //     pk: Buffer;
      //     target: number;
      // }

      // dispatch( associateGift( unSealSlot.pk.toString(), sourcePrimarySubAccount.id ) )
      dispatch( associateGift( unSealSlot.pk.toString(), selectedAccount.id ) )


      // with this key move all the funds from the slot to checking account (rnd)
      console.log( 'slot address ===>' + JSON.stringify( unSealSlot ) )
      // For setup slot for next user
      const setUpSlot = await card.setup( '123', undefined, true )
      console.log( 'slot address ===>' + JSON.stringify( setUpSlot ) )
    }else{
      // corner case when the slot is unseled but no balance
      // continue with error flow
    }
  }


  function onPressNumber( text ) {
    let tmpPasscode = spendCode
    if ( text != 'x' ) {
      tmpPasscode += text
      setSpendCode( tmpPasscode )
    }
    if ( spendCode && text == 'x' ) {
      setSpendCode( spendCode.slice( 0, -1 ) )
    }
    if ( isSendMax ) setIsSendMax( false )
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
              color: Colors.blue, fontSize: RFValue( 13 ), fontFamily: Fonts.FiraSansRegular
            }}>{title}</Text>
            <Text style={{
              color: Colors.gray3, fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular
            }}>Gift Sats created will be of the
              <Text style={{
                fontWeight: 'bold', fontFamily: Fonts.FiraSansItalic
              }}>{' '}same amount</Text>
              {' '}and can be
              <Text style={{
                fontWeight: 'bold', fontFamily: Fonts.FiraSansItalic
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
                color: Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue( 18 )
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
            fontFamily: Fonts.FiraSansRegular,
            marginHorizontal: wp( 3 )
          }}>
            <Text>
              {'Make each gift exclusive\n'}
            </Text>
            <Text style={{
              fontSize: RFValue( 11 ),
            }}>
              (Restricts the gift to <Text style={{
                fontWeight: 'bold', fontFamily: Fonts.FiraSansItalic
              }}>one per Hexa app</Text> )
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
          color: Colors.blue, fontSize: RFValue( 20 ), fontFamily: Fonts.FiraSansRegular
        }}>Create Multiple Gift Sats</Text>
        {/* <Text style={{
          color: Colors.gray3, fontSize: RFValue( 12 ), fontFamily: Fonts.FiraSansRegular
        }}>Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit</Text> */}
      </View>
      <AdvanceGiftOptions
        title={'No. of Gifts'}
        // infoText={'Gift Sats created will be of the same amount and can be sent separately'}
        stateToUpdate={'gift'}
        imageToShow={require( '../../assets/images/icons/gift.png' )}
      />
      {/* <View>
        <Text style={{
          color: Colors.blue, fontSize: RFValue( 18 ), fontFamily: Fonts.FiraSansRegular
        }}>Customize Gift</Text>
        <Text style={{
          color: Colors.gray3, fontSize: RFValue( 12 ), fontFamily: Fonts.FiraSansRegular
        }}>Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit</Text>
      </View>
      <AdvanceGiftOptions
        title={'Time Lock'}
        infoText={'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit'}
        stateToUpdate={'timeLock'}
        imageToShow={require( '../../assets/images/icons/time.png' )}
      />
      <AdvanceGiftOptions
        title={'Limited Validity'}
        infoText={'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit'}
        stateToUpdate={'limitedValidity'}
        imageToShow={require( '../../assets/images/icons/validity.png' )}
      /> */}
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
                fontFamily: Fonts.FiraSansRegular,
              }}>
                {message}
              </Text>
              <Text
                style={{
                  color: Colors.black,
                  fontSize: RFValue( 14 ),
                  fontFamily: Fonts.FiraSansRegular,
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
          // alignItems: 'center',
          // backgroundColor: 'red',
          // justifyContent: 'flex-end',
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
            fontSize:RFValue( 13 ), color:Colors.blue, fontFamily:Fonts.FiraSansMedium
          }}>{'Cancel'}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const onCancelClick = () => {
    navigation.goBack()
  }

  const onClaimSatsClick = () => {
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
    // setShowGiftFailureModal( true )
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
                color={Colors.blue}
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
          fontFamily: Fonts.FiraSansRegular
        }} >
          {'Claim Sats'}
        </Text>
        <Text style={{
          color: Colors.textColorGrey,
          fontSize: RFValue( 12 ),
          letterSpacing: 0.6,
          marginHorizontal: 20,
          fontFamily: Fonts.FiraSansRegular,
          marginTop: 16
        }} >
          {'Note that this transfers the available sats in the card to your Checking Account'}
        </Text>
        {accountElement( selectedAccount, () => setAccountListModal( !accountListModal ) )}
        <Text style={{
          fontFamily:Fonts.FiraSansRegular, fontSize: RFValue( 12 ),
          letterSpacing: 0.48, color: Colors.gray13,
          marginTop: RFValue( 10 ), marginStart:20
        }}>
          {'Enter the '}
          <Text style={{
            fontFamily: Fonts.FiraSansSemiBold, fontStyle: 'italic'
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
          } ]} onPress={() => setKeyboard( true )}>{currencyKind == CurrencyKind.FIAT ? spendCode : UsNumberFormat( spendCode ) === '0' ? '' : UsNumberFormat( spendCode )}
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
    fontFamily: Fonts.FiraSansMediumItalic,
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
    fontFamily: Fonts.FiraSansRegular,
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
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.54
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
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
    fontFamily: Fonts.FiraSansMedium,
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
    fontFamily: Fonts.FiraSansRegular,
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
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto'
  },
  homeHeaderAmountText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 20 ),
    marginRight: 5,
    color: Colors.black,
  },
  homeHeaderAmountUnitText: {
    fontFamily: Fonts.FiraSansRegular,
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

