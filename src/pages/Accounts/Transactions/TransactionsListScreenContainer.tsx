import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Props = {
  navigation: any;
};


const TransactionsListScreenContainer: React.FC<Props> = ({
  navigation,
}: Props) => {

  const accountID = useMemo(() => {
    return navigation.getParam('accountID');
  }, [navigation]);

  return (
    <View style={styles.rootContainer}>
      <Text>TransactionsListScreenContainer</Text>
      <Text>Account ID: {accountID}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default TransactionsListScreenContainer;
