import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PersonalNode from '../../../common/data/models/PersonalNode'
import ListStyles from '../../../common/Styles/ListStyles'
import FormStyles from '../../../common/Styles/FormStyles'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import { Button, Input } from 'react-native-elements'

export type Props = {
  personalNode: PersonalNode | null;
  onEditButtonPressed: () => void;
};

const PersonalNodeDetailsSection: React.FC<Props> = ( {
  personalNode,
  onEditButtonPressed,
}: Props ) => {
  return (
    <View style={styles.rootContainer}>

      <View style={ListStyles.infoHeaderSection}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={{
            ...ListStyles.infoHeaderTitleText, flex: 1
          }}>
            Personal Node Details
          </Text>

          <Button
            raised
            buttonStyle={ButtonStyles.miniNavButton}
            title="Edit"
            titleStyle={ButtonStyles.miniNavButtonText}
            onPress={onEditButtonPressed}
          />
        </View>
      </View>

      <View style={styles.bodySection}>
        <Input
          inputContainerStyle={[
            FormStyles.textInputContainer,
            styles.textInputContainer,
          ]}
          inputStyle={FormStyles.inputText}
          value={personalNode?.ipAddress || 'No IP Address Configured'}
          numberOfLines={1}
          disabled
        />

        <Input
          inputContainerStyle={[
            FormStyles.textInputContainer,
            styles.textInputContainer,
          ]}
          inputStyle={FormStyles.inputText}
          underlineColorAndroid={'transparent'}
          value={String( personalNode?.portNumber || 'No Port Configured' )}
          numberOfLines={1}
          disabled
        />
      </View>

    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
  },

  bodySection: {
    paddingHorizontal: 16,
    flex: 1,
  },

  textInputContainer: {
  },

  footerSection: {
    marginTop: 12,
    paddingHorizontal: 26,
    alignItems: 'flex-start',
  },
} )

export default PersonalNodeDetailsSection
