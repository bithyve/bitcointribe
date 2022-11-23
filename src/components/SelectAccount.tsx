import idx from 'idx'
import React, { FC, useMemo, useState } from 'react'
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import { AccountType } from '../bitcoin/utilities/Interface'
import CurrencyKind from '../common/data/enums/CurrencyKind'
import AccountShell from '../common/data/models/AccountShell'
import { AccountsState } from '../store/reducers/accounts'
import useActiveAccountShells from '../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import useCurrencyCode from '../utils/hooks/state-selectors/UseCurrencyCode'
import Colors from '../common/Colors'
import { hp, wp } from '../common/data/responsiveness/responsive'
import getAvatarForSubAccount from '../utils/accounts/GetAvatarForSubAccountKind'
import { SATOSHIS_IN_BTC } from '../common/constants/Bitcoin'
import { UsNumberFormat } from '../common/utilities'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../common/Fonts'
import ModalContainer from './home/ModalContainer'

const SelectAccount: FC<{onSelect: ( item: any ) => void}> = ( { onSelect } ) => {
  const [ accountListModal, setAccountListModal ] = useState( false )
  const accountState: AccountsState = useSelector( ( state ) =>
    idx( state, ( _ ) => _.accounts )
  )
  const currencyCode = useSelector( ( state ) => state.preferences.currencyCode )
  const accountShells: AccountShell[] = accountState.accountShells

  const accountsState: AccountsState = useSelector( ( state ) => state.accounts )
  const fiatCurrencyCode = useCurrencyCode()

  const currencyKind: CurrencyKind = useSelector(
    ( state ) => state.preferences.giftCurrencyKind || CurrencyKind.BITCOIN
  )

  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  const activeAccounts = useActiveAccountShells().filter(
    ( shell ) => shell?.primarySubAccount.type !== AccountType.LIGHTNING_ACCOUNT
  )

  const defaultGiftAccount = accountShells.find(
    ( shell ) =>
      shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT &&
      shell.primarySubAccount.instanceNumber === 0
  )

  const [ selectedAccount, setSelectedAccount ]: [AccountShell, any] = useState( defaultGiftAccount )

  const renderAccountList = () => {
    return (
      <ScrollView
        style={{
          height: 'auto',
        }}
      >
        {activeAccounts.map( ( item, index ) => {
          if (
            [ AccountType.TEST_ACCOUNT, AccountType.SWAN_ACCOUNT ].includes(
              item.primarySubAccount.type
            ) ||
            !item.primarySubAccount.isUsable ||
            item.primarySubAccount.isTFAEnabled
          )
            return
          return (
            <View
              key={index}
              style={{
                backgroundColor: Colors.white,
              }}
            >
              {accountElement( item, () => {
                onSelect( item )
                setSelectedAccount( item )
                setAccountListModal( false )
              } )}
            </View>
          )
        } )}
      </ScrollView>
    )
  }

  const accountElement = (
    item,
    onPressCallBack,
    activeOpacity = 0,
    width = '90%',
  ) => {
    return (
      <TouchableOpacity
        style={{
          ...styles.accountSelectionView,
          width: width,
        }}
        onPress={() => onPressCallBack()}
        activeOpacity={activeOpacity}
      >
        <View
          style={{
            borderRadius: wp( 2 ),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              paddingVertical: hp( 10 ),
              paddingHorizontal: wp( 2 ),
              alignItems: 'center',
              backgroundColor: Colors.white,
            }}
          >
            <View
              style={{
                width: wp( 38 ),
                height: '100%',
                marginTop: hp( 30 ),
                marginRight: wp( 11 ),
              }}
            >
              {getAvatarForSubAccount( item.primarySubAccount, false, true )}
            </View>
            <View
              style={{
                marginHorizontal: wp( 3 ),
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: Colors.black,
                  fontSize: RFValue( 14 ),
                  fontFamily: Fonts.RobotoSlabRegular,
                }}
              >
                From {item.primarySubAccount.customDisplayName ??
                  item.primarySubAccount.defaultTitle}
              </Text>
              <Text style={styles.availableToSpendText}>
                {'Available '}
                <Text style={styles.balanceText}>
                  {prefersBitcoin
                    ? UsNumberFormat(
                      item.primarySubAccount?.balances?.confirmed
                    )
                    : accountsState.exchangeRates &&
                      accountsState.exchangeRates[ currencyCode ]
                      ? (
                        ( item.primarySubAccount?.balances?.confirmed /
                          SATOSHIS_IN_BTC ) *
                        accountsState.exchangeRates[ currencyCode ].last
                      ).toFixed( 2 )
                      : 0}
                </Text>
                <Text>{prefersBitcoin ? ' sats' : ` ${fiatCurrencyCode}`}</Text>
              </Text>
            </View>
            {activeOpacity === 0 && (
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={24}
                color="gray"
                style={{
                  alignSelf: 'center',
                }}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <>
      <View>
        {accountElement( selectedAccount, () =>
          setAccountListModal( !accountListModal )
        )}
      </View>
      <ModalContainer
        onBackground={() => setAccountListModal( false )}
        visible={accountListModal}
        closeBottomSheet={() => setAccountListModal( false )}
      >
        {renderAccountList()}
      </ModalContainer>
    </>
  )
}

const styles = StyleSheet.create( {
  accountSelectionView: {
    width: '90%',
    alignSelf: 'center',
    marginTop: hp( 2 ),
    marginBottom: hp( 2 ),
  },
  availableToSpendText: {
    color: '#505050',
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.RobotoSlabLight,
    lineHeight: 15,
  },
  balanceText: {
    color: '#505050',
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.RobotoSlabLight,
    lineHeight: 15,
  },
} )

export default SelectAccount
