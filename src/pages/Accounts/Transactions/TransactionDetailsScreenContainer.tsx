import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TransactionDescribing } from '../../../common/data/models/Transactions/Interfaces';

export type Props = {
  navigation: any;
};


const TransactionDetailsScreenContainer: React.FC<Props> = ({
  navigation,
}: Props) => {
  const transactionID: TransactionDescribing = useMemo(() => {
    return navigation.getParam('txID');
  }, [navigation]);

  // const transaction: TransactionDescribing = useTransactionDescription(transactionID);

  return (
    <View style={styles.rootContainer}>
      <Text>New TransactionDetails Container</Text>
      <Text>Transaction ID: {transactionID}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

TransactionDetailsScreenContainer.navigationOptions = ({ _navigation, _navigationOptions }) => {
  return {
    // header: ({ _scene, _previous, navigation }) => {
    //   const { accountID } = navigation.state.params;

    //   return <NavHeader
    //     accountID={accountID}
    //     onBackPressed={() => navigation.goBack()}
    //   />;
    // },
  };
};

export default TransactionDetailsScreenContainer;
