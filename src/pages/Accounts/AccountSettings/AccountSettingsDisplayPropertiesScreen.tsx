import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { useDispatch } from 'react-redux'
import AccountPayload from '../../../common/data/models/AccountPayload/Interfaces';
import useActiveAccountPayload from '../../../utils/hooks/state-selectors/UseActiveAccountPayload';
import Colors from '../../../common/Colors';
import Fonts from '../../../common/Fonts';
import FormStyles from '../../../common/Styles/Forms';
import ButtonStyles from '../../../common/Styles/Buttons';
import { RFValue } from 'react-native-responsive-fontsize';
import { updateAccountSettings } from '../../../store/actions/accounts';
import useAccountSettingsUpdatedEffect from '../../../utils/hooks/accounts-effects/UseAccountSettingsUpdatedEffect';

export type Props = {
  navigation: any;
};

const AccountSettingsDisplayPropertiesScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const accountID = useMemo(() => {
    return navigation.getParam('accountID');
  }, [navigation]);

  const accountPayload: AccountPayload | undefined = useActiveAccountPayload(accountID);
  const dispatch = useDispatch();
  const nameInputRef = useRef<Input>(null);

  const [accountName, setAccountName] = useState(
    accountPayload?.customDisplayName ||
    accountPayload?.defaultTitle ||
    ''
  );

  const [accountDescription, setAccountDescription] = useState(
    accountPayload?.customDescription ||
    accountPayload?.defaultDescription ||
    ''
  );

  const canSaveChanges = useMemo(() => {
    return (
      accountName.length > 0 &&
      accountDescription.length > 0
    );
  }, [accountName, accountDescription]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // TODO: We need a bit more design clarity about what to do after an
  // account settings update operation succeeds or fails.
  useAccountSettingsUpdatedEffect(() => {
    navigation.goBack();
  });

  function handleSaveButtonPress() {
    accountPayload.customDisplayName = accountName;
    accountPayload.customDescription = accountDescription;

    dispatch(updateAccountSettings(accountPayload));
  }

  return (
    <View style={styles.rootContainer}>
      <View style={styles.headerSection}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.headerText}>Please edit the </Text>
          <Text style={{ ...styles.headerText, fontStyle: 'italic' }}>Name and Description</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Input
          inputContainerStyle={[FormStyles.textInputContainer, styles.textInputContainer]}
          inputStyle={FormStyles.inputText}
          placeholder={'Enter An Account Name'}
          placeholderTextColor={FormStyles.placeholderText.color}
          underlineColorAndroid={FormStyles.placeholderText.color}
          value={accountName}
          maxLength={24}
          numberOfLines={1}
          textContentType="name"
          onChangeText={setAccountName}
          ref={nameInputRef}
        />

        <Input
          inputContainerStyle={[FormStyles.textInputContainer, styles.textInputContainer]}
          inputStyle={FormStyles.inputText}
          placeholder={'Enter A Description'}
          placeholderTextColor={FormStyles.placeholderText.color}
          underlineColorAndroid={FormStyles.placeholderText.color}
          value={accountDescription}
          numberOfLines={2}
          onChangeText={setAccountDescription}
        />
      </View>

      <View style={styles.listFooterSection}>
        <Button
          raised
          buttonStyle={ButtonStyles.primaryActionButton}
          title="Confirm & Proceed"
          titleStyle={ButtonStyles.actionButtonText}
          onPress={handleSaveButtonPress}
          disabled={canSaveChanges === false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },

  headerSection: {
    paddingVertical: 24,
    marginBottom: 10,
  },

  headerText: {
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
  },

  formContainer: {
  },

  textInputContainer: {
    marginBottom: 10,
  },

  listFooterSection: {
    // paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
});


export default AccountSettingsDisplayPropertiesScreen;
