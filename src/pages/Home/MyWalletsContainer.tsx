import React, { createRef, PureComponent, useContext, useEffect, useMemo, useState } from 'react'
import {
  Text,
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity
} from 'react-native'
import Colors from '../../common/Colors'
import { connect, useDispatch, useSelector } from 'react-redux'
//import HomeHeader from '../../components/home/home-header'
import idx from 'idx'
import { withNavigationFocus } from 'react-navigation'
import HomeAccountCardsList from './HomeAccountCardsList'
import AccountShell from '../../common/data/models/AccountShell'
import { setShowAllAccount, markAccountChecked } from '../../store/actions/accounts'
import { SwanIntegrationState } from '../../store/reducers/SwanIntegration'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { ScrollView } from 'react-native-gesture-handler'
import ToggleContainer from './ToggleContainer'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import HomeBuyCard from './HomeBuyCard'
import { LocalizationContext } from '../../common/content/LocContext'
import { AccountType } from '../../bitcoin/utilities/Interface'
import dbManager from '../../storage/realm/dbManager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CustomToolbar from '../../components/home/CustomToolbar'
import { hp, wp } from '../../common/data/responsiveness/responsive'
import useActiveAccountShells from '../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import AccountVisibility from '../../common/data/enums/AccountVisibility'
import HomeAccountsListCard from '../../components/home/HomeAccountsListCard'
import AddNewAccountCard from './AddNewAccountCard'
import { sourceAccountSelectedForSending } from '../../store/actions/sending'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../../components/MaterialCurrencyCodeIcon'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import { getCurrencyImageByRegion } from '../../common/CommonFunctions'
import TransactionKind from '../../common/data/enums/TransactionKind'
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import useExchangeRates from '../../utils/hooks/state-selectors/UseExchangeRates'

export enum BottomSheetKind {
  SWAN_STATUS_INFO,
  WYRE_STATUS_INFO,
  RAMP_STATUS_INFO,
}
interface HomeStateTypes {
  currencyCode?: string;
  strings: object;
}

interface HomePropsTypes {
  currencyCode: string;
  navigation: any;
  containerView: StyleProp<ViewStyle>;
  currentLevel: number;
  startRegistration: boolean;
  isFocused: boolean;
  setShowAllAccount: any;
  openBottomSheet: any;
  swanDeepLinkContent: string | null;
  markAccountChecked: any;
  exchangeRates?: any[];
}

