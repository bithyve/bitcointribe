import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { NewAccountPayload } from '../../../../common/data/models/NewAccountPayload';
import NavigationHeader from '../NavigationHeader';
import FormStyles from '../../../../common/Styles/Forms';
import ButtonStyles from '../../../../common/Styles/Buttons';
import { Input, Button } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux'
import { addNewAccount, newAccountAddCompleted } from '../../../../store/actions/accounts';

export interface Props {
  navigation: any;
}

const AddNewHexaAccountDetails: React.FC<Props> = ({
  navigation,
}: Props) => {
  const dispatch = useDispatch();
  const nameInputRef = useRef<Input>(null);

  const currentPayload: NewAccountPayload = useMemo(() => {
    return navigation.getParam('currentPayload');
  }, [navigation.state.params]);

  const { hasNewAccountGenerationSucceeded } = useSelector(state => state.accounts);

  const [accountName, setAccountName] = useState(currentPayload.title);
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
  useEffect(() => {
    if (hasNewAccountGenerationSucceeded) {
      dispatch(newAccountAddCompleted());
      navigation.popToTop();
    }
  }, [hasNewAccountGenerationSucceeded]);


  function handleProceedButtonPress() {
    currentPayload.customDisplayName = accountName;
    currentPayload.customDescription = accountDescription;

    dispatch(addNewAccount({ payload: currentPayload }));
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
      const currentPayload: NewAccountPayload = params.currentPayload;
      const title = `Enter details for the new ${currentPayload.title}`;

      return <NavigationHeader
        title={title}
        titleStyle={{ fontSize: 18, fontWeight: '400' }}
        onBackPress={() => navigation.pop()}
      />
    },
  };
};

export default AddNewHexaAccountDetails;
