import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../../common/Colors';
import Fonts from '../../../../common/Fonts';
import SubAccountDescribing from '../../../../common/data/models/SubAccountInfo/Interfaces';
import ButtonStyles from '../../../../common/Styles/Buttons';
import DestinationAccountsList from '../../../../components/account-settings/transaction-reassignment/DestinationAccountsList';
import useAccountShellFromNavigation from '../../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';
import useAccountShellsInGroup from '../../../../utils/hooks/state-selectors/accounts/UseAccountShellsInGroup';
import AccountShell from '../../../../common/data/models/AccountShell';

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
  const currentAccountShell = useAccountShellFromNavigation(navigation);
  const selectableAccountShells = useAccountShellsInGroup(currentAccountShell.transactionGroup);
  const [selectedAccountShellID, setSelectedAccountShellID] = useState<string>(null);

  const canProceed = useMemo(() => {
    return selectedAccountShellID != null;
  }, [selectedAccountShellID]);

  function handleAccountSelection(accountShell: AccountShell) {
    setSelectedAccountShellID(accountShell.id);
  }

  function handleProceedButtonPress() {
    // TODO: Show alert on success with a link to view the destination account details.
  }

  return (
    <View style={styles.rootContainer}>
      <HeaderSection />

      <View>
        <DestinationAccountsList
          selectableAccountShells={selectableAccountShells}
          selectedAccountShellID={selectedAccountShellID}
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
