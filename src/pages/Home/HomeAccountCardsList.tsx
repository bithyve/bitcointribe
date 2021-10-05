import React, { useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from 'react-native-elements'
import { Easing } from 'react-native-reanimated'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import AccountShell from '../../common/data/models/AccountShell'
import BottomSheetBackground from '../../components/bottom-sheets/BottomSheetBackground'
import HomeAccountCardsDraggableList from '../../components/home/HomeAccountCardsDraggableList'
import HomeAccountCardsGrid from '../../components/home/HomeAccountCardsGrid'
import useActiveAccountShells from '../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import { useDispatch, useSelector } from 'react-redux'


export type Props = {
  // containerStyle?: Record<string, unknown>;
  contentContainerStyle?: Record<string, unknown>;
  onCardSelected: ( selectedAccount: AccountShell ) => void;
  onAddNewSelected: () => void;
  currentLevel: number;
  onEditModeChanged?: ( isActive: boolean ) => void;
};

const defaultBottomSheetConfigs = {
  initialSnapIndex: 1,
  animationDuration: 500,
  animationEasing: Easing.out( Easing.exp ),
  dismissOnOverlayPress: true,
}

const EditModeBottomSheetHeader: React.FC = () => {
  return (
    <View style={styles.editModeBottomSheetHeaderSection}>

      <View style={{
        flex: 1
      }}>
        <Text style={styles.editModeBottomSheetHeadingText}>Rearrange Accounts</Text>
        <Text style={styles.editModeBottomSheetSubHeadingText}>Move the accounts to reorder them</Text>
      </View>

      <Button
        containerStyle={{
          flex: 0
        }}
        buttonStyle={ButtonStyles.actionButton}
        title="All Accounts"
      />
    </View>
  )
}

const HomeAccountCardsList: React.FC<Props> = ( {
  // containerStyle = {
  // },
  contentContainerStyle = {
  },
  onCardSelected,
  onAddNewSelected,
  currentLevel,
  onEditModeChanged = ( _ ) => { },
}: Props ) => {
  const accountShells = useActiveAccountShells()
  const showAllAccount = useSelector( ( state ) => state.accounts.showAllAccount )
  function handleAccountReordering( orderedAccounts: AccountShell[] ) {}
  function handleGridCardLongPress() {
    // 📝 For now, long-pressing to re-order is on the backburner
    // until we can make it WYSIWYG.

    // showEditModeBottomSheet();
    // onEditModeChanged(true);
  }


  return (
    // <View style={containerStyle}>
    <HomeAccountCardsGrid
      currentLevel={currentLevel}
      accountShells={accountShells}
      onCardLongPressed={handleGridCardLongPress}
      onAccountSelected={onCardSelected}
      onAddNewSelected={onAddNewSelected}
      contentContainerStyle={contentContainerStyle}
      showAllAccount={showAllAccount}
    />
    // </View>
  )
}

const styles = StyleSheet.create( {
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
} )

export default HomeAccountCardsList
