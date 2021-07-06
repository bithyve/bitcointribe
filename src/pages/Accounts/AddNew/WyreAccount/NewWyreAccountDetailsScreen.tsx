import React, { useMemo, useState } from 'react'
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import FormStyles from '../../../../common/Styles/FormStyles'
import ButtonStyles from '../../../../common/Styles/ButtonStyles'
import ListStyles from '../../../../common/Styles/ListStyles'
import { Input, Button } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import useAccountShellCreationCompletionEffect from '../../../../utils/hooks/account-effects/UseAccountShellCreationCompletionEffect'
import ExternalServiceSubAccountInfo from '../../../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import useWyreIntegrationState from '../../../../utils/hooks/state-selectors/accounts/UseWyreIntegrationState'
import BottomInfoBox from '../../../../components/BottomInfoBox'
import { fetchWyreReservation } from '../../../../store/actions/WyreIntegration'
import useWyreReservationFetchEffect from '../../../../utils/hooks/wyre-integration/UseWyreReservationFetchEffect'
import openLink from '../../../../utils/OpenLink'

export type Props = {
  navigation: any;
};

const NewWyreAccountDetailsScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()

  const currentSubAccount: ExternalServiceSubAccountInfo = useMemo( () => {
    return navigation.getParam( 'currentSubAccount' )
  }, [ navigation.state.params ] )

  const { wyreHostedUrl } = useWyreIntegrationState()

  const [ accountName, setAccountName ] = useState( currentSubAccount.defaultTitle )
  const [ accountDescription, setAccountDescription ] = useState( 'Sats purchased from Wyre' )
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  const canProceed = useMemo( () => {
    return (
      accountName.length > 0 &&
      accountDescription.length > 0 &&
      !hasButtonBeenPressed
    )
  }, [ accountName, accountDescription, ] )


  function handleProceedButtonPress() {
    currentSubAccount.customDisplayName = accountName
    currentSubAccount.customDescription = accountDescription

    // if( !hasButtonBeenPressed ){dispatch( addNewAccountShell( currentSubAccount ) )}
    setHasButtonBeenPressed( true )
  }

  useAccountShellCreationCompletionEffect( () => {
    dispatch( fetchWyreReservation() )
  } )

  useWyreReservationFetchEffect( {
    onSuccess: () => {
      openLink( wyreHostedUrl )
    }
  } )

  return (
    <View style={styles.rootContainer}>
      <KeyboardAvoidingView
        style={{
          flex: 1
        }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={{
          flex: 1
        }}>
          <View style={styles.rootContentContainer}>

            <View style={ListStyles.infoHeaderSection}>
              <Text style={ListStyles.infoHeaderSubtitleText}>
              Enter details for the new Wyre Account
              </Text>
            </View>

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
                title="Proceed to Wyre"
                titleStyle={ButtonStyles.actionButtonText}
                onPress={handleProceedButtonPress}
                disabled={canProceed === false}
              />
            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

      <View style={{
        marginBottom: 12
      }}>
        <BottomInfoBox
          containerStyle={{
            marginTop: 0,
            paddingTop: 0,
            paddingHorizontal: 12,
          }}
          infoText={'Hexa Wyre Account enables BTC purchases using Apple Pay and debit cards.\n\nBy proceeding, you understand that Hexa does not operate the payment and processing of the Wyre service. BTC purchased will be transferred to the Hexa Wyre account.'}
        />
      </View>
    </View>
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
    alignItems: 'center',
  },
} )


export default NewWyreAccountDetailsScreen
