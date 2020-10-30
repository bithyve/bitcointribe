import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActionMenuItem } from './SwanIntegrationDemoScreen';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import useSwanIntegrationState from '../../utils/hooks/state-selectors/accounts/UseSwanIntegrationState';
import { SwanActionKind } from '../../store/actions/SwanIntegration';
import useSwanIntegrationResultFromAction from '../../utils/hooks/swan-integration/UseSwanIntegrationResultFromAction';

export type Props = {
  actionItem: ActionMenuItem;
  onItemSelected: () => void;
  containerStyle?: Record<string, unknown>
};

const ActionMenuListItem: React.FC<Props> = ({
  actionItem,
  onItemSelected,
  containerStyle = {},
}: Props) => {
  const actionResultText = useSwanIntegrationResultFromAction(actionItem.kind);

  return (
    <View style={{ ...styles.rootContainer, ...containerStyle }}>

      <TouchableOpacity
        onPress={onItemSelected}
      >
        <Text style={styles.actionHeadingText}>
          {actionItem.title}
        </Text>
      </TouchableOpacity>

      <Text style={styles.subtitleText}>{actionItem.subtitle}</Text>

      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.resultTextLabel}>Result: </Text>
        <Text style={styles.resultTextValue}>{actionResultText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {

  },

  actionHeadingText: {
    fontSize: 22,
    color: 'blue',
  },

  subtitleText: {
    fontSize: 14,
    color: 'gray'
  },

  resultTextLabel: {
    fontSize: 18,
    color: 'gray',
  },

  resultTextValue: {
    fontSize: 18,
    color: 'purple',
  },
});

export default ActionMenuListItem;
