import React, { useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from "react-redux";
import { Button } from 'react-native-elements';
import ButtonStyles from '../../../common/Styles/ButtonStyles';
import useActiveAccountShells from '../../../utils/hooks/state-selectors/accounts/UseActiveAccountShells';
import AccountShell from '../../../common/data/models/AccountShell';
import { accountShellsOrderUpdated } from '../../../store/actions/accounts';
import ReorderAccountShellsDraggableList from '../../../components/more-options/account-management/ReorderAccountShellsDraggableList';
import Colors from '../../../common/Colors';

export type Props = {
  navigation: any;
};

const AccountManagementContainerScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const dispatch = useDispatch();
  const originalAccountShells = useActiveAccountShells();
  const [orderedAccountShells, setOrderedAccountShells] = useState(originalAccountShells);
  const [hasChangedOrder, setHasChangedOrder] = useState(false);

  const canSaveOrder = useMemo(() => {
    return hasChangedOrder;
  }, [hasChangedOrder]);

  function hasNewOrder(newlyOrderedAccountShells: AccountShell[]) {
    return orderedAccountShells.some((accountShell, index) => {
      return accountShell.id !== newlyOrderedAccountShells[index].id;
    });
  }

  function handleDragEnd(newlyOrderedAccountShells: AccountShell[]) {
    if (hasNewOrder(newlyOrderedAccountShells)) {
      setHasChangedOrder(true);
      setOrderedAccountShells(newlyOrderedAccountShells);
    } else {
      setHasChangedOrder(false);
    }
  }

  function handleProceedButtonPress() {
    dispatch(accountShellsOrderUpdated(orderedAccountShells));
    setHasChangedOrder(false);
  }

  return (
    <View style={styles.rootContainer}>
      <ReorderAccountShellsDraggableList
        accountShells={orderedAccountShells}
        onDragEnded={handleDragEnd}
      />

      <View style={styles.proceedButtonContainer}>
        {canSaveOrder && (
          <Button
            raised
            buttonStyle={ButtonStyles.primaryActionButton}
            title="Save New Ordering"
            disabledStyle={ButtonStyles.disabledPrimaryActionButton}
          disabledTitleStyle={ButtonStyles.actionButtonText}
            titleStyle={ButtonStyles.actionButtonText}
            onPress={handleProceedButtonPress}
          />
        )}
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
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },
});


export default AccountManagementContainerScreen;
