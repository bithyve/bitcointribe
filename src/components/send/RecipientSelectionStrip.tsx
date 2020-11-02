import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Colors from '../../common/Colors';
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import SendableContactListItem from './SendableContactListItem';
import RecipientKind from '../../common/data/enums/RecipientKind';
import { ContactRecipientDescribing, RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing';

export type Props = {
  accountKind: string;
  recipients: RecipientDescribing[];
  selectedRecipients: RecipientDescribing[];
  onRecipientSelected: Function;
};

const RecipientSelectionStrip: React.FC<Props> = ({
  accountKind,
  recipients,
  selectedRecipients,
  onRecipientSelected,
}: Props) => {
  const accountsState = useAccountsState();

  const selectedRecipientIDs = useMemo(() => {
    return selectedRecipients.map(recipient => recipient.id);
  }, [selectedRecipients]);

  const isSelected = useCallback((recipient: RecipientDescribing) => {
    return selectedRecipientIDs.includes(recipient.id);
  }, [selectedRecipientIDs]);

  return (
    <View style={styles.rootContainer}>
      <FlatList
        horizontal
        contentContainerStyle={styles.listContentContainer}
        data={recipients}
        extraData={[accountsState[accountKind].transfer.details]}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: -14, y: 0 }}
        renderItem={({ item: recipient }: { item: RecipientDescribing }) => (
          <TouchableOpacity onPress={() => onRecipientSelected(recipient)}>
            {recipient.kind == RecipientKind.CONTACT && (
              <SendableContactListItem
                containerStyle={{ marginHorizontal: 14 }}
                contact={(recipient as ContactRecipientDescribing)}
                isSelected={isSelected(recipient)}
              />
            ) || (recipient.kind == RecipientKind.SUB_ACCOUNT && (
              // TODO: List item for sendable sub accounts
              <Text>Account</Text>
            ))}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
  },

  listContentContainer: {
    paddingVertical: 16,
  },
});

export default RecipientSelectionStrip;
