import React from 'react';
import { View, StyleSheet } from 'react-native';
import AccountKind from '../../common/data/enums/AccountKind';
import TestAccountHelpContents from '../Helper/TestAccountHelpContents';
import Colors from '../../common/Colors';
import SavingsAccountHelpContents from '../Helper/SavingsAccountHelpContents';
import CheckingAccountHelpContents from '../Helper/CheckingAccountHelpContents';
import DonationAccountHelpContents from '../Helper/DonationAccountHelpContents';
import BottomSheetHandle from '../bottom-sheets/BottomSheetHandle';

export type Props = {
  accountKind: AccountKind;
  onClose: () => void;
};

export const KnowMoreBottomSheetHandle: React.FC = () => {
  return <BottomSheetHandle containerStyle={styles.handleContainer} />;
};

const AccountDetailsKnowMoreBottomSheet: React.FC<Props> = ({
  accountKind,
  onClose,
}: Props) => {
  const BottomSheetContent = () => {
    switch (accountKind) {
      case AccountKind.TEST:
        return <TestAccountHelpContents titleClicked={onClose} containerStyle={styles.contentContainer}/>;
      case AccountKind.SECURE:
        return <SavingsAccountHelpContents titleClicked={onClose} containerStyle={styles.contentContainer}/>;
      case AccountKind.REGULAR:
        return <CheckingAccountHelpContents titleClicked={onClose} containerStyle={styles.contentContainer}/>;
      case AccountKind.DONATION:
        return <DonationAccountHelpContents titleClicked={onClose} containerStyle={styles.contentContainer} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.rootContainer}>
      <BottomSheetContent />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    backgroundColor: Colors.blue,
    flex: 1,
  },

  handleContainer: {
    backgroundColor: Colors.blue,
  },

  contentContainer: {
    shadowOpacity: 0,
  },
});

export default AccountDetailsKnowMoreBottomSheet;
