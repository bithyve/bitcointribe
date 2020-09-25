import React, { useMemo } from 'react';
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
  const navHeaderTitle = useMemo(() => {
    return "Enter details for the new Checking Account";
  }, [currentPayload]);

  return (
    <View style={styles.rootContainer}>
      <Text>AddNewAccountDetails</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default AddNewCheckingAccountDetails;
