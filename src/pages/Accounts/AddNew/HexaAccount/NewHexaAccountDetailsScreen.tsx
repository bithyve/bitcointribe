import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import FormStyles from '../../../../common/Styles/FormStyles'
import ListStyles from '../../../../common/Styles/ListStyles'
import { Input } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import useAccountShellCreationCompletionEffect from '../../../../utils/hooks/account-effects/UseAccountShellCreationCompletionEffect'
import { resetToHomeAction } from '../../../../navigation/actions/NavigationActions'
import { HexaSubAccountDescribing } from '../../../../common/data/models/SubAccountInfo/Interfaces'
import Loader from '../../../../components/loader'
import ButtonBlue from '../../../../components/ButtonBlue'
import { addNewAccountShells } from '../../../../store/actions/accounts'
import { newAccountsInfo } from '../../../../store/sagas/accounts'

export type Props = {
  navigation: any;
};

type HeaderSectionProps = {
  subAccountInfo: HexaSubAccountDescribing;
};


const HeaderSection: React.FC<HeaderSectionProps> = ( { subAccountInfo, } ) => {
  const title = useMemo( () => {
    return `Enter details for the new ${subAccountInfo.defaultTitle}`
  }, [ subAccountInfo.defaultTitle ] )

  return (
    <View style={ListStyles.infoHeaderSection}>
      <Text style={ListStyles.infoHeaderSubtitleText}>{title}</Text>
    </View>
  )
}

const NewHexaAccountDetailsScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const nameInputRef = useRef<Input>( null )

  const currentSubAccount: HexaSubAccountDescribing = useMemo( () => {
    return navigation.getParam( 'currentSubAccount' )
  }, [ navigation.state.params ] )
  const [ showLoader, setShowLoader ] = useState( false )
  const [ buttonPressed, setButtonPressed ] = useState ( false )

  const [ accountName, setAccountName ] = useState( '' )
  const [ accountDescription, setAccountDescription ] = useState( currentSubAccount.defaultDescription )

  const canProceed = useMemo( () => {
    return (
      accountName.length > 0 &&
      accountDescription.length > 0
    )
  }, [ accountName, accountDescription ] )

  useEffect( () => {
    nameInputRef.current?.focus()
  }, [] )

  // TODO: We need a bit more design clarity about what to do if
  // account creation fails here.
  useAccountShellCreationCompletionEffect( () => {
    console.log( 'dispatching resetToHomeAction' )
    navigation.dispatch( resetToHomeAction() )
  } )

  function handleProceedButtonPress() {
    setShowLoader( true )
    setButtonPressed( true )
    currentSubAccount.customDisplayName = accountName
    currentSubAccount.customDescription = accountDescription
    const accountsInfo: newAccountsInfo = {
      accountType: currentSubAccount.type,
      accountDetails: {
        name: accountName,
        description: accountDescription
      }
    }
    buttonPressed ? null : dispatch( addNewAccountShells( [ accountsInfo ] ) )
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

          <HeaderSection subAccountInfo={currentSubAccount} />

          <View style={styles.formContainer}>
            <Input
              inputContainerStyle={[ FormStyles.textInputContainer, styles.textInputContainer ]}
              inputStyle={FormStyles.inputText}
              placeholder={'Enter an account name'}
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
              inputContainerStyle={[ FormStyles.textInputContainer, styles.textInputContainer ]}
              inputStyle={FormStyles.inputText}
              placeholder={'Enter A Description'}
              placeholderTextColor={FormStyles.placeholderText.color}
              underlineColorAndroid={FormStyles.placeholderText.color}
              value={accountDescription}
              numberOfLines={2}
              onChangeText={setAccountDescription}
              maxLength={40}
            />
          </View>

          <View style={styles.footerSection}>
            <ButtonBlue
              buttonText="Proceed"
              handleButtonPress={handleProceedButtonPress}
              buttonDisable={ canProceed === false }
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
  },

  textInputContainer: {
    marginBottom: 12,
  },

  footerSection: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
} )


export default NewHexaAccountDetailsScreen
