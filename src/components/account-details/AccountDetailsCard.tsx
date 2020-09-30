import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AccountPayload from '../../common/data/models/AccountPayload/Interfaces';

export type Props = {
  accountPayload: AccountPayload;
  onKnowMorePressed: () => void;
  onSettingsPressed: () => void;
};

const AccountDetailsCard: React.FC<Props> = ({
  accountPayload,
  onKnowMorePressed,
  onSettingsPressed,
}: Props) => {
  return (
    <View style={styles.rootContainer}>
      <Text>AccountDetailsCard</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default AccountDetailsCard;
