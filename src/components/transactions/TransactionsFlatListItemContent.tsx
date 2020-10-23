import React, { useMemo } from 'react';
import { StyleSheet, Image } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import moment from 'moment';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { TransactionDetails } from '../../bitcoin/utilities/Interface';
import { FAST_BITCOINS, SUB_PRIMARY_ACCOUNT } from '../../common/constants/serviceTypes';
import { UsNumberFormat } from '../../common/utilities';

export type Props = {
  transaction: TransactionDetails;
};

const TransactionsFlatListItemContent: React.FC<Props> = ({
  transaction,
}: Props) => {
  const transactionKindIconName = useMemo(() => {
    return `long-arrow-${transaction.transactionType === 'Received' ? 'down' : 'up'}`;
  }, [transaction.transactionType]);

  const transactionKindIconColor = useMemo(() => {
    return transaction.transactionType === 'Received' ? Colors.green : Colors.red;
  }, [transaction.transactionType]);


  const amountTextStyle = useMemo(() => {
    return {
      ...styles.amountText,
      color: transactionKindIconColor,
    };
  }, [transaction.transactionType, transactionKindIconColor]);


  const formattedDateText = useMemo(() => {
    return moment(transaction.date).format('DD MMMM YYYY');
  }, [transaction.date]);


  const formattedConfirmationsText = useMemo(() => {
    return transaction.accountType === 'Test Account' ?
      transaction.confirmations < 6 ?
        transaction.confirmations
        // for testnet faucet tx
        : transaction.confirmations === -1 ?
          transaction.confirmations
          : '6+'
      : transaction.confirmations < 6 ?
        transaction.confirmations
        : '6+';
  }, [transaction.confirmations]);


  const messageText = useMemo(() => {
    if (transaction.message && transaction.message.length > 0) {
      return transaction.message;
    }

    return transaction.accountType == FAST_BITCOINS ?
    'FastBitcoins.com'
    : transaction.accountType === SUB_PRIMARY_ACCOUNT ?
    transaction.primaryAccType
    : transaction.accountType
  }, [transaction.accountType, transaction.message]);


  // const formattedAmountText = useFormattedAmountText(transaction.amount);
  const formattedAmountText = useMemo(() => {
    return UsNumberFormat(transaction.amount);
  }, [transaction.amount]);


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
        <ListItem.Title style={styles.titleText} numberOfLines={1}>
          {messageText}
        </ListItem.Title>
        <ListItem.Subtitle style={styles.subtitleText}>
          {formattedDateText}
        </ListItem.Subtitle>
      </ListItem.Content>

      <ListItem.Content style={styles.amountSection}>
        <Image
          source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
          style={styles.bitcoinImage}
        />
        <ListItem.Title style={amountTextStyle}>{formattedAmountText}</ListItem.Title>
        <ListItem.Subtitle
          style={styles.confirmationsText}
        >
          {formattedConfirmationsText}
        </ListItem.Subtitle>
      </ListItem.Content>

      <ListItem.Chevron />
    </>
  );
};

const styles = StyleSheet.create({
  transactionKindIcon: {
    marginRight: 14,
  },

  titleSection: {
    flex: 1,
    paddingHorizontal: 10,
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
    paddingHorizontal: 10,
  },

  amountText: {
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue(17),
    marginRight: 5,
  },

  confirmationsText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.OpenSans,
  },
});

export default TransactionsFlatListItemContent;
