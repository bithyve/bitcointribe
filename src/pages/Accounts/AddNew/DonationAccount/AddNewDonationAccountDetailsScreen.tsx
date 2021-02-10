import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, Text, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import FormStyles from '../../../../common/Styles/FormStyles'
import Colors from '../../../../common/Colors'
import Fonts from '../../../../common/Fonts'
import ListStyles from '../../../../common/Styles/ListStyles'
import { Input, CheckBox } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import { addNewAccountShell } from '../../../../store/actions/accounts'
import useAccountShellCreationCompletionEffect from '../../../../utils/hooks/account-effects/UseAccountShellCreationCompletionEffect'
import { resetToHomeAction } from '../../../../navigation/actions/NavigationActions'
import {
  DonationSubAccountDescribing,
} from '../../../../common/data/models/SubAccountInfo/Interfaces'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import openLink from '../../../../utils/OpenLink'
import SourceAccountKind from '../../../../common/data/enums/SourceAccountKind'
import Loader from '../../../../components/loader'
import ButtonBlue from '../../../../components/ButtonBlue'

export type Props = {
  navigation: any;
};

const AddNewDonationAccountDetailsScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const nameInputRef = useRef<Input>( null )

  const currentSubAccount: DonationSubAccountDescribing = useMemo( () => {
    return navigation.getParam( 'currentSubAccount' )
  }, [ navigation.state.params ] )

  const [ accountName, setAccountName ] = useState( '' )
  const [ doneeName, setDoneeName ] = useState( currentSubAccount.doneeName )
  const [ accountDescription, setAccountDescription ] = useState( '' )
  const [ isTFAEnabled, setIsTFAEnabled ] = useState(
    currentSubAccount.isTFAEnabled,
  )
  const [ showLoader, setShowLoader ] = useState( false )

  const canProceed = useMemo( () => {
    return accountName.length > 0 && accountDescription.length > 0
  }, [ accountName, doneeName, accountDescription ] )

  useEffect( () => {
    nameInputRef.current?.focus()
  }, [] )

  useAccountShellCreationCompletionEffect( () => {
    console.log( 'dispatching resetToHomeAction' )
    navigation.dispatch( resetToHomeAction() )
  } )

  function handleProceedButtonPress() {
    setShowLoader( true )
    currentSubAccount.customDisplayName = accountName
    currentSubAccount.doneeName = doneeName
    currentSubAccount.customDescription = accountDescription
    currentSubAccount.isTFAEnabled = isTFAEnabled
    currentSubAccount.sourceKind = currentSubAccount.isTFAEnabled
      ? SourceAccountKind.SECURE_ACCOUNT
      : SourceAccountKind.REGULAR_ACCOUNT

    dispatch( addNewAccountShell( currentSubAccount ) )
  }

  async function openTermsAndConditions() {
    await openLink( 'https://hexawallet.io/donee-terms-conditions/' )
  }

  return (
    <KeyboardAvoidingView
      style={styles.rootContainer}
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{
        flex: 1
      }}>
        <View style={styles.rootContentContainer}>

          <View style={ListStyles.infoHeaderSection}>
            <Text style={ListStyles.infoHeaderSubtitleText}>Enter details for the new Donation Account</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              inputContainerStyle={[
                FormStyles.textInputContainer,
                styles.textInputContainer,
              ]}
              inputStyle={FormStyles.inputText}
              placeholder={'Enter donation name'}
              placeholderTextColor={FormStyles.placeholderText.color}
              underlineColorAndroid={'transparent'}
              value={accountName}
              maxLength={24}
              numberOfLines={1}
              textContentType="name"
              onChangeText={setAccountName}
              ref={nameInputRef}
            />

            <Input
              inputContainerStyle={[
                FormStyles.textInputContainer,
                styles.textInputContainer,
              ]}
              inputStyle={FormStyles.inputText}
              placeholder={'Organised by'}
              placeholderTextColor={FormStyles.placeholderText.color}
              underlineColorAndroid={'transparent'}
              value={doneeName}
              numberOfLines={1}
              onChangeText={setDoneeName}
            />
            <Input
              inputContainerStyle={[
                FormStyles.textInputContainer,
                FormStyles.textAreaInputContainer,
                styles.textInputContainer,
              ]}
              inputStyle={{
                ...FormStyles.inputText,
                alignSelf: 'flex-start'
              }}
              placeholder={'Donation cause or description'}
              placeholderTextColor={FormStyles.placeholderText.color}
              underlineColorAndroid={'transparent'}
              value={accountDescription}
              multiline
              numberOfLines={4}
              onChangeText={setAccountDescription}
            />

            <TouchableOpacity
              style={styles.tfaSelectionField}
              onPress={() => setIsTFAEnabled( !isTFAEnabled )}
              activeOpacity={1}
            >
              <View style={styles.tfaSelectionFieldContentContainer}>
                <Text style={{
                  ...styles.smallInfoLabelText, fontSize: RFValue( 12 )
                }}>
              Enable 2-Factor Authentication
                </Text>

                <CheckBox
                  checkedIcon="check"
                  uncheckedIcon="square-o"
                  size={24}
                  checkedColor={Colors.darkGreen}
                  uncheckedColor={Colors.white}
                  checked={isTFAEnabled}
                  disabled
                />
              </View>
            </TouchableOpacity>

            <View style={{
              marginBottom: 24, paddingHorizontal: 14
            }}>
              <Text style={styles.smallInfoLabelText}>
            By clicking proceed you agree to our{' '}
                <Text onPress={openTermsAndConditions} style={styles.linkText}>
              Terms and Conditions
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.footerSection}>
            <ButtonBlue
              buttonText="Proceed"
              handleButtonPress={handleProceedButtonPress}
              buttonDisable={canProceed === false}
            />
          </View>
        </View>
      </ScrollView>
      {showLoader ? <Loader isLoading={true} /> : null}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  rootContentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },

  formContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },

  textInputContainer: {
    marginBottom: 12,
  },

  tfaSelectionField: {
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    marginBottom: 36,
    marginHorizontal: 14,
    paddingHorizontal: 10,
  },

  tfaSelectionFieldContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallInfoLabelText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
  },

  linkText: {
    fontFamily: Fonts.FiraSansItalic,
    color: Colors.blue,
    fontSize: RFValue( 11 ),
    fontWeight: 'bold',
  },

  footerSection: {
    paddingHorizontal: 26,
    alignItems: 'flex-start',
  },
} )

export default AddNewDonationAccountDetailsScreen
