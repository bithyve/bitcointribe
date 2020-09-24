import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NewAccountPayload } from '../../../../common/data/models/NewAccountPayload';

export interface Props {
  navigation: any,
  currentPayload: NewAccountPayload,
}


const AddNewCheckingAccountDetails: React.FC<Props> = ({
  navigation,
  currentPayload,
}: Props) => {
  return (
    <View style={styles.rootContainer}>
      <Text>AddNewCheckingAccountDetails</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default AddNewCheckingAccountDetails;
