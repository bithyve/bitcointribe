import React, { useMemo } from 'react';
import { StyleSheet, Image } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import TransactionKind from '../../common/data/enums/TransactionKind';
import { TransactionDescribing } from '../../common/data/models/Transactions/Interfaces';
import moment from 'moment';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText';

export type Props = {
  transaction: TransactionDescribing,
};

const AccountDetailsTransactionsListItem: React.FC<Props> = ({
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

  const formattedAmountText = useFormattedAmountText(transaction.amount);

  return (
    <ListItem bottomDivider>
      <Icon name={transactionKindIconName} type={"font-awesome"} color={transactionKindIconColor} size={13} />

      <ListItem.Content style={styles.titleSection}>
        <ListItem.Title style={styles.titleText} numberOfLines={1}>{transaction.message}</ListItem.Title>
        <ListItem.Subtitle style={styles.subtitleText}>{formattedDateText}</ListItem.Subtitle>
      </ListItem.Content>

      <ListItem.Content style={styles.amountSection}>
        <Image
          source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
          style={styles.bitcoinImage}
        />
        <ListItem.Title style={amountTextStyle}>{formattedAmountText}</ListItem.Title>
      </ListItem.Content>

      <ListItem.Chevron />
    </ListItem>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
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
    marginRight: 5,
  },

  amountSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  amountText: {
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue(17),
  },
});

export default AccountDetailsTransactionsListItem;
