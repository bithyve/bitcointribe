import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AccountPayload from '../../../common/data/models/AccountPayload/Interfaces';
import useAccountPayload from '../../../utils/hooks/state-selectors/UseActiveAccountPayload';
import NavHeader from '../../../components/account-details/AccountDetailsNavHeader';
import AccountDetailsCard from '../../../components/account-details/AccountDetailsCard';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../common/Colors';
import Fonts from '../../../common/Fonts';
import TransactionsList from '../../../components/account-details/AccountDetailsTransactionsList';
import sampleTransactions from './SampleTransactions';
import { TransactionDescribing } from '../../../common/data/models/Transactions/Interfaces';
import SendAndReceiveButtonsFooter from './SendAndReceiveButtonsFooter';


export type Props = {
  navigation: any;
};

export type TransactionPreviewHeaderProps = {
  onViewMorePressed: () => void;
}

const TransactionPreviewHeader: React.FC<TransactionPreviewHeaderProps> = ({
  onViewMorePressed,
}: TransactionPreviewHeaderProps) => {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 42, justifyContent: 'space-between' }}>
      <Text style={styles.transactionPreviewHeaderDateText}>Today</Text>

      <TouchableOpacity
        style={{ marginLeft: 'auto', flex: 0 }}
        onPress={onViewMorePressed}
      >
        <Text style={styles.transactionPreviewHeaderTouchableText}>View More</Text>
      </TouchableOpacity>
    </View>
  );
};


const AccountDetailsScreenContainer: React.FC<Props> = ({
  navigation,
}) => {
  const accountID = useMemo(() => {
    return navigation.getParam('accountID');
  }, [navigation]);

  const accountPayload: AccountPayload | undefined = useAccountPayload(accountID);

  // TODO: Implement a hook that fetches transactions for an account and use it here.
  // const [accountTransactions, isFetchingTransactions] = useTransactions(accountID);
  const accountTransactions = sampleTransactions;


  function handleTransactionSelection(transaction: TransactionDescribing) {
    navigation.navigate('TransactionDetails', {
      txID: transaction.txID,
    });
  }

  function navigateToTransactionsList() {
    navigation.navigate('TransactionsList', {
      accountID: accountPayload.uuid,
    });
  }

  function navigateToAccountSettings() {
    navigation.navigate('AccountSettingsMain', {
      accountID: accountPayload.uuid,
    });
  }


  return (
    <ScrollView style={styles.rootContainer}>

      <View style={{ paddingVertical: 20 }}>
        <AccountDetailsCard
          accountPayload={accountPayload}
          onKnowMorePressed={() => { }}
          onSettingsPressed={navigateToAccountSettings}
        />
      </View>

      <View style={{ paddingVertical: 20 }}>
        <TransactionPreviewHeader
          onViewMorePressed={navigateToTransactionsList}
        />
      </View>

      {/* <TransactionPreviewTabs  */}

      {/* /> */}

      <View style={{ marginBottom: 20 }}>
        <TransactionsList
          transactions={accountTransactions.slice(0, 3)}
          onTransactionSelected={handleTransactionSelection}
        />
      </View>

      <View style={styles.footerSection}>
        <SendAndReceiveButtonsFooter
          onSendPressed={() => {
            navigation.navigate('Send', {
              accountID,
              spendableBalance: accountPayload.balance,
            });
          }}
          onReceivePressed={() => {
            navigation.navigate('Receive', {
              accountID,
            });
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    paddingHorizontal: 24,
  },

  transactionPreviewHeaderDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },

  transactionPreviewHeaderTouchableText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansItalic,
    textDecorationLine: 'underline',
    marginLeft: 'auto',
  },

  footerSection: {
    paddingVertical: 38,
  },
});

AccountDetailsScreenContainer.navigationOptions = ({ _navigation, _navigationOptions }) => {
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

export default AccountDetailsScreenContainer;
