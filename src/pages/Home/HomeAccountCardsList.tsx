import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { Easing } from 'react-native-reanimated';
import ButtonStyles from '../../common/Styles/Buttons';
import AccountShell from '../../common/data/models/AccountShell';
import BottomSheetBackground from '../../components/bottom-sheets/BottomSheetBackground';
import HomeAccountCardsDraggableList from '../../components/home/HomeAccountCardsDraggableList';
import HomeAccountCardsGrid from '../../components/home/HomeAccountCardsGrid';
import useActiveAccountShells from '../../utils/hooks/state-selectors/accounts/UseActiveAccountShells';


export type Props = {
  containerStyle?: Record<string, unknown>;
  onCardSelected: (selectedAccount: AccountShell) => void;
  onAddNewSelected: () => void;
  onEditModeChanged?: (isActive: boolean) => void;
};

const defaultBottomSheetConfigs = {
  initialSnapIndex: 1,
  animationDuration: 500,
  animationEasing: Easing.out(Easing.exp),
  dismissOnOverlayPress: true,
};

const EditModeBottomSheetHeader: React.FC = () => {
  return (
    <View style={styles.editModeBottomSheetHeaderSection}>

      <View style={{ flex: 1 }}>
        <Text style={styles.editModeBottomSheetHeadingText}>Rearrange Accounts</Text>
        <Text style={styles.editModeBottomSheetSubHeadingText}>Move the accounts to reorder them</Text>
      </View>

      <Button
        containerStyle={{ flex: 0 }}
        buttonStyle={ButtonStyles.actionButton}
        title="All Accounts"
      />
    </View>
  );
};

const HomeAccountCardsList: React.FC<Props> = ({
  containerStyle = {},
  onCardSelected,
  onAddNewSelected,
  onEditModeChanged = (_) => { },
}: Props) => {
  const accountShells = useActiveAccountShells();
  const { present, dismiss } = useBottomSheetModal();

  function handleAccountReordering(orderedAccounts: AccountShell[]) {}

  function handleGridCardLongPress() {
    // 📝 For now, long-pressing to re-order is on the backburnner
    // until we can make it WYSIWYG.

    // showEditModeBottomSheet();
    // onEditModeChanged(true);
  }

  const EditModeBottomSheetBackground = () => {
    return (
      <BottomSheetBackground isVisible onPress={() => {
        onEditModeChanged(false);
        dismiss();
      }} />
    );
  };

  const EmptyView: React.FC = () => {
    return <View />;
  }

  const showEditModeBottomSheet = useCallback(() => {
    present(
      <View style={containerStyle}>
        <EditModeBottomSheetHeader />

        <View style={styles.editModeBottomSheetContentContainer}>
          <HomeAccountCardsDraggableList
            accountShells={accountShells}
            onDragEnded={handleAccountReordering}
          />
        </View>
      </View>,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [0, '68%'],
        overlayComponent: EditModeBottomSheetBackground,
        handleComponent: EmptyView,
      },
    );
  }, [present, dismiss]);


  return (
    <View style={containerStyle}>
      <HomeAccountCardsGrid
        accountShells={accountShells}
        onCardLongPressed={handleGridCardLongPress}
        onAccountSelected={onCardSelected}
        onAddNewSelected={onAddNewSelected}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  editModeBottomSheetHeaderSection: {
    flex: 0,
    marginTop: -100,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },

  editModeBottomSheetContentContainer: {
    marginTop: 50,
    flex: 1,
  },

  editModeBottomSheetHeadingText: {

  },

  editModeBottomSheetSubHeadingText: {

  },
});

export default HomeAccountCardsList;
