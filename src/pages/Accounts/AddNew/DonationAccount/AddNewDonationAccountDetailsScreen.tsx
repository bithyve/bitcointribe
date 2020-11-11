import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import FormStyles from '../../../../common/Styles/FormStyles';
import ButtonStyles from '../../../../common/Styles/ButtonStyles';
import Colors from '../../../../common/Colors';
import Fonts from '../../../../common/Fonts';
import ListStyles from '../../../../common/Styles/ListStyles';
import { Input, Button, /* CheckBox */ } from 'react-native-elements';
import { useDispatch } from 'react-redux'
import { addNewAccountShell } from '../../../../store/actions/accounts';
import useAccountShellCreationCompletionEffect from '../../../../utils/hooks/account-effects/UseAccountShellCreationCompletionEffect';
import { resetToHomeAction } from '../../../../navigation/actions/NavigationActions';
import SubAccountDescribing, { DonationSubAccountDescribing } from '../../../../common/data/models/SubAccountInfo/Interfaces';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
import openLink from '../../../../utils/OpenLink';
import CheckBox from '../../../../components/CheckBox';


export type Props = {
  navigation: any;
};

type HeaderSectionProps = {
  subAccountInfo: SubAccountDescribing;
};


const HeaderSection: React.FC<HeaderSectionProps> = ({
  subAccountInfo,
}) => {
  const title = useMemo(() => {
    return `Enter details for the new ${subAccountInfo.defaultTitle}`;
  }, [subAccountInfo.defaultTitle]);

  return (
    <View style={ListStyles.infoHeaderSection}>
      <Text style={ListStyles.infoHeaderText}>{title}</Text>
    </View>
  );
}

const AddNewDonationAccountDetailsScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const dispatch = useDispatch();
  const nameInputRef = useRef<Input>(null);

  const currentSubAccountInfo: DonationSubAccountDescribing = useMemo(() => {
    return navigation.getParam('currentSubAccountInfo');
  }, [navigation.state.params]);

  const [accountName, setAccountName] = useState(currentSubAccountInfo.defaultTitle);
  const [doneeName, setDoneeName] = useState(currentSubAccountInfo.doneeName);
  const [accountDescription, setAccountDescription] = useState(currentSubAccountInfo.defaultDescription);
  const [isTFAEnabled, setIsTFAEnabled] = useState(currentSubAccountInfo.isTFAEnabled);

  const canProceed = useMemo(() => {
    return (
      accountName.length > 0 &&
      accountDescription.length > 0
    );
  }, [accountName, doneeName, accountDescription]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useAccountShellCreationCompletionEffect(() => {
    console.log('dispatching resetToHomeAction');
    navigation.dispatch(resetToHomeAction());
    // TODO: Navigate to account details screen with the ID for this account shell
  });

  function handleProceedButtonPress() {
    currentSubAccountInfo.customDisplayName = accountName;
    currentSubAccountInfo.doneeName = accountDescription;
    currentSubAccountInfo.customDescription = accountDescription;
    currentSubAccountInfo.isTFAEnabled = isTFAEnabled;

    dispatch(addNewAccountShell(currentSubAccountInfo));
  }

  async function openTermsAndConditions() {
    await openLink('https://hexawallet.io/donee-terms-conditions/');
  }

  return (
    <View style={styles.rootContainer}>
      <HeaderSection subAccountInfo={currentSubAccountInfo} />

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
          placeholder={'Enter A Donee Name'}
          placeholderTextColor={FormStyles.placeholderText.color}
          underlineColorAndroid={FormStyles.placeholderText.color}
          value={doneeName}
          numberOfLines={1}
          onChangeText={setDoneeName}
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

        <TouchableOpacity
          style={styles.tfaSelectionField}
          onPress={() => setIsTFAEnabled(!isTFAEnabled)}
          activeOpacity={1}
        >
          <View style={styles.tfaSelectionFieldContentContainer}>
            <Text style={styles.smallInfoLabelText}>Enable 2-Factor Authentication</Text>

            {/* TODO: Enable this after upgrading RN past 0.59 (See: https://github.com/react-native-elements/react-native-elements/issues/2156) */}
            {/* <CheckBox
              size={26}
              containerStyle={{ borderRadius: 5, borderColor: Colors.borderColor }}
              checkedColor={Colors.darkGreen}
              checked={isTFAEnabled}
              onIconPress={() => setIsTFAEnabled(!isTFAEnabled)}
            /> */}

            <CheckBox
              size={26}
              imageSize={20}
              borderRadius={5}
              color={Colors.lightBlue}
              borderColor={Colors.borderColor}
              isChecked={isTFAEnabled}
              onpress={() => setIsTFAEnabled(!isTFAEnabled)}
            />
          </View>
        </TouchableOpacity>

        <View style={{ marginBottom: 24, paddingHorizontal: 14 }}>
          <Text style={styles.smallInfoLabelText}>
            By clicking proceed you agree to our{' '}
            <Text
              onPress={openTermsAndConditions}
              style={styles.linkText}
            >
              Terms and Conditions
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.footerSection}>
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
    flex: 1,
  },

  formContainer: {
    paddingHorizontal: 16,
  },

  textInputContainer: {
    marginBottom: 12,
  },

  tfaSelectionField: {
    borderRadius: 10,
    backgroundColor: Colors.secondaryBackgroundColor,
    justifyContent: 'center',
    marginBottom: 36,
    marginHorizontal: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  tfaSelectionFieldContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallInfoLabelText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },

  linkText: {
    fontFamily: Fonts.FiraSansItalic,
    color: Colors.blue,
    fontSize: RFValue(11),
  },

  footerSection: {
    paddingHorizontal: 26,
    alignItems: 'flex-start',
  },
});


export default AddNewDonationAccountDetailsScreen;
