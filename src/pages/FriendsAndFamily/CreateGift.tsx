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
  Image
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
import HeaderTitle from '../../components/HeaderTitle'
import CommonStyles from '../../common/Styles/Styles'
import CheckingAccount from '../../assets/images/accIcons/icon_checking.svg'
import Dollar from '../../assets/images/svgs/icon_dollar.svg'
import CheckMark from '../../assets/images/svgs/checkmark.svg'
import ModalContainer from '../../components/home/ModalContainer'
import DashedContainer from './DashedContainer'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import BottomInfoBox from '../../components/BottomInfoBox'
import Illustration from '../../assets/images/svgs/illustration.svg'
import { generateGifts } from '../../store/actions/accounts'
import { AccountsState } from '../../store/reducers/accounts'
import { Account, AccountType, Gift, TxPriority } from '../../bitcoin/utilities/Interface'
import idx from 'idx'
import useSpendableBalanceForAccountShell from '../../utils/hooks/account-utils/UseSpendableBalanceForAccountShell'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import AccountShell from '../../common/data/models/AccountShell'
import ToggleContainer from '../../pages/Home/ToggleContainer'
import MaterialCurrencyCodeIcon, {
  materialIconCurrencyCodes,
} from '../../components/MaterialCurrencyCodeIcon'
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

