import React, { useState, useEffect, useMemo } from 'react'
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
  Platform
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
import DashedContainer from './DashedContainer'
import GiftCard from '../../assets/images/svgs/gift_icon_new.svg'
import BottomInfoBox from '../../components/BottomInfoBox'
import Illustration from '../../assets/images/svgs/illustration.svg'
import { generateGifts, giftCreationSuccess } from '../../store/actions/accounts'
import { AccountsState } from '../../store/reducers/accounts'
import { Account, AccountType, Gift, TxPriority } from '../../bitcoin/utilities/Interface'
import idx from 'idx'
import useSpendableBalanceForAccountShell from '../../utils/hooks/account-utils/UseSpendableBalanceForAccountShell'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import AccountShell from '../../common/data/models/AccountShell'
import ToggleContainer from './CurrencyToggle'
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
import ErrorLoader from '../../components/ErrorLoader'
import LoaderModal from '../../components/LoaderModal'
import Toast from '../../components/Toast'
import { calculateSendMaxFee } from '../../store/actions/sending'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import { Shadow } from 'react-native-shadow-2'
import VerifySatModalContents from '../Gift/VerifySatModalContents'
import { platform } from 'process'

const { height, } = Dimensions.get( 'window' )

export type Props = {
  navigation: any;
};

