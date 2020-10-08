import React from 'react';
import { View, StyleSheet } from 'react-native';
import SubAccountKind from '../../common/data/enums/SubAccountKind';
import TestAccountHelpContents from '../Helper/TestAccountHelpContents';
import Colors from '../../common/Colors';
import SavingsAccountHelpContents from '../Helper/SavingsAccountHelpContents';
import CheckingAccountHelpContents from '../Helper/CheckingAccountHelpContents';
import DonationAccountHelpContents from '../Helper/DonationAccountHelpContents';
import BottomSheetHandle from '../bottom-sheets/BottomSheetHandle';

export type Props = {
  accountKind: SubAccountKind;
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
      case SubAccountKind.TEST:
        return <TestAccountHelpContents titleClicked={onClose} containerStyle={styles.contentContainer}/>;
      case SubAccountKind.SECURE:
        return <SavingsAccountHelpContents titleClicked={onClose} containerStyle={styles.contentContainer}/>;
      case SubAccountKind.REGULAR:
        return <CheckingAccountHelpContents titleClicked={onClose} containerStyle={styles.contentContainer}/>;
      case SubAccountKind.DONATION:
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
