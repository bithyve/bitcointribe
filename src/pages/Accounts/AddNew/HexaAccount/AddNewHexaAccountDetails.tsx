import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import NavigationHeader from '../NavigationHeader';
import FormStyles from '../../../../common/Styles/Forms';
import ButtonStyles from '../../../../common/Styles/Buttons';
import { Input, Button } from 'react-native-elements';
import { useDispatch } from 'react-redux'
import { addNewAccount } from '../../../../store/actions/accounts';
import useAccountGenerationCompletionEffect from '../../../../utils/hooks/accounts-effects/UseAccountGenerationCompletionEffect';
import { goHomeAction } from '../../../../navigation/actions/NavigationActions';
import AccountPayload from '../../../../common/data/models/AccountPayload/Interfaces';

export interface Props {
  navigation: any;
}

const AddNewHexaAccountDetails: React.FC<Props> = ({
  navigation,
}: Props) => {
  const dispatch = useDispatch();
  const nameInputRef = useRef<Input>(null);

  const currentPayload: AccountPayload = useMemo(() => {
    return navigation.getParam('currentPayload');
  }, [navigation.state.params]);

  const [accountName, setAccountName] = useState(currentPayload.defaultTitle);
  const [accountDescription, setAccountDescription] = useState('');

  const canProceed = useMemo(() => {
    return (
      accountName.length > 0 &&
      accountDescription.length > 0
    );
  }, [accountName, accountDescription]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // TODO: We need a bit more design clarity about what to do after new
  // account creation succeeds or fails.
  useAccountGenerationCompletionEffect(() => {
    navigation.dispatch(goHomeAction);
  });

  function handleProceedButtonPress() {
    currentPayload.customDisplayName = accountName;
    currentPayload.customDescription = accountDescription;

    dispatch(addNewAccount(currentPayload));
  }

  return (
    <View style={styles.rootContainer}>
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
          title="Proceed"
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
    paddingVertical: 20,
  },

  formContainer: {
    paddingHorizontal: 16,
  },

  textInputContainer: {
    marginBottom: 12,
  },

  listFooterSection: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
});


AddNewHexaAccountDetails.navigationOptions = ({ navigation, navigationOptions }) => {
  const { params } = navigation.state;

  return {
    header: ({ scene, previous, navigation }) => {
      const currentPayload: AccountPayload = params.currentPayload;
      const title = `Enter details for the new ${currentPayload.defaultTitle}`;

      return <NavigationHeader
        title={title}
        titleStyle={{ fontSize: 18, fontWeight: '400' }}
        onBackPress={() => navigation.pop()}
      />
    },
  };
};

export default AddNewHexaAccountDetails;