const CreateGift = ( { navigation }: Props ) => {
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
  const [ amount, setAmount ] = useState( '' )
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
  const [ isExclusive, setIsExclusive ] = useState( true )
  const [ minimumGiftValue, setMinimumGiftValue ] = useState( 1000 )
  const [ showErrorLoader, setShowErrorLoader ] = useState( false )
  const [ satCard, setSatCard ] = useState( false )
  const [ showVerification, setShowVerification ] = useState( false )

  const currentSatsAmountFormValue = useMemo( () => {
    return Number( amount )
  }, [ amount ] )

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
    if ( isSendMax ) setAmount( `${spendableBalance - sendMaxFee}` )
  }, [ sendMaxFee, isSendMax ] )

  useEffect( () => {
    if ( currencyKind == CurrencyKind.BITCOIN ) {
      const newAmount = convertFiatToSats( parseFloat( amount ) ).toString()
      setAmount( newAmount == 'NaN' ? '' : newAmount )
    } else if ( currencyKind == CurrencyKind.FIAT ) {
      const newAmount = convertSatsToFiat( parseFloat( amount ) ).toString()
      setAmount( newAmount == 'NaN' ? '' : newAmount )
    }
  }, [ currencyKind ] )

  function handleSendMaxPress() {
    dispatch( calculateSendMaxFee( {
      numberOfRecipients: Number( numbersOfGift ),
      accountShell: selectedAccount,
    } ) )
    setIsSendMax( true )
  }

  const renderButton = ( text, condn ) => {
    const availableToSpend = selectedAccount && selectedAccount.primarySubAccount?.balances?.confirmed ? selectedAccount.primarySubAccount?.balances?.confirmed : 0

    let isDisabled = isAmountInvalid
    if ( !isDisabled ) {
      if ( prefersBitcoin ) {
        isDisabled = currentSatsAmountFormValue < minimumGiftValue
      } else {
        isDisabled = currentSatsAmountFormValue < parseFloat( convertSatsToFiat( minimumGiftValue ) )
      }
    }

    return (
      <Shadow distance={2} startColor={Colors.shadowBlue} offset={[ 8, 8 ]}>
        <TouchableOpacity
          disabled={isDisabled}
          onPress={() => {
            if ( satCard ) {
              setShowVerification( true )
            } else {
              switch ( condn ) {
                  case 'Create Gift':
                    // creating multiple gift instances(based on giftInstances) of the same amount
                    const giftInstances = Number( numbersOfGift )
                    const giftAmountInSats = prefersBitcoin ? Number( amount ) : convertFiatToSats( parseFloat( amount ) )
                    const giftAmountsInSats = []
                    for ( let int = 0; int < giftInstances; int++ ) {
                      giftAmountsInSats.push( giftAmountInSats )
                    }
                    if ( giftAmountsInSats.length ) {
                      setInitGiftCreation( true )
                      setShowLoader( true )
                      dispatch( generateGifts( {
                        amounts: giftAmountsInSats,
                        accountId: selectedAccount && selectedAccount.primarySubAccount && selectedAccount.primarySubAccount.id ? selectedAccount.primarySubAccount.id : '',
                        includeFee: includeFees,
                        exclusiveGifts: giftAmountsInSats.length === 1 ? false : isExclusive,
                      } ) )
                    }
                    break

                  case 'Add F&F and Send':
                    setGiftModal( false )
                    navigation.navigate( 'AddContact', {
                      fromScreen: 'Gift',
                      giftId: ( createdGift as Gift ).id,
                      setActiveTab: navigation.state.params.setActiveTab
                    } )
                    break

                  case 'Send Gift':
                    setGiftModal( false )
                    navigation.navigate( 'EnterGiftDetails', {
                      giftId: ( createdGift as Gift ).id,
                      setActiveTab: navigation.state.params.setActiveTab
                    } )
                    break
              }
            }
          }}
          style={isDisabled ? {
            ...styles.disabledButtonView
          } : {
            ...styles.buttonView
          }
          }
        >
          <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
      </Shadow>
    )
  }

  const onCloseClick = () => {
    setShowVerification( false )
  }

  const onVerifyClick = () => {
    setShowVerification( false )
    navigation.navigate( 'SetUpSatNextCard', {
      giftAmount: includeFees ? JSON.stringify( parseInt( amount ) - 226 ): amount,
      fromClaimFlow: 0
    } )
  }

  function onPressNumber( text ) {
    let tmpPasscode = amount
    if ( text != 'x' ) {
      tmpPasscode += text
      setAmount( tmpPasscode )
    }
    if ( amount && text == 'x' ) {
      setAmount( amount.slice( 0, -1 ) )
    }
    if ( isSendMax ) setIsSendMax( false )
  }


  const renderCreateGiftModal = () => {
    return (
      <View style={styles.modalContentContainer}>
        <View style={{
          marginTop: 'auto', right: 0, bottom: 0, position: 'absolute', marginLeft: 'auto'
        }}>
          <Illustration />
        </View>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setGiftModal( false )
            navigation.goBack()
          }}
          style={{
            width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
            marginTop: wp( 3 ), marginRight: wp( 3 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} style={{
            // marginTop: hp( 0.5 )
          }} />
        </TouchableOpacity>
        <View>
          <View style={{
            marginLeft: wp( 7 ),
          }}>
            <Text style={styles.modalTitleText}>Gift Created</Text>
            <Text style={{
              ...styles.modalInfoText,
            }}>{'You\'re ready to elate!'}</Text>
          </View>
          <DashedContainer
            titleText={'Available Gift'}
            subText={'Someone\'s about to feel extra special'}
            amt={prefersBitcoin ? numberWithCommas( createdGift.amount ) : convertSatsToFiat( createdGift.amount )}
            date={new Date()}
            image={<GiftCard />}
            currencyCode={prefersBitcoin ? '' : currencyCode}
          />


          <BottomInfoBox
            containerStyle={{
              paddingRight: wp( 15 ),
              backgroundColor: 'transparent',
              marginTop: hp( -1 )
            }}
            infoText={'The Gift is ready to be sent to anyone you choose. If unaccepted, the sats would revert to your wallet.'}
          />

        </View>
        {/* <View style={{
          marginBottom: hp( 4 ),
          marginHorizontal: wp( 7 ),
          flexDirection: 'row'
        }}>
          <TouchableOpacity
            onPress={() => setAddfNf( !addfNf )}
            style={{
              flexDirection: 'row'
            }}
          >

            <View style={styles.imageView}>
              {addfNf &&
              <CheckMark style={{
                marginLeft: 6,
                marginTop: 6
              }}/>
              }
            </View>
            <Text style={{
              color: Colors.textColorGrey,
              fontSize: RFValue( 12 ),
              fontFamily: Fonts.FiraSansRegular,
              marginHorizontal: wp( 3 )
            }}>
          Add recipient to Friends and Family
            </Text>
          </TouchableOpacity>
        </View> */}
        <View style={{
          marginLeft: wp( 4 ), flexDirection: 'row'
        }}>
          {renderButton( 'Send Gift', addfNf ? 'Add F&F and Send' : 'Send Gift' )}
          {/* {renderButton( 'Add F&F and Send' )}   */}

        </View>
      </View>
    )
  }

  const BalanceCurrencyIcon = () => {
    const style = {

    }

    if ( prefersBitcoin ) {
      return <Image style={{
        height: RFValue( 14 ), width: RFValue( 14 ), resizeMode: 'contain'
      }} source={require( '../../assets/images/currencySymbols/icon_bitcoin_gray.png' )} />
    }

    if ( materialIconCurrencyCodes.includes( fiatCurrencyCode ) ) {
      return (
        <MaterialCurrencyCodeIcon
          currencyCode={fiatCurrencyCode}
          color={Colors.gray2}
          size={RFValue( 16 )}
          style={{
          }}
        />
      )
    } else {
      return (
        <Image
          style={style}
          source={getCurrencyImageByRegion( fiatCurrencyCode, 'gray' )}
        />
      )
    }
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

  // gift creation failure UI

  const renderErrorModal = () => {
    return <View style={{
      backgroundColor: Colors.white,
      padding: wp( '8' )
    }}>
      <View style={{
        flexDirection: 'row',
      }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => { setShowErrorLoader( false ) }}
          style={styles.modalCrossButton}
        >
          <FontAwesome name="close" color={Colors.white} size={19} />
        </TouchableOpacity>
      </View>

      <View style={{
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Text style={{
          color: Colors.blue, fontSize: RFValue( 18 ), width: '60%', fontWeight: '200', marginBottom: 30, fontFamily: Fonts.FiraSansRegular, letterSpacing: 0.54
        }}>Gift Creation Unsuccessful</Text>
        <Text style={{
          color: Colors.gray3, marginBottom: 10, fontSize: RFValue( 12 ), fontFamily: Fonts.FiraSansRegular
        }}>Please try again</Text>

        <View style={{
          justifyContent: 'flex-start', marginStart: wp( -4 )
        }}>
          {accountElement( selectedAccount, () => { }, 1, '90%', 'Bitcoin not deducted' )}
        </View>

        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <TouchableOpacity style={styles.buttonView} onPress={() => { setShowErrorLoader( false ) }} >
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
          <Image source={require( '../../assets/images/loader.gif' )} style={{
            width: wp( '40%' ), height: wp( '35%' ), resizeMode: 'stretch', marginBottom: wp( -8 ), marginRight: wp( -8 ),
          }} />
        </View>
      </View>
    </View>
  }

  const accountElement = (
    item,
    onPressCallBack,
    activeOpacity = 0,
    width = '90%',
    message = `${currencyKind === CurrencyKind.BITCOIN ? 'Sats' : 'Money'} would be deducted from`,
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

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1
      }}
      keyboardShouldPersistTaps='handled'
    >
      <SafeAreaView style={styles.viewContainer}>
        <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
        {giftModal &&
          <ModalContainer onBackground={() => setGiftModal( false )} visible={giftModal} closeBottomSheet={() => { }} >
            {renderCreateGiftModal()}
          </ModalContainer>
        }
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
          <ToggleContainer />
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
        }}>
          <View style={{
            flex: 1
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
            }}>
              <Text style={{
                color: Colors.blue,
                fontSize: height < 720 ? RFValue( 20 ) : RFValue( 24 ),
                letterSpacing: 0.01,
                marginLeft: 20,
                fontFamily: Fonts.FiraSansRegular
              }} >
                {'Create Gift'}
              </Text>
              <TouchableOpacity style={{
                marginLeft: 'auto',
              }} onPress={() => setAdvanceModal( true )}>
                <Image style={{
                  width: wp( '5%' ), height: wp( '5%' ), resizeMode: 'contain', marginRight: wp( '5%' )
                }} source={require( '../../assets/images/icons/icon_settings_blue.png' )} />
              </TouchableOpacity>
            </View>


          </View>
        </View>
        {accountElement( selectedAccount, () => setAccountListModal( !accountListModal ) )}
        <View style={{
          flexDirection: 'row'
        }}>
          <View
            style={{
              ...styles.inputBox,
              flexDirection: 'row',
              alignItems: 'center',
              borderColor: Colors.white,
              marginTop: 10,
              backgroundColor: Colors.white,
              paddingHorizontal: wp( 3 ),
              height: 50,
              flex: 2,
              marginRight: numbersOfGift == 1 ? wp( '5%' ) : wp( '2%' )
            }}
          >
            <BalanceCurrencyIcon />
            <View style={{
              width: wp( 0.5 ), backgroundColor: Colors.borderColor, height: hp( 2.5 ), marginHorizontal: wp( 4 )
            }} />
            <Text style={[ styles.modalInputBox, {
              color: amount !== '' ? Colors.textColorGrey : Colors.gray1,
            } ]} onPress={() => setKeyboard( true )}>{currencyKind == CurrencyKind.FIAT ? amount : UsNumberFormat( amount ) === '0' ? '' : UsNumberFormat( amount )}
              {( !showKeyboard && !amount ) &&
                <Text style={{
                  fontSize: RFValue( 12 ),
                }}>
                  {`Enter amount in ${prefersBitcoin ? 'sats' : `${fiatCurrencyCode}`}`}
                </Text>
              }
              {( showKeyboard ) && <Text style={{
                color: Colors.lightBlue, fontSize: RFValue( 18 ),
              }}>|</Text>}
            </Text>

            {
              Number( numbersOfGift ) === 1 &&
              <AppBottomSheetTouchableWrapper
                onPress={handleSendMaxPress}
                style={{
                  padding: 16,
                }}
                disabled={spendableBalance <= 0}
              >
                <Text
                  style={{
                    color: Colors.blue,
                    textAlign: 'center',
                    // paddingHorizontal: 10,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.FiraSansItalic,
                  }}
                >
                  {strings.SendMax}
                </Text>
              </AppBottomSheetTouchableWrapper>
            }

          </View>

          {numbersOfGift > 1 ? <View style={{
            ...styles.inputBox,
            flexDirection: 'row',
            alignItems: 'center',
            borderColor: Colors.gray9,
            marginTop: 10,
            backgroundColor: Colors.backgroundColor,
            paddingHorizontal: wp( 3 ),
            height: 50,
            marginLeft: 0,
            flex: 1
          }}>
            <Text style={[ {
              fontSize: RFValue( 15 ),
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              backgroundColor: Colors.backgroundColor,
              alignSelf: 'center',
              flex: 1,
            }, {
              color: Colors.textColorGrey
            } ]} >
              <Text style={{
                color: Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue( 12 ),
              }}>x   </Text>{numbersOfGift}
            </Text>
            <Text style={{
              color: Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue( 12 ), marginLeft: 'auto', marginTop: hp( '0.5%' )
            }}>gifts</Text>
          </View> : null}
        </View>
        {numbersOfGift < 1 ? <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: wp( '5%' ), marginRight: wp( '5%' ), marginTop: wp( '3%' )
        }}>
          <Text style={{
            color: Colors.greyTextColor, fontSize: RFValue( 12 ), fontFamily: Fonts.FiraSansMedium
          }}>Total Amount</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 'auto'
            }}
          >
            {prefersBitcoin ? (
              <Image
                style={{
                  ...CommonStyles.homepageAmountImage,
                  marginTop: hp( 0.2 )
                }}
                source={require( '../../assets/images/icons/icon_bitcoin_gray.png' )}
              />
            ) : materialIconCurrencyCodes.includes( fiatCurrencyCode ) ? (
              <MaterialCurrencyCodeIcon
                currencyCode={fiatCurrencyCode}
                color={Colors.white}
                size={RFValue( 16 )}
                style={{
                  marginRight: wp( 1 ), marginLeft: [ 'SEK', 'BRL', 'DKK', 'ISK', 'KRW', 'PLN', 'SEK' ].includes( fiatCurrencyCode ) ? 0 : -wp( 1 )
                }}
              />
            ) : (
              <Image
                style={{
                  ...styles.cardBitCoinImage,
                }}
                source={getCurrencyImageByRegion( fiatCurrencyCode, 'light' )}
              />
            )}
            <Text style={styles.homeHeaderAmountText}>
              {prefersBitcoin
                ? UsNumberFormat( parseInt( amount ) * numbersOfGift )
                : exchangeRates && exchangeRates[ currencyCode ]
                  ? (
                    ( parseInt( amount ) * numbersOfGift / SATOSHIS_IN_BTC ) *
                    exchangeRates[ currencyCode ].last
                  ).toFixed( 2 )
                  : ''}
            </Text>
            <Text style={styles.homeHeaderAmountUnitText}>
              {prefersBitcoin ? 'sats' : fiatCurrencyCode}
            </Text>
          </View>
        </View> : null}
        <View style={{
          flexDirection:'row', justifyContent:'space-between',
          // backgroundColor:'red',
          marginHorizontal: wp( 5 ),
          alignItems:'center'
        }}>
          {/* <View style={{
             marginTop: wp( '1.5%' )
          }}> */}
          <Text style={{
            color: Colors.textColorGrey,
            fontSize: RFValue( 11 ),
            fontFamily: Fonts.FiraSansRegular,
            // marginHorizontal: wp( 3 ),
          }}>
            <Text>{'Minimum gift value '}</Text>
            <Text style={{
              fontWeight: 'bold',
              fontFamily: Fonts.FiraSansItalic
            }}>{prefersBitcoin ? minimumGiftValue : convertSatsToFiat( minimumGiftValue )} {prefersBitcoin ? 'sats' : currencyCode}</Text>
          </Text>
          {/* </View> */}
          <View style={{
            flexDirection:'row',
            alignItems:'center'
          }}>
            <Switch value={includeFees}
              style={{
                transform: [ {
                  scaleX: Platform.OS == 'ios' ? .4 : .7
                }, {
                  scaleY: Platform.OS == 'ios' ? .4 : .7
                } ]
              }}
              trackColor={{
                false: '#C4C4C4', true: '#81b0ff'
              }}
              thumbColor={includeFees ? '#fff' : '#fff'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={( value ) => {setFees( value )}} />
            <Text style={{
              color:Colors.gray13, fontSize:RFValue( 10 ), fontFamily:Fonts.FiraSansRegular,
              letterSpacing:0.5,
              // marginTop: wp( '1.5%' )
            }}>{'Include '}
              <Text style={{
                fontFamily:Fonts.FiraSansSemiBold
              }}>{'Fee'}</Text>
            </Text>
          </View>
        </View>
        <View style={{
          marginLeft: wp( '5%' ),
          marginTop: wp( '3%' )
        }}>
          <Text style={FormStyles.errorText}>{isAmountInvalid ? strings.Insufficient : ''}</Text>
        </View>
        {
          // ( Number( numbersOfGift ) === 1 ) &&
          !isSendMax && (
            <View style={{
              marginVertical: height < 720 ? hp( 1 ) : hp( 2 ),
              marginHorizontal: wp( 7 ),
              flexDirection: 'row'
            }}>
              <TouchableOpacity
                onPress={() => setSatCard( !satCard )}
                disabled={numbersOfGift ? Number( numbersOfGift ) < 1 : false}
                style={{
                  flexDirection: 'row'
                }}
              >
                <View style={styles.imageView}>
                  {satCard &&
                    <CheckMark style={{
                      marginLeft: 6,
                      marginTop: 6
                    }} />
                  }
                </View>
                <Text style={{
                  color: Colors.blue,
                  fontSize: RFValue( 12 ),
                  fontFamily: Fonts.FiraSansSemiBold,
                  marginHorizontal: wp( 3 )
                }}>
                  Use SATSCARD™ to gift sats
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
        <View style={{
          flexDirection: 'row', alignItems: 'center', marginHorizontal: wp( 6 ), justifyContent: 'space-between', marginVertical: height < 720 ? hp( 1 ) : hp( 3 )
        }}>
          <Text style={{
            color: Colors.textColorGrey,
            fontSize: RFValue( 14 ),
            fontFamily: Fonts.FiraSansMedium,
          }}>Total Amount</Text>
          <Text>
            <Text style={{
              color: Colors.black,
              fontSize: RFValue( 20 ),
              fontFamily: Fonts.FiraSansRegular,
            }}>
              {
                Number( amount ) * numbersOfGift
              }
            </Text>
            <Text style={{
              color: Colors.textColorGrey,
              fontSize: RFValue( 11 ),
              fontFamily: Fonts.FiraSansRegular,
            }}>{prefersBitcoin ? ' sats' : ` ${currencyCode}`}</Text>

          </Text>

        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', marginHorizontal: wp( 6 ), marginBottom: height < 720 ? wp( 1 ) : wp( 7 )
        }}>
          {renderButton( numbersOfGift > 1 ? 'Create Gifts' : 'Create Gift', 'Create Gift' )}
        </View>
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

      <ModalContainer onBackground={() => setShowLoader( false )} visible={showLoader} closeBottomSheet={() => setShowLoader( false )}>
        <LoaderModal
          headerText={'Packing Your Gift'}
          messageText={'Once created, you can send the Gift Sats right away or keep them for later\nIf not accepted, you can reclaim your Gift Sats'}
          messageText2={''}
          source={require( '../../assets/images/gift.gif' )}
        />
      </ModalContainer>

      <ModalContainer onBackground={() => setShowLoader( false )} visible={( showErrorLoader )}>
        {renderErrorModal()}
      </ModalContainer>
      <ModalContainer onBackground={onCloseClick} visible={showVerification} closeBottomSheet={onCloseClick}  >
        <VerifySatModalContents
          title={'Tap SATSCARD™'}
          info={'Get your SATSCARD™ ready for verification'}
          proceedButtonText={'Detect SATSCARD™'}
          subPoints={'Touch your SATSCARD™ on your phone after clicking \'Detect SATSCARD™\'' }
          bottomImage={require( '../../assets/images/satCards/illustration.png' )}
          onCloseClick={onCloseClick}
          onPressProceed={onVerifyClick}
          closeModal
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
  modalInputBox: {
    flex: 1,
    fontSize: RFValue( 15 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    backgroundColor: Colors.white,
    alignSelf: 'center'
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    backgroundColor: Colors.white,
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
    // shadowOpacity: 0.06,
    // shadowOffset: {
    //   width: 10, height: 10
    // },
    // shadowRadius: 10,
    // elevation: 2,
    alignSelf: 'center',
    marginTop: hp( 2 ),
    marginBottom: hp( 2 ),
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
} )

export default CreateGift

