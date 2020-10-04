import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AccountPayload from '../../../common/data/models/AccountPayload/Interfaces';
import useActiveAccountPayload from '../../../utils/hooks/state-selectors/UseActiveAccountPayload';

export type Props = {
  navigation: any;
};

const AccountSettingsMainScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const accountID = useMemo(() => {
    return navigation.getParam('accountID');
  }, [navigation]);

  const accountPayload: AccountPayload | undefined = useActiveAccountPayload(accountID);

  return (
    <View style={styles.rootContainer}>
      <Text>AccountSettingsMainScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default AccountSettingsMainScreen;
