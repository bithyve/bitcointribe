import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../../common/Colors';
import Fonts from '../../../../common/Fonts';
import AccountPayload from '../../../../common/data/models/AccountPayload/Interfaces';
import ButtonStyles from '../../../../common/Styles/Buttons';
import DestinationAccountsList from '../../../../components/account-settings/transaction-reassignment/DestinationAccountsList';
import useAccountPayloadFromNavigation from '../../../../utils/hooks/state-selectors/UseAccountPayloadFromNavigation';
import useAccountPayloadsInGroup from '../../../../utils/hooks/state-selectors/UseAccountPayloadsInGroup';

export type Props = {
  navigation: any;
};

const HeaderSection: React.FC = () => {
  return (
    <View style={styles.headerSection}>
      <Text style={styles.headerText}>Choose a destination.</Text>
    </View>
  );
}

const ReassignTransactionsSelectDestinationScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const currentAccountPayload = useAccountPayloadFromNavigation(navigation);
  const selectableAccounts = useAccountPayloadsInGroup(currentAccountPayload.transactionGroup);
  const [selectedAccountID, setSelectedAccountID] = useState<string>(null);

  const canProceed = useMemo(() => {
    return selectedAccountID != null;
  }, [selectedAccountID]);

  function handleAccountSelection(accountPayload: AccountPayload) {
    setSelectedAccountID(accountPayload.uuid);
  }

  function handleProceedButtonPress() {
    // TODO: Show alert on success with a link to view the destination account details.
  }

  return (
    <View style={styles.rootContainer}>
      <HeaderSection />

      <View>
        <DestinationAccountsList
          selectableAccounts={selectableAccounts}
          selectedAccountID={selectedAccountID}
          onAccountSelected={handleAccountSelection}
        />
      </View>

      <View style={styles.proceedButtonContainer}>
        <Button
          raised
          buttonStyle={ButtonStyles.primaryActionButton}
          title="Confirm & Proceed"
          titleStyle={ButtonStyles.actionButtonText}
          onPress={handleProceedButtonPress}
          disabled={canProceed === false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },

  proceedButtonContainer: {
    zIndex: 2,
    elevation: 2,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },

  headerSection: {
    paddingHorizontal: 24,
    paddingVertical: 36,
  },

  headerText: {
    fontSize: RFValue(11),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
  },
});

export default ReassignTransactionsSelectDestinationScreen;