const CreateGift = ( { navigation } ) => {
  const dispatch = useDispatch()
  const currencyKind: CurrencyKind = useCurrencyKind()

  const strings  = translations[ 'accounts' ]
  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )
  const fiatCurrencyCode = useCurrencyCode()
  const accountsState: AccountsState = useSelector( state => state.accounts )
  const currencyCode =  useSelector( state => state.preferences.currencyCode )
  const [ inputStyle, setInputStyle ] = useState( styles.inputBox )
  const [ amount, setAmount ] = useState( '' )
  const [ showKeyboard, setKeyboard ] = useState( false )
  const [ initGiftCreation, setInitGiftCreation ] = useState( false )
  const [ includeFees, setFees ] = useState( false )
  const [ addfNf, setAddfNf ] = useState( false )
  const [ giftModal, setGiftModal ] =useState( false )
  const [ createdGift, setCreatedGift ] = useState( null )
  const accountState: AccountsState = useSelector( ( state ) => idx( state, ( _ ) => _.accounts ) )
  const accountShells: AccountShell[] = accountState.accountShells
  const sendingAccount = accountShells.find( shell => shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT && shell.primarySubAccount.instanceNumber === 0 )
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sendingAccount )
  const spendableBalance = useSpendableBalanceForAccountShell( sendingAccount )
  const account: Account = accountState.accounts[ sourcePrimarySubAccount.id ]
  const [ averageLowTxFee, setAverageLowTxFee ] = useState( 0 )

  const currentSatsAmountFormValue = useMemo( () => {
    return Number( amount )
  }, [ amount ] )

  const isAmountInvalid = useMemo( () => {
    if( includeFees ) if( currentSatsAmountFormValue <= averageLowTxFee ) return true

    return currentSatsAmountFormValue > spendableBalance
  }, [ currentSatsAmountFormValue, spendableBalance, includeFees, averageLowTxFee ] )

  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: BitcoinUnit.SATS,
  } )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle

    return `${title}`
    // return `${title} (${strings.availableToSpend}: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`

  }, [ sourcePrimarySubAccount ] )

  useEffect( () => {
    if( accountsState.selectedGiftId && initGiftCreation ) {
      const createdGift = accountsState.gifts[ accountsState.selectedGiftId ]
      if( createdGift ){
        setCreatedGift( createdGift )
        setGiftModal( true )
        setInitGiftCreation( false )
      }
    }

  }, [ accountsState.selectedGiftId, initGiftCreation ] )

  useEffect( () => {
    if( account && accountState.averageTxFees ) setAverageLowTxFee( accountState.averageTxFees[ account.networkType ][ TxPriority.LOW ].averageTxFee )
  }, [ account, accountState.averageTxFees ] )

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  const renderButton = ( text, condn ) => {
    const actualAmount = ( ( spendableBalance / SATOSHIS_IN_BTC ) *
    accountsState.exchangeRates[ currencyCode ].last
    ).toFixed( 2 )


    const isDisabled = spendableBalance <= 0 || ( parseInt( amount ? amount :  '0' ) <= 0 || parseInt( amount ? amount :  '0' ) > spendableBalance || ( !prefersBitcoin && parseInt( amount ? amount :  '0' ) >  parseInt( actualAmount ) ) )
    return(
      <TouchableOpacity
        disabled={isDisabled}
        onPress={()=>{
          switch( condn ){
              case 'Create Gift':
                dispatch( generateGifts( {
                  amounts: [ Number( amount ) ],
                  includeFee: includeFees
                } ) )
                setInitGiftCreation( true )
                break

              case 'Add F&F and Send':
                setGiftModal( false )
                navigation.navigate( 'AddContact', {
                  fromScreen: 'Gift',
                  giftId: ( createdGift as Gift ).id
                } )
                break

              case 'Send Gift':
                setGiftModal( false )
                navigation.navigate( 'EnterGiftDetails', {
                  giftId: ( createdGift as Gift ).id,
                } )
                break
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
    )
  }

  function onPressNumber( text ) {
    let tmpPasscode = amount
    if ( amount.length < 4 ) {
      if ( text != 'x' ) {
        tmpPasscode += text
        setAmount( tmpPasscode )
      }
    }
    if ( amount && text == 'x' ) {
      setAmount( amount.slice( 0, -1 ) )
    }
  }

  const renderCreateGiftModal =()=>{
    return(
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
            width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
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
            marginLeft: wp( 6 ),
          }}>
            <Text style={styles.modalTitleText}>Gift Created</Text>
            <Text style={{
              ...styles.modalInfoText,
            }}>{'You\'re ready to elate!'}</Text>
          </View>
          <DashedContainer
            titleText={'Available Gift'}
            subText={'Someone\'s about to feel extra special'}
            amt={numberWithCommas( createdGift.amount )}
            date={new Date()}
            image={<GiftCard />}
          />


          <BottomInfoBox
            containerStyle={{
              paddingRight: wp( 15 ),
              backgroundColor: 'transparent'
            }}
            infoText={'The Gift is ready to be sent to anyone you choose. If unclaimed, the sats would revert to your wallet.'}
          />

        </View>
        <View style={{
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
          Add to Friends & Family
            </Text>
          </TouchableOpacity>
        </View>
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

  return (
    <ScrollView contentContainerStyle={{
      flexGrow: 1
    }}
    keyboardShouldPersistTaps='handled'
    >
      <SafeAreaView style={styles.viewContainer}>
        <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
        {giftModal &&
      <ModalContainer visible={giftModal} closeBottomSheet={() => {}} >
        {renderCreateGiftModal()}
      </ModalContainer>
        }
        <View style={[ CommonStyles.headerContainer, {
          backgroundColor: Colors.backgroundColor,
          marginRight: wp( 4 )
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
          flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginRight: wp( 4 )
        }}>
          <HeaderTitle
            firstLineTitle={'Create Gift'}
            secondLineTitle={'You can choose to send it to anyone using the QR or the link'}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />
        </View>
        <TouchableOpacity
          style={{
            width: '90%',
            // height: '54%',
            backgroundColor: Colors.gray7,
            shadowOpacity: 0.06,
            shadowOffset: {
              width: 10, height: 10
            },
            shadowRadius: 10,
            elevation: 2,
            alignSelf: 'center',
            borderRadius: wp( 2 ),
            marginTop: hp( 3 ),
            marginBottom: hp( 1 ),
            paddingVertical: hp( 2 ),
            paddingHorizontal: wp( 2 ),
            flexDirection: 'row'
          }}>
          <CheckingAccount />
          <View style={{
            marginHorizontal: wp( 3 )
          }}>
            <Text style={{
              color: Colors.gray4,
              fontSize: RFValue( 10 ),
              fontFamily: Fonts.FiraSansRegular,
            }}>
                Bitcoin will be deducted from
            </Text>
            <Text
              style={{
                color: Colors.black,
                fontSize: RFValue( 14 ),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              {sourceAccountHeadlineText}
            </Text>
            <Text style={styles.availableToSpendText}>
              {'Available to spend '}
              <Text style={styles.balanceText}>
                {prefersBitcoin
                  ? UsNumberFormat( spendableBalance )
                  : accountsState.exchangeRates && accountsState.exchangeRates[ currencyCode ]
                    ? (
                      ( spendableBalance / SATOSHIS_IN_BTC ) *
                      accountsState.exchangeRates[ currencyCode ].last
                    ).toFixed( 2 )
                    : 0}
              </Text>
              <Text>
                {prefersBitcoin ? ' sats' : ` ${fiatCurrencyCode}`}
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
        <KeyboardAvoidingView
          style={{
            ...inputStyle,
            flexDirection: 'row',
            alignItems: 'center',
            borderColor: Colors.white,
            marginTop: 10,
            backgroundColor: Colors.white,
            paddingHorizontal: wp( 3 ),
            height: 50,
          }}
        >
          <BalanceCurrencyIcon />

          <View style={{
            width: wp( 0.5 ), backgroundColor: Colors.borderColor, height: hp( 2.5 ), marginHorizontal: wp( 4 )
          }} />
          <Text style={[ styles.modalInputBox, {
            color: amount !== '' ? Colors.textColorGrey : Colors.gray1
          } ]} onPress={() => setKeyboard( true )}>{amount}
            {!showKeyboard &&
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
          {isAmountInvalid && (
            <View style={{
              marginLeft: 'auto'
            }}>
              <Text style={FormStyles.errorText}>{strings.Insufficient}</Text>
            </View>
          )}
        </KeyboardAvoidingView>
        <View style={{
          marginVertical: hp( 5 ),
          marginHorizontal: wp( 7 ),
          flexDirection: 'row'
        }}>
          <TouchableOpacity
            onPress={() => setFees( !includeFees )}
            style={{
              flexDirection: 'row'
            }}
          >

            <View style={styles.imageView}>
              {includeFees &&
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
          Include fee in amount
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', marginHorizontal: wp( 6 )
        }}>


          {renderButton( 'Create Gift',  'Create Gift' )}
        </View>
        {showKeyboard &&
        <View style={{
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
    letterSpacing: 0.6
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
    fontSize: RFValue( 15 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    backgroundColor: Colors.white,
    alignSelf: 'center'
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
  accImage:{
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

export default CreateGift

