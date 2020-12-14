import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import SubAccountKind from '../../../common/data/enums/SubAccountKind';
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces';
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell';
import useAccountShellForID from '../../../utils/hooks/state-selectors/accounts/UseAccountShellForID';
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';
import Colors from '../../../common/Colors';
import ImageStyles from '../../../common/Styles/ImageStyles';
import ListStyles from '../../../common/Styles/ListStyles';
import { Icon } from 'react-native-elements';
import TransactionKind from '../../../common/data/enums/TransactionKind';
import getAvatarForSubAccount from '../../../utils/accounts/GetAvatarForSubAccountKind';

export type Props = {
  transaction: TransactionDescribing;
  accountShellID: string;
};


const TransactionDetailsHeader: React.FC<Props> = ({
  transaction,
  accountShellID,
}: Props) => {

  const primarySubAccount = usePrimarySubAccountForShell(
    useAccountShellForID(accountShellID)
  );

  const transactionKindIconName = useMemo(() => {
    switch (transaction.transactionType) {
      case TransactionKind.RECEIVE:
        return 'long-arrow-down';
      case TransactionKind.SEND:
        return 'long-arrow-up';
    }
  }, [transaction.transactionType]);

  const transactionKindIconColor = useMemo(() => {
    switch (transaction.transactionType) {
      case TransactionKind.RECEIVE:
        return Colors.green;
      case TransactionKind.SEND:
        return Colors.red;
    }
  }, [transaction.transactionType]);

  return (
    <View style={styles.rootContainer}>
      <View style={styles.contentContainer}>
        <Image
          source={getAvatarForSubAccount(primarySubAccount)}
          style={styles.avatarImage}
          resizeMode="contain"
        />

        <View style={{ flex: 1 }}>
          <Text
            style={ListStyles.listItemTitle}
            numberOfLines={1}
          >
            {primarySubAccount.customDisplayName || primarySubAccount.defaultTitle}
          </Text>

          <Text
            style={ListStyles.listItemSubtitle}
            numberOfLines={2}
          >
            {primarySubAccount.customDescription || primarySubAccount.defaultDescription}
          </Text>
        </View>

        <Icon
          // style={styles.transactionKindIcon}
          name={transactionKindIconName}
          type={'font-awesome'}
          color={transactionKindIconColor}
          size={13}
        />

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },

  contentContainer: {
    flexDirection: 'row',
    alignContent: 'center',
  },

  avatarImage: {
    ...ImageStyles.thumbnailImageMedium,
    marginRight: 14,
    borderRadius: 9999,
  },
});

export default TransactionDetailsHeader;
