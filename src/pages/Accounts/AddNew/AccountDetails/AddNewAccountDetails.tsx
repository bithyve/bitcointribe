import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NewAccountPayload } from '../../../../common/data/models/NewAccountPayload';
import NavigationHeader from '../NavigationHeader';

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
      <Text>Details</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});


AddNewCheckingAccountDetails.navigationOptions = ({ navigation, navigationOptions }) => {
  const { params } = navigation.state;

  return {
    header: ({ scene, previous, navigation }) => {
      const currentPayload: NewAccountPayload = params.currentPayload;
      const title = `Enter details for the new ${currentPayload.title}`;

      return <NavigationHeader
        title={title}
        titleStyle={{ fontSize: 18, fontWeight: '400' }}
        onBackPress={() => navigation.pop()}
      />
    },
  };
};

export default AddNewCheckingAccountDetails;