export default function MyWalletsContainer( props ) {
  const { translations } = useContext( LocalizationContext )

  const accountShells = useActiveAccountShells()
  const showAllAccount = useSelector( ( state ) => state.accounts.showAllAccount )
  const dispatch = useDispatch()
  const [ accountShellID, setAccountShellID ] = useState( '' )
  const [ itemAccountShell, setItemAccountShell ] = useState( null )

  const currencyKind: CurrencyKind = useCurrencyKind()
  const fiatCurrencyCode = useCurrencyCode()
  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )
  const exchangeRates = useExchangeRates()

  useEffect( () => {
    dispatch( setShowAllAccount( true ) )
    setTimeout( () => {
      const dbWallet = dbManager.getWallet()
      if ( dbWallet != undefined && dbWallet != null ) {
        const walletObj = JSON.parse( JSON.stringify( dbWallet ) )
        const primaryMnemonic = walletObj.primaryMnemonic
        const seed = primaryMnemonic.split( ' ' )
        const seedData = seed.map( ( word, index ) => {
          return {
            name: word, id: ( index + 1 )
          }
        } )
        const i = 12
        let ranNums = 1
        const tempNumber = ( Math.floor( Math.random() * ( i ) ) )
        if ( tempNumber == undefined || tempNumber == 0 )
          ranNums = 1
        else ranNums = tempNumber
        const asyncSeedData = seedData[ ranNums ]
        AsyncStorage.setItem( 'randomSeedWord', JSON.stringify( asyncSeedData ) )
      }
    }, 2000 )

    setColumnData( getcolumnData )
  }, [] )

  const navigateToAddNewAccountScreen = () => {
    // props.navigation.navigate( 'AddNewAccount' )
    props.navigation.navigate( 'ScanNodeConfig', {
      currentSubAccount: null,
    } )
  }

  const getcolumnData = () => {
    if ( accountShells.length == 0 ) {
      return []
    }

    // if ( accountShells.length == 1 ) {
    //   return [ accountShells ]
    // }

    ///////////////////
    // Even though we're rendering the list as horizontally scrolling set of
    // 2-row columns, we want the appearance to be such that every group of four
    // is ordered row-wise. The logic below is for formatting the data in such
    // away that this will happen. (See: https://github.com/bithyve/hexa/issues/2250)
    ///////////////////

    const oddIndexedShells = Array.from( accountShells ).reduce( ( accumulated, current, index ) => {
      if ( index % 2 == 0 && ( current.primarySubAccount.visibility === AccountVisibility.DEFAULT || showAllAccount === true && current.primarySubAccount.visibility !== AccountVisibility.ARCHIVED ) ) {
        accumulated.push( current )
      }

      return accumulated
    }, [] )
    const evenIndexedShells = Array.from( accountShells ).reduce( ( accumulated, current, index ) => {
      if ( index % 2 == 1 && ( current.primarySubAccount.visibility === AccountVisibility.DEFAULT || showAllAccount === true && current.primarySubAccount.visibility !== AccountVisibility.ARCHIVED ) ) {
        accumulated.push( current )
      }

      return accumulated
    }, [] )
    const sortedShells: AccountShell[] = []
    let isChoosingEvenIndexedShells = true
    let isFirstShell = true

    while ( evenIndexedShells.length > 0 || oddIndexedShells.length > 0 ) {
      if ( isFirstShell ) {
        sortedShells.push( ...oddIndexedShells.splice( 0, 1 ) )
        isFirstShell = false
      } else {
        if ( isChoosingEvenIndexedShells ) {
          sortedShells.push( ...evenIndexedShells.splice( 0, 2 ) )
        } else {
          sortedShells.push( ...oddIndexedShells.splice( 0, 2 ) )
        }
        isChoosingEvenIndexedShells = !isChoosingEvenIndexedShells
      }
    }

    const shellCount = sortedShells.length
    const columns = []
    let currentColumn = []
    sortedShells.forEach( ( accountShell, index ) => {
      // if( accountShell.primarySubAccount.visibility === AccountVisibility.DEFAULT || showAllAccount === true ){
      if( accountShell.primarySubAccount.kind != SubAccountKind.TEST_ACCOUNT )
        currentColumn.push( accountShell )

      // Make a new column after adding two items -- or after adding the
      // very first item. This is because the first column
      // will only contain one item, since the "Add new" button will be placed
      // in front of everything.
      if ( currentColumn.length == 2 ) {
        columns.push( currentColumn )
        currentColumn = []
      }

      // If we're at the end and a partially filled column still exists,
      // push it.
      if ( index == shellCount - 1 && currentColumn.length > 0 ) {
        columns.push( currentColumn )
      }
      // }
    } )
    if ( columns[ columns?.length - 1 ]?.length === 1 && columns?.length !== 1 ) {
      columns[ columns.length - 1 ].push( 'add new' )
    } else {
      columns.push( [ 'add new' ] )
    }

    return columns
  }

  const [ columnData, setColumnData ] = useState( [] )

  useEffect( () => {
    columnData.map( ( item, index ) => {
      item?.map( ( innerItem, innerIndex ) => {
        if ( innerIndex == 0 ) {
          if ( index == 0 && typeof ( innerItem ) !== 'string' )
            handleAccountCardSelection( innerItem )
        }
        return
      } )
    } )
  }, [ columnData ] )

  const handleAccountCardSelection = ( selectedAccount: AccountShell ) => {
  // if (
  //   props.startRegistration &&
  //   selectedAccount.primarySubAccount.kind === SubAccountKind.SERVICE &&
  // ( selectedAccount.primarySubAccount as ExternalServiceSubAccountInfo ).serviceAccountKind === ServiceAccountKind.SWAN
  // ) {
  //   props.openBottomSheet( 6, null, true )

    // } else {
    if ( selectedAccount.primarySubAccount.hasNewTxn ) {
      dispatch( markAccountChecked( selectedAccount.id ) )
    }
    // if ( selectedAccount.primarySubAccount.type === AccountType.LIGHTNING_ACCOUNT ) {
    //   props.navigation.navigate( 'LNAccountDetails', {
    //     accountShellID: selectedAccount.id,
    //     swanDeepLinkContent: props.swanDeepLinkContent,
    //     node: selectedAccount.primarySubAccount.node
    //   } )
    // } else {
    //   props.navigation.navigate( 'AccountDetails', {
    //     accountShellID: selectedAccount.id,
    //     swanDeepLinkContent: props.swanDeepLinkContent
    //   } )
    // }
    console.log( 'skk selectedAccount', selectedAccount )
    setAccountShellID( selectedAccount.id )
    setItemAccountShell( selectedAccount )

  // }
  }

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  function keyExtractor( item: AccountShell[] ): string {
    return item[ 0 ].id
  }

  const handleGridCardLongPress = ( item ) => { }

  const onViewAllClick = () => {
    console.log( 'skk accountShellID', accountShellID )
    props.navigation.navigate( 'TransactionsList', {
      accountShellID,
    } )
  }

  // { typeof innerItem === 'string' ?
  const renderItems = ( { item, index } ) => {
    return (
      item?.map( ( innerItem ) => {
        return (
          typeof innerItem === 'string' ?
            <AddNewAccountCard
              containerStyle={{
                width: wp( 170 ),
                marginEnd: wp( 10 )
              }}
              onPress={navigateToAddNewAccountScreen}
            />
            :
            <TouchableOpacity style={{
              width: wp( 170 ),
              marginEnd: wp( 10 ),
              justifyContent: 'center'
            }}
            key={innerItem?.id}
            onPress={() => handleAccountCardSelection( innerItem )}
            onLongPress={() => handleGridCardLongPress( innerItem )}
            delayPressIn={0}
            activeOpacity={0.85}>
              <HomeAccountsListCard
                accountShell={innerItem}
                cardDisabled={false}
                accountShellID={accountShellID}
              />
            </TouchableOpacity>
        )
      } )
    )
  }

  const onSendClick = () => {
    dispatch( sourceAccountSelectedForSending( itemAccountShell ) )
    props.navigation.navigate( 'Send', {
      subAccountKind: itemAccountShell.primarySubAccount.kind,
    } )
  }

  const getTitle = ( transaction ) => {
    if ( transaction.transactionType === TransactionKind.RECEIVE ) {
      return transaction.sender || 'External address'
    } else {
      let name = ''
      if ( transaction.receivers ) {
        if ( transaction.receivers.length > 1 ) {
          name = `${transaction.receivers[ 0 ].name ? transaction.receivers[ 0 ].name : transaction.recipientAddresses[ 0 ]} and ${transaction.receivers.length - 1} other`
        } else {
          name = transaction.receivers[ 0 ] ? transaction.receivers[ 0 ].name ? transaction.receivers[ 0 ].name :
            transaction.recipientAddresses ? 'External address' : transaction.accountType || transaction.accountName : '' || transaction.accountType || transaction.accountName
        }
      } else {
        name = transaction.accountName ? transaction.accountName : transaction.accountType
      }
      return name
    }
  }

  const formattedDateText = ( transaction ) => {
    return new Date( transaction.date ).toLocaleDateString()
  }

  const amountToDisplay = ( balance ) => {
    const divisor = [ BitcoinUnit.SATS, BitcoinUnit.TSATS ]
      .includes( BitcoinUnit.SATS ) ? 1 : SATOSHIS_IN_BTC
    return balance / divisor
  }

  // const formattedBalanceText = isTestAccount ?
  //   UsNumberFormat( amountToDisplay )
  //   : useFormattedAmountText( amountToDisplay )

  const formattedBalanceText = ( item ) => {
    let balance = amountToDisplay( item.amount )
    if ( currencyKind === CurrencyKind.BITCOIN ) {
      let decimalCount = 0, decimal = '.', thousands = ','
      try {
        decimalCount = Math.abs( decimalCount )
        decimalCount = isNaN( decimalCount ) ? 2 : decimalCount
        const negativeSign = balance < 0 ? '-' : ''
        const i = parseInt( balance = Math.abs( Number( balance ) || 0 ).toFixed( decimalCount ) ).toString()
        const j = ( i.length > 3 ) ? i.length % 3 : 0
        return negativeSign + ( j ? i.substr( 0, j ) + thousands : '' ) + i.substr( j ).replace( /(\d{3})(?=\d)/g, '$1' + thousands ) + ( decimalCount ? decimal + Math.abs( balance - i ).toFixed( decimalCount ).slice( 2 ) : '' )
      } catch ( e ) {
      // console.log(e)
      }
    // return UsNumberFormat( balance )
    } else if (
      exchangeRates !== undefined &&
    exchangeRates[ fiatCurrencyCode ] !== undefined &&
    exchangeRates[ fiatCurrencyCode ].last !== undefined
    ) {
      return (
        ( balance / SATOSHIS_IN_BTC ) * exchangeRates[ fiatCurrencyCode ].last
      ).toFixed( 2 )
    } else {
      return `${balance}`
    }
    return useFormattedAmountText( amountToDisplay( item.amount ) )
  }

  const handleTransactionSelection = ( transaction ) => {
    props.navigation.navigate( 'TransactionDetails', {
      transaction,
      accountShellID,
    } )
  }

  const renderWalletItem = ( { item, index } ) => {
    return (
      <TouchableOpacity style={{
        justifyContent: 'center', alignItems: 'center',
        marginHorizontal: wp( 27 ), flexDirection: 'row',
        marginBottom: wp( 27 )
      }} onPress={()=>handleTransactionSelection( item )}>
        {
          item.transactionType === TransactionKind.SEND
            ?
            <Image source={require( '../../assets/images/accIcons/sent_out.png' )} style={{
              width: wp( 30 ), height: wp( 30 )
            }} />
            :
            <Image source={require( '../../assets/images/accIcons/received.png' )} style={{
              width: wp( 30 ), height: wp( 30 )
            }} />
        }
        <View style={{
          marginHorizontal: wp( 15 ), flex: 1
        }}>
          <Text style={{
            letterSpacing: 0.6, color: Colors.greyText,
            fontSize: RFValue( 12 ), fontFamily: Fonts.RobotoSlabRegular
          }}>{getTitle( item )}</Text>
          <Text style={{
            letterSpacing: 0.5, color: Colors.greyText,
            fontSize: RFValue( 10 ), marginTop: wp( 3 ),
            fontFamily: Fonts.RobotoSlabLight
          }}>{formattedDateText( item )}</Text>
        </View>
        <BalanceCurrencyIcon />
        <Text style={{
          letterSpacing: 0.95, color: Colors.greyText,
          fontSize: RFValue( 19 ), marginStart: wp( 7 ),
          fontFamily: Fonts.RobotoSlabRegular
        }}>{formattedBalanceText( item )}</Text>
        <Image style={{
          width: wp( 5 ), height: hp( 8 ), marginStart: wp( 13 ),
          tintColor: Colors.gray18
        }}
        source={require( '../../assets/images/icons/icon_arrow.png' )} />
      </TouchableOpacity>
    )
  }

  const bitcoinIconColor = 'gray'
  const bitcoinIconSource = useMemo( () => {
    switch ( bitcoinIconColor ) {
    // case 'dark':
    //   return require( '../../assets/images/currencySymbols/icon_bitcoin_dark.png' )
    // case 'light':
    //   return require( '../../assets/images/currencySymbols/icon_bitcoin_light.png' )
        case 'gray':
          return require( '../../assets/images/currencySymbols/icon_bitcoin_gray.png' )
        default:
          return require( '../../assets/images/currencySymbols/icon_bitcoin_gray.png' )
    }
  }, [ bitcoinIconColor ] )

  const BalanceCurrencyIcon = () => {
    const style = {
      ...styles.currencyImage
    }

    if ( prefersBitcoin ) {
      return <Image style={{
        ...style, marginStart: wp( 3 ), marginEnd: wp( 5 )
      }} source={bitcoinIconSource} />
    }

    if ( materialIconCurrencyCodes.includes( fiatCurrencyCode ) ) {
      return (
        <MaterialCurrencyCodeIcon
          currencyCode={fiatCurrencyCode}
          color={Colors.gray2}
          size={RFValue( 20 )}
          style={{
          }}
        />
      )
    }
    else {
      return (
        <Image
          style={style}
          source={getCurrencyImageByRegion( fiatCurrencyCode, bitcoinIconColor )}
        />
      )
    }
  }

  const onReceiveClick = () => {
    props.navigation.navigate( 'Receive', {
      accountShell: itemAccountShell,
    } )
  }

  return (
    <View style={{
      backgroundColor: Colors.white, flex: 1
    }}>
      <SafeAreaView style={{
        backgroundColor: Colors.appPrimary
      }} />
      <StatusBar backgroundColor={Colors.appPrimary} barStyle="dark-content" />
      <View style={{
        backgroundColor: Colors.appPrimary
      }}>
        <CustomToolbar
          onBackPressed={() => props.navigation.goBack()}
          toolbarTitle={'My Wallets'}
          containerStyle={{
            borderBottomStartRadius: 0,
            marginTop: hp( 40 )
          }} />
      </View>
      <View style={{
        height: hp( 210 ), backgroundColor: Colors.appPrimary,
        borderBottomStartRadius: 25, alignItems: 'center'
      }}>
        <FlatList
          horizontal
          contentContainerStyle={{
            marginVertical: hp( 28 ),
            paddingHorizontal: wp( 30 )
          }}
          showsHorizontalScrollIndicator={false}
          data={columnData}
          keyExtractor={keyExtractor}
          renderItem={renderItems} />
      </View>
      <View style={{
        flex: 1
      }}>
        <View style={{
          flexDirection: 'row', marginTop: hp( 33 ), marginStart: wp( 33 ), marginEnd: wp( 30 )
        }}>
          <Text style={{
            color: Colors.greyText, fontFamily: Fonts.RobotoSlabRegular, fontSize: RFValue( 16 ),
            letterSpacing: 1.28
          }}>{'Transactions'}</Text>
          <View style={{
            flex: 1
          }} />
          <TouchableOpacity style={{
            flexDirection: 'row', alignItems: 'center'
          }} onPress={onViewAllClick}>
            <Text style={{
              color: Colors.appPrimary, fontFamily: Fonts.RobotoSlabBold, fontSize: RFValue( 11 ),
              letterSpacing: 1.28
            }}>
            View All
            </Text>
            <Image style={{
              width: wp( 5 ), height: hp( 8 ), marginStart: wp( 4 ), tintColor: Colors.black3
            }}
            source={require( '../../assets/images/icons/icon_arrow.png' )} />
          </TouchableOpacity>
        </View>
        <FlatList
          style={{
            marginTop: wp( 45 )
          }}
          data={itemAccountShell ? AccountShell.getAllTransactions( itemAccountShell )?.slice( 0, 3 ) : []}
          keyExtractor={( item, index ) => item?.id}
          renderItem={renderWalletItem}
        />
      </View>
      <View style={{
        flexDirection: 'row', marginBottom: hp( 30 ), justifyContent: 'center'
      }}>
        <TouchableOpacity style={{
          alignItems: 'center'
        }} onPress={onSendClick}>
          <Image source={require( '../../assets/images/accIcons/send_blue.png' )} style={{
            width: wp( 38 ), height: wp( 38 )
          }} />
          <Text style={{
            fontSize: RFValue( 10 ), color: Colors.black1,
            fontFamily: Fonts.RobotoSlabRegular, marginTop: hp( 9 ),
            marginHorizontal: wp( 30 )
          }}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{
          alignItems: 'center'
        }} onPress={onReceiveClick}>
          <Image source={require( '../../assets/images/accIcons/receive_red.png' )} style={{
            width: wp( 38 ), height: wp( 38 )
          }} />
          <Text style={{
            fontSize: RFValue( 10 ), color: Colors.black1,
            fontFamily: Fonts.RobotoSlabRegular, marginTop: hp( 9 ),
            marginHorizontal: wp( 30 )
          }}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{
          alignItems: 'center'
        }} onPress={()=>{
          props.navigation.navigate( 'SubAccountSettings', {
            accountShellID,
          } )
        }}>
          <Image source={require( '../../assets/images/accIcons/settings.png' )} style={{
            width: wp( 38 ), height: wp( 38 )
          }} />
          <Text style={{
            fontSize: RFValue( 10 ), color: Colors.black1,
            fontFamily: Fonts.RobotoSlabRegular, marginTop: hp( 9 ),
            marginHorizontal: wp( 30 )
          }}>Settings</Text>
        </TouchableOpacity>
      </View>
      <SafeAreaView />
    </View>
  )
}


const styles = StyleSheet.create( {
  currencyImage: {
    width: wp( 12 ),
    height: wp( 18 ),
    resizeMode: 'contain',
    tintColor: Colors.gray2
    // marginTop: wp( 0.3 )
  },
} )
{/* const mapStateToProps = ( state ) => {
  return {
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    currentLevel: idx( state, ( _ ) => _.bhr.currentLevel ),
    startRegistration: idx( state, ( _ ) => _.swanIntegration.startRegistration ),
    exchangeRates: idx( state, ( _ ) => _.accounts.exchangeRates ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    setShowAllAccount,
    markAccountChecked
  } )( MyWalletsContainer )
) */}
