import React, { useMemo } from 'react';
import { StyleSheet, Image } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import TransactionKind from '../../common/data/enums/TransactionKind';
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces';
import moment from 'moment';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import LabeledBalanceDisplay from '../accounts/LabeledBalanceDisplay';

export type Props = {
  transaction: TransactionDescribing;
};

const TransactionListItemContent: React.FC<Props> = ({
  transaction,
}: Props) => {
  const transactionKindIconName = useMemo(() => {
    switch (transaction.transactionKind) {
      case TransactionKind.RECEIVE:
        return 'long-arrow-down';
      case TransactionKind.SEND:
        return 'long-arrow-up';
    }
  }, [transaction.transactionKind]);

  const transactionKindIconColor = useMemo(() => {
    switch (transaction.transactionKind) {
      case TransactionKind.RECEIVE:
        return Colors.green;
      case TransactionKind.SEND:
        return Colors.red;
    }
  }, [transaction.transactionKind]);

  const amountTextStyle = useMemo(() => {
    return {
      ...styles.amountText,
      color: transactionKindIconColor,
    };
  }, [transaction.transactionKind]);

  const formattedDateText = useMemo(() => {
    return moment(transaction.timestamp).format('DD MMMM YYYY');
  }, [transaction.transactionKind]);

  return (
    <>
      <Icon
        style={styles.transactionKindIcon}
        name={transactionKindIconName}
        type={"font-awesome"}
        color={transactionKindIconColor}
        size={13}
      />

      <ListItem.Content style={styles.titleSection}>
        <ListItem.Title style={styles.titleText} numberOfLines={1}>{transaction.message}</ListItem.Title>
        <ListItem.Subtitle style={styles.subtitleText}>{formattedDateText}</ListItem.Subtitle>
      </ListItem.Content>

      <ListItem.Content style={styles.amountSection}>
        <LabeledBalanceDisplay
          balance={transaction.amount}
          amountTextStyle={amountTextStyle}
          currencyImageStyle={styles.bitcoinImage}
          iconSpacing={2}
          bitcoinIconColor='gray'
          textColor='gray'
        />
      </ListItem.Content>
    </>
  );
};

const styles = StyleSheet.create({
  transactionKindIcon: {
    marginRight: 14,
  },

  titleSection: {
    flex: 1,
  },

  titleText: {
    color: Colors.blue,
    fontSize: RFValue(12),
    marginBottom: 2,
  },

  subtitleText: {
    fontSize: RFValue(10),
  },

  bitcoinImage: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    alignSelf: 'center',
  },

  amountSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginLeft: 16,
  },

  amountText: {
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue(17),
  },
});

export default TransactionListItemContent;
