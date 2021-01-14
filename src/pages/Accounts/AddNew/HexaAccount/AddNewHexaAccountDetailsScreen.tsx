import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import FormStyles from '../../../../common/Styles/FormStyles'
import ButtonStyles from '../../../../common/Styles/ButtonStyles'
import ListStyles from '../../../../common/Styles/ListStyles'
import { Input, Button } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import { addNewAccountShell } from '../../../../store/actions/accounts'
import useAccountShellCreationCompletionEffect from '../../../../utils/hooks/account-effects/UseAccountShellCreationCompletionEffect'
import { resetToHomeAction } from '../../../../navigation/actions/NavigationActions'
import { HexaSubAccountDescribing } from '../../../../common/data/models/SubAccountInfo/Interfaces'
import Loader from '../../../../components/loader'
import Colors from '../../../../common/Colors';

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

const AddNewHexaAccountDetailsScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const nameInputRef = useRef<Input>( null )

  const currentSubAccountInfo: HexaSubAccountDescribing = useMemo( () => {
    return navigation.getParam( 'currentSubAccountInfo' )
  }, [ navigation.state.params ] )
  const [showLoader, setShowLoader] = useState(false);

  const [ accountName, setAccountName ] = useState( currentSubAccountInfo.defaultTitle )
  const [ accountDescription, setAccountDescription ] = useState( '' )

  const canProceed = useMemo( () => {
    return (
      accountName.length > 0 &&
      accountDescription.length > 0
    )
  }, [ accountName, accountDescription ] )

  useEffect( () => {
    nameInputRef.current?.focus()
  }, [] )

  // TODO: We need a bit more design clarity about what to do after new
  // account creation succeeds or fails.
  useAccountShellCreationCompletionEffect( () => {
    console.log( 'dispatching resetToHomeAction' )
    navigation.dispatch( resetToHomeAction() )
  } )

  function handleProceedButtonPress() {
    setShowLoader(true);
    currentSubAccountInfo.customDisplayName = accountName
    currentSubAccountInfo.customDescription = accountDescription
    console.log( 'dispatching addNewAccountShell' )
    dispatch( addNewAccountShell( currentSubAccountInfo ) )
  }

  return (
    // <View style={styles.rootContainer}>
    <KeyboardAvoidingView
      style={styles.rootContainer}
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{
        flex: 1
      }}>
        <View style={styles.rootContentContainer}>

          <HeaderSection subAccountInfo={currentSubAccountInfo} />

          <View style={styles.formContainer}>
            <Input
              inputContainerStyle={[ FormStyles.textInputContainer, styles.textInputContainer ]}
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
              inputContainerStyle={[ FormStyles.textInputContainer, styles.textInputContainer ]}
              inputStyle={FormStyles.inputText}
              placeholder={'Enter A Description'}
              placeholderTextColor={FormStyles.placeholderText.color}
              underlineColorAndroid={FormStyles.placeholderText.color}
              value={accountDescription}
              numberOfLines={2}
              onChangeText={setAccountDescription}
            />
          </View>

          <View style={styles.footerSection}>
            <Button
              raised
              buttonStyle={ButtonStyles.primaryActionButton}
              title="Proceed"
              disabledStyle={ButtonStyles.disabledPrimaryActionButton}
              disabledTitleStyle={ButtonStyles.actionButtonText}
              titleStyle={ButtonStyles.actionButtonText}
              onPress={handleProceedButtonPress}
              disabled={canProceed === false}
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
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    elevation: 5
  },
} )


export default AddNewHexaAccountDetailsScreen
