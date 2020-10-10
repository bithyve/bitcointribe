
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { useDispatch } from "react-redux";
import ButtonStyles from '../../../common/Styles/Buttons';
import ListStyles from '../../../common/Styles/Lists';
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions';
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell';
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';
import AccountShellMergeDestinationsList from '../../../components/account-settings/merge-account-shells/AccountShellMergeDestinationsList';
import useCompatibleAccountShells from '../../../utils/hooks/state-selectors/accounts/UseCompatibleAccountShells';
import AccountShell from '../../../common/data/models/AccountShell';
import { mergeAccountShells } from '../../../store/actions/accounts';
import CheckingSubAccountInfo from '../../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo';
import BitcoinUnit from '../../../common/data/enums/BitcoinUnit';
import AccountShellMergeSelectionListHeader from '../../../components/account-settings/merge-account-shells/AccountShellMergeSelectionListHeader';


export type Props = {
  navigation: any;
};


const AccountSettingsMergeAccountShellsScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const dispatch = useDispatch();

  const accountShell = useAccountShellFromNavigation(navigation);
  const compatibleDestinations = useCompatibleAccountShells(accountShell);

  const [selectedDestinationID, setSelectedDestinationID] = useState<string>(null);

  const canProceed = useMemo(() => {
    return selectedDestinationID != null;
  }, [selectedDestinationID]);

  const selectedDestination = useMemo(() => {
    return compatibleDestinations.find(shell => shell.id === selectedDestinationID);
  }, [selectedDestinationID]);


  function handleDestinationSelection(accountShell: AccountShell) {
    setSelectedDestinationID(accountShell.id);
  }

  function handleProceedButtonPress() {
    dispatch(mergeAccountShells({
      source: accountShell,
      destination: selectedDestination,
    }));

    navigation.dispatch(resetStackToAccountDetails({
      accountShellID: accountShell.id,
    }));
  }

  return (
    <View style={styles.rootContainer}>
      <AccountShellMergeSelectionListHeader sourceShell={accountShell} />

      <View>
        <AccountShellMergeDestinationsList
          compatibleDestinations={compatibleDestinations}
          selectedDestinationID={selectedDestinationID}
          onDestinationSelected={handleDestinationSelection}
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
});

export default AccountSettingsMergeAccountShellsScreen;
