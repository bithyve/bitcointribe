import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'

export type Props = {
  navigation: any;
  route: any;
};


const TransactionDetailsScreenContainer: React.FC<Props> = ( {
  navigation,
  route
}: Props ) => {
  const transactionID: TransactionDescribing = useMemo( () => {
    return route.params?.txID
  }, [ navigation ] )

  // const transaction: TransactionDescribing = useTransactionDescription(transactionID);

  return (
    <View style={styles.rootContainer}>
      <Text>New TransactionDetails Container</Text>
      <Text>Transaction ID: {transactionID}</Text>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
  }
} )

export default TransactionDetailsScreenContainer
