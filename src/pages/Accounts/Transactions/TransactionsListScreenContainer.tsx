import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Props = {
  navigation: any;
};


const TransactionsListScreenContainer: React.FC<Props> = ({
  navigation,
}: Props) => {

  const accountShellID = useMemo(() => {
    return navigation.getParam('accountShellID');
  }, [navigation]);

  return (
    <View style={styles.rootContainer}>
      <Text>TransactionsListScreenContainer</Text>
      <Text>Account ID: {accountShellID}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default TransactionsListScreenContainer;
