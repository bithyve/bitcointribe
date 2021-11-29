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
  TouchableWithoutFeedback
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
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
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
import ToggleContainer from '../../pages/Home/ToggleContainer'
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

const CreateGift = ( { navigation } ) => {
  const dispatch = useDispatch()
  const activeAccounts = useActiveAccountShells()
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
  const [ numbersOfGift, setNumbersOfGift ] = useState( 1 )
  const [ timeLock, setTimeLock ] = useState( 1 )
  const [ limitedValidity, setLimitedValidity ] = useState( 1 )
  const [ initGiftCreation, setInitGiftCreation ] = useState( false )
  const [ includeFees, setFees ] = useState( false )
  const [ addfNf, setAddfNf ] = useState( false )
  const [ giftModal, setGiftModal ] =useState( false )
  const [ createdGift, setCreatedGift ] = useState( null )
  const accountState: AccountsState = useSelector( ( state ) => idx( state, ( _ ) => _.accounts ) )
  const giftCreationStatus = useSelector( state => state.accounts.giftCreationStatus )
  const accountShells: AccountShell[] = accountState.accountShells
  const [ showLoader, setShowLoader ] = useState( false )
  const [ accountListModal, setAccountListModal ] = useState( false )
  const [ advanceModal, setAdvanceModal ] = useState( false )
  const defaultGiftAccount = accountShells.find( shell => shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT && shell.primarySubAccount.instanceNumber === 0 )
  const [ selectedAccount, setSelectedAccount ]: [AccountShell, any] = useState( defaultGiftAccount )
  const spendableBalance = useSpendableBalanceForAccountShell( selectedAccount )
  const account: Account = accountState.accounts[ selectedAccount.primarySubAccount.id ]
  const [ averageLowTxFee, setAverageLowTxFee ] = useState( 0 )

  const currentSatsAmountFormValue = useMemo( () => {
    return Number( amount )
  }, [ amount ] )


  const isAmountInvalid = useMemo( () => {
    let giftAmount = currentSatsAmountFormValue
    if( averageLowTxFee ) giftAmount += averageLowTxFee
    return giftAmount > spendableBalance
  }, [ currentSatsAmountFormValue, averageLowTxFee, spendableBalance, includeFees ] )

  useEffect( () => {
    if( accountsState.selectedGiftId && initGiftCreation && giftCreationStatus ) {
      const createdGift = accountsState.gifts[ accountsState.selectedGiftId ]
      if( createdGift ){
        setCreatedGift( createdGift )
        setGiftModal( true )
        setInitGiftCreation( false )
        setShowLoader( false )
        dispatch( giftCreationSuccess( null ) )
      }
    }
  }, [ accountsState.selectedGiftId, initGiftCreation, giftCreationStatus ] )

  useEffect( ()=>{
    setInitGiftCreation( false )
    setShowLoader( false )
    if( giftCreationStatus ){
      dispatch( giftCreationSuccess( null ) )
    } else if( giftCreationStatus === false ){
      // failed to create gift
      setShowLoader( false )
      dispatch( giftCreationSuccess( null ) )
    }
  }, [ giftCreationStatus ] )

  useEffect( () => {
    if( account && accountState.averageTxFees ) setAverageLowTxFee( accountState.averageTxFees[ account.networkType ][ TxPriority.LOW ].averageTxFee )
  }, [ account, accountState.averageTxFees ] )

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  const renderButton = ( text, condn ) => {
    const availableToSpend = selectedAccount && selectedAccount.primarySubAccount?.balances?.confirmed ? selectedAccount.primarySubAccount?.balances?.confirmed : 0
    const lowestGiftValue = includeFees? averageLowTxFee + 1000: 1000

    const isDisabled = currentSatsAmountFormValue < 10 || availableToSpend <= 0
    || ( parseInt( amount ? amount :  '0' ) <= 0 || parseInt( amount ? amount :  '0' ) > availableToSpend
    //|| ( !prefersBitcoin && parseInt( amount ? amount :  '0' ) >  parseInt( actualAmount ) )
    )
    return(
      <TouchableOpacity
        disabled={isDisabled}
        onPress={()=>{
          switch( condn ){
              case 'Create Gift':
                // creating multiple gift instances(based on giftInstances) of the same amount
                const giftInstances = Number( numbersOfGift )
                const giftAmount = Number( amount )
                const giftAmounts = []
                for( let int = 0; int < giftInstances; int++ ){
                  giftAmounts.push( giftAmount )
                }

                if( giftAmounts.length ){
                  dispatch( generateGifts( {
                    amounts: giftAmounts,
                    accountId: selectedAccount && selectedAccount.primarySubAccount && selectedAccount.primarySubAccount.id ? selectedAccount.primarySubAccount.id : '',
                    includeFee: includeFees
                  } ) )
                  setInitGiftCreation( true )
                  setShowLoader( true )
                }
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
    if ( text != 'x' ) {
      tmpPasscode += text
      setAmount( tmpPasscode )
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
            amt={numberWithCommas( createdGift.amount )}
            date={new Date()}
            image={<GiftCard />}
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
          Add recipient to Friends and Family
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

  const renderAccountList = () =>{
    return <ScrollView style={{
      height: 'auto'
    }}>
      { activeAccounts.map( ( item, index ) => {
        if ( item.primarySubAccount.type === AccountType.SWAN_ACCOUNT || !item.primarySubAccount.isUsable ) return
        return(
          <View key={index} style={{
            backgroundColor: Colors.white
          }}>
            {accountElement( item, ()=>{ setSelectedAccount( item )
              setAccountListModal( false )} )}
          </View>
        )
      } )}
    </ScrollView>
  }

  const AdvanceGiftOptions = ( { title, infoText, stateToUpdate, imageToShow } ) => {
    const plus = () =>{
      if( stateToUpdate == 'gift' ){
        setNumbersOfGift( numbersOfGift + 1 )
      } else if( stateToUpdate == 'timeLock' ){
        setTimeLock( timeLock + 1 )
      } else if( stateToUpdate == 'limitedValidity' ){
        setLimitedValidity( limitedValidity + 1 )
      }
    }

    const minus = () =>{
      if( stateToUpdate == 'gift' ){
        if( numbersOfGift > 1 )setNumbersOfGift( numbersOfGift - 1 )
      } else if( stateToUpdate == 'timeLock' ){
        if( timeLock > 1 ) setTimeLock( timeLock - 1 )
      } else if( stateToUpdate == 'limitedValidity' ){
        if( limitedValidity > 1 ) setLimitedValidity( limitedValidity - 1 )
      }
    }

    return ( <View style={{
      flexDirection: 'row',
      marginTop: wp( '5%' ), marginBottom: wp( '5%' ), justifyContent:'center',
    }}>
      <Image source={imageToShow} style={{
        width: wp( '10%' ), height: wp( '6%' ), resizeMode: 'contain', alignSelf:'center',
      }}/>
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
        }}>{infoText}</Text>
      </View>
      <View style={{
        flexDirection:'row', alignItems: 'center',
      }}>
        <TouchableOpacity onPress={()=>minus()} style={{
          width: wp( '5%' ), height: wp( '5%' ), borderRadius: wp( '5%' )/2, backgroundColor: Colors.lightBlue, justifyContent: 'center', alignItems:'center', marginRight: wp( '4%' )
        }}>
          <AntDesign name="minus"
            size={ 12}
            color={Colors.white}/>
        </TouchableOpacity>
        <View style={{
          height: wp( '12%' ), width: wp( '12%' ), borderRadius: 10, backgroundColor: Colors.white, justifyContent: 'center', alignItems:'center', shadowColor: Colors.borderColor, shadowOpacity: 0.6, shadowOffset: {
            width: 7, height: 7
          }, shadowRadius: 5, elevation: 5
        }}><Text style={{
            color: Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue( 18 )
          }}>{stateToUpdate == 'gift'
              ? numbersOfGift :
              stateToUpdate == 'timeLock' ?
                timeLock :
                limitedValidity
            }</Text>
        </View>
        <TouchableOpacity onPress={()=>plus()} style={{
          width: wp( '5%' ), height: wp( '5%' ), borderRadius: wp( '5%' )/2, backgroundColor: Colors.lightBlue, justifyContent: 'center', alignItems:'center', marginLeft: wp( '4%' )
        }}>
          <AntDesign name="plus"
            size={ 12}
            color={Colors.white}/>
        </TouchableOpacity>
      </View>
    </View> )
  }

  const renderAdvanceModal = () =>{
    return <View style={{
      backgroundColor: Colors.bgColor, padding: wp( '5%' ),
    }}>
      <View style={{
        flexDirection:'row',
      }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={()=>setAdvanceModal( false )}
          style={styles.modalCrossButton}
        >
          <FontAwesome name="close" color={Colors.white} size={19}/>
        </TouchableOpacity>
      </View>

      <View style={{
        flexDirection:'column'
      }}>
        <Text style={{
          color: Colors.blue, fontSize: RFValue( 18 ), fontFamily: Fonts.FiraSansRegular
        }}>Create Gift sats</Text>
        {/* <Text style={{
          color: Colors.gray3, fontSize: RFValue( 12 ), fontFamily: Fonts.FiraSansRegular
        }}>Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit</Text> */}
      </View>
      <AdvanceGiftOptions
        title={'No. of Gifts'}
        infoText={'Gift sats created will be of the same amount and can be sent separately'}
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

  const accountElement = ( item, onPressCallBack ) =>{
    return <TouchableOpacity
      style={styles.accountSelectionView}
      onPress={()=>onPressCallBack()}
    >
      <View style={{
        width: wp( 13 ),
        height: wp( 13 ),
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
            Sats would be deducted from
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
      <MaterialCommunityIcons
        name="dots-vertical"
        size={24}
        color="gray"
        style={{
          alignSelf: 'center'
        }}
      />
    </TouchableOpacity>
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
          <ModalContainer onBackground={()=>setGiftModal( false )} visible={giftModal} closeBottomSheet={() => {}} >
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
          {/* <ToggleContainer /> */}
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
                fontSize: RFValue( 24 ),
                letterSpacing: 0.01,
                marginLeft: 20,
                fontFamily: Fonts.FiraSansRegular
              }} >
                {'Create Gift'}
              </Text>
              <TouchableOpacity style={{
                marginLeft:'auto',
              }} onPress={()=>setAdvanceModal( true )}>
                <Image style={{
                  width: wp( '5%' ), height: wp( '5%' ), resizeMode: 'contain',  marginRight: wp( '5%' )
                }} source={require( '../../assets/images/icons/icon_settings_blue.png' )} />
              </TouchableOpacity>
            </View>
            {/* <View style={{
              flexDirection: 'row', alignItems: 'center',
            }}>
              <Text style={[ CommonStyles.subHeaderTitles, {
                fontWeight: 'normal'
              } ]} >
                {'View and manage created Gifts'}
              </Text>
            </View> */}


          </View>
        </View>
        {accountElement( selectedAccount, ()=> setAccountListModal( !accountListModal ) )}
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
            } ]} onPress={() => setKeyboard( true )}>{UsNumberFormat( amount ) === '0' ? '' :UsNumberFormat( amount ) }
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
          </View>

          {numbersOfGift > 1 ? <View style={{
            ...styles.inputBox,
            flexDirection: 'row',
            alignItems: 'center',
            borderColor: Colors.white,
            marginTop: 10,
            backgroundColor: Colors.white,
            paddingHorizontal: wp( 3 ),
            height: 50,
            marginLeft: 0,
            flex: 1
          }}>
            <Text style={[ {
              fontSize: RFValue( 15 ),
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              backgroundColor: Colors.white,
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
              color: Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue( 12 ),  marginLeft: 'auto', marginTop: hp( '0.5%' )
            }}>gifts</Text>
          </View> : null }
        </View>
        <View style={{
          marginLeft: wp( '5%' ),
          marginTop: wp( '3%' )
        }}>
          <Text style={FormStyles.errorText}>{isAmountInvalid ? strings.Insufficient : ''}</Text>
        </View>
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
        <View style={{
          marginLeft: wp( '5%' ),
          marginTop: wp( '3%' )
        }}>
          <Text style={{
            color: Colors.textColorGrey,
            fontSize: RFValue( 13 ),
            fontFamily: Fonts.FiraSansRegular,
            marginHorizontal: wp( 3 )
          }}>{`Note: ${includeFees ? `Minimum gift value:  ${averageLowTxFee+ 1000} sats`: 'Minimum gift value: 1000 sats'}`}</Text>
        </View>
        {showKeyboard &&
        <View style={{
          marginTop:'auto'
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
      <ModalContainer onBackground={()=>setAccountListModal( false )} visible={accountListModal} closeBottomSheet={() => setAccountListModal( false )}>
        {renderAccountList()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setAdvanceModal( false )} visible={advanceModal} closeBottomSheet={() => setAdvanceModal( false )}>
        {renderAdvanceModal()}
      </ModalContainer>
      <ModalContainer onBackground={() => setShowLoader( false )} visible={showLoader} closeBottomSheet={() => setShowLoader( false )}>
        <LoaderModal
          headerText={'Creating Gift'}
          messageText={'Packing your gift'}
          messageText2={''}
          showGif={false}
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
  accountSelectionView: {
    width: '90%',
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
  },
  modalCrossButton: {
    width: wp( 7 ),
    height: wp( 7 ),
    borderRadius: wp( 7/2 ),
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft:'auto'
  }
} )

export default CreateGift

