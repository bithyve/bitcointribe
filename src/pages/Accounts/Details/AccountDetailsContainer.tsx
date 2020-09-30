import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AccountPayload from '../../../common/data/models/AccountPayload/Interfaces';
import useAccountPayload from '../../../utils/hooks/state-selectors/UseActiveAccountPayload';
import NavigationHeader from '../AddNew/NavigationHeader';
import NavHeader from '../../../components/account-details/AccountDetailsNavHeader';
import AccountDetailsCard from '../../../components/account-details/AccountDetailsCard';

export type Props = {
  navigation: any;
};

const AccountDetailsContainer: React.FC<Props> = ({
  navigation,
}) => {
  const accountID = useMemo(() => {
    return navigation.getParam('accountID');
  }, [navigation]);

  const accountPayload: AccountPayload | undefined = useAccountPayload(accountID);

  return (
    <View style={styles.rootContainer}>
      {/* <NavHeader
        title={accountPayload.customDisplayName || accountPayload.title}
        onBackPressed={() => navigation.goBack() }
      /> */}

      <AccountDetailsCard
        accountPayload={accountPayload}
        onKnowMorePressed={() => {}}
        onSettingsPressed={() => {}}
      />

      {/* <TransactionPreviewHeader
        onViewMorePressed={navivateToTransactionsList}
      /> */}

      {/* <TransactionPreviewTabs  */}

      {/* /> */}

      {/* <TransactionPreviewItems
        onItemSelected={navigateToTransactionDetails}
      /> */}

      {/* <SendAndReceiveButtonsFooter
        onSendPressed={() => { }}
        onReceivePressed={() => { }}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

AccountDetailsContainer.navigationOptions = ({ _navigation, _navigationOptions }) => {
  return {
    header: ({ _scene, _previous, navigation }) => {
      const { accountID } = navigation.state.params;

      return <NavHeader
        accountID={accountID}
        onBackPressed={() => navigation.goBack()}
      />;
    },
  };
};

export default AccountDetailsContainer;
