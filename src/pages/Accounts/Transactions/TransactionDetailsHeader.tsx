import React, { useMemo } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useAccountShellForID from '../../../utils/hooks/state-selectors/accounts/UseAccountShellForID'
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import Colors from '../../../common/Colors'
import ImageStyles from '../../../common/Styles/ImageStyles'
import ListStyles from '../../../common/Styles/ListStyles'
import { Icon } from 'react-native-elements'
import moment from 'moment'
import TransactionKind from '../../../common/data/enums/TransactionKind'
import getAvatarForSubAccount from '../../../utils/accounts/GetAvatarForSubAccountKind'
import LabeledBalanceDisplay from '../../../components/LabeledBalanceDisplay'
import { widthPercentageToDP } from 'react-native-responsive-screen'

export type Props = {
  transaction: TransactionDescribing;
  accountShellID: string;
};


const TransactionDetailsHeader: React.FC<Props> = ( {
  transaction,
  accountShellID,
}: Props ) => {
  const primarySubAccount = usePrimarySubAccountForShell(
    useAccountShellForID( accountShellID )
  )

  const transactionKindIconName = useMemo( () => {
    switch ( transaction.transactionType ) {
        case TransactionKind.RECEIVE:
          return 'long-arrow-down'
        case TransactionKind.SEND:
          return 'long-arrow-up'
    }
  }, [ transaction.transactionType ] )

  const transactionKindIconColor = useMemo( () => {
    switch ( transaction.transactionType ) {
        case TransactionKind.RECEIVE:
          return Colors.green
        case TransactionKind.SEND:
          return Colors.red
    }
  }, [ transaction.transactionType ] )

  const title = useMemo( () => {
    if( transaction.transactionType === TransactionKind.RECEIVE ) {
      return transaction.sender || ( transaction.accountName? transaction.accountName: transaction.accountType )
    } else {
      let name = ''
      if( transaction.receivers ) {
        if( transaction.receivers.length > 1 ) {
          name = `${transaction.receivers.length} Recipients`
        } else {
          name = transaction.receivers[ 0 ].name ||  transaction.accountType || transaction.accountName
        }
      } else {
        name = transaction.accountName? transaction.accountName: transaction.accountType
      }
      return name
    }
  }, [ transaction.transactionType ] )

  return (
    <View style={styles.rootContainer}>
      <View style={styles.contentContainer}>
        <Image
          source={getAvatarForSubAccount( primarySubAccount, false, true )}
          style={styles.avatarImage}
          resizeMode="contain"
        />

        <View style={{
          flex: 1
        }}>
          <Text
            style={ListStyles.listItemTitle}
            numberOfLines={1}
          >
            {title}
          </Text>

          <Text
            style={ListStyles.listItemSubtitle}
            numberOfLines={2}
          >
            {moment( transaction.date ).format( 'DD/MM/YY • hh:MM A' )}
          </Text>
        </View>
        <LabeledBalanceDisplay
          balance={transaction.amount}
          isTestAccount={primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT}
          unitTextStyle={{
            ...ListStyles.listItemSubtitle, marginBottom: 3
          }}
          amountTextStyle={{
            ...ListStyles.textAmt, marginBottom: -3, marginLeft: -2, color: transactionKindIconColor
          }}
          currencyImageStyle={{
            marginBottom: -3
          }}
        />
        {/* <Icon
          // style={styles.transactionKindIcon}
          name={transactionKindIconName}
          type={'font-awesome'}
          color={transactionKindIconColor}
          size={13}
        /> */}

      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: 'white',
    margin: 10,
    elevation: 4,
    borderRadius: 8,
  },

  contentContainer: {
    flexDirection: 'row',
    alignContent: 'center',
  },

  avatarImage: {
    // ...ImageStyles.thumbnailImageMedium,
    width: widthPercentageToDP( 12 ),
    height: widthPercentageToDP( 12 ),
    marginRight: 14,
    // borderRadius: 9999,
  },
} )

export default TransactionDetailsHeader
