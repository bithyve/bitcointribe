import React, { useEffect, useMemo, useState } from 'react'
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native'
import FormStyles from '../../../../common/Styles/FormStyles'
import ButtonStyles from '../../../../common/Styles/ButtonStyles'
import ListStyles from '../../../../common/Styles/ListStyles'
import { Input, Button } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import ExternalServiceSubAccountInfo from '../../../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import SwanAccountCreationStatus from '../../../../common/data/enums/SwanAccountCreationStatus'
import useSwanIntegrationState from '../../../../utils/hooks/state-selectors/accounts/UseSwanIntegrationState'
import BottomInfoBox from '../../../../components/BottomInfoBox'
import { fetchSwanAuthenticationUrl, clearSwanCache, createTempSwanAccountInfo, updateSwanStatus } from '../../../../store/actions/SwanIntegration'
import openLink from '../../../../utils/OpenLink'
export type Props = {
  navigation: any;
  route: any;
};

const NewSwanAccountDetailsScreen: React.FC<Props> = ( { navigation, route }: Props ) => {
  const dispatch = useDispatch()

  const currentSubAccount: ExternalServiceSubAccountInfo = useMemo( () => {
    return route.params?.currentSubAccount
  }, [ route.params ] )

  const { hasFetchSwanAuthenticationUrlInitiated, hasFetchSwanAuthenticationUrlSucceeded, swanAuthenticationUrl, hasRedeemSwanCodeForTokenInitiated } = useSwanIntegrationState()

  const [ accountName, setAccountName ] = useState( currentSubAccount.defaultTitle )
  const [ accountDescription, setAccountDescription ] = useState( 'Sats purchased from  Swan' )
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  useEffect( ()=>{
    dispatch( clearSwanCache() )
  }, [] )
  const canProceed = useMemo( () => {
    return (
      accountName.length > 0 &&
      accountDescription.length > 0 &&
      !hasButtonBeenPressed
    )
  }, [ accountName, accountDescription, ] )


  function handleProceedButtonPress() {
    setHasButtonBeenPressed( true )
    currentSubAccount.customDisplayName = accountName
    currentSubAccount.customDescription = accountDescription
    if( !hasFetchSwanAuthenticationUrlInitiated ) {
      dispatch( fetchSwanAuthenticationUrl( {
      } ) )
    }
  }

  useEffect( ()=>{
    if( !hasRedeemSwanCodeForTokenInitiated && hasFetchSwanAuthenticationUrlSucceeded && swanAuthenticationUrl ) {
      openLink( swanAuthenticationUrl )
      dispatch( updateSwanStatus( SwanAccountCreationStatus.ADD_NEW_ACCOUNT_INITIATED ) )
      dispatch( createTempSwanAccountInfo( currentSubAccount ) )
    }
  }, [ hasFetchSwanAuthenticationUrlSucceeded, swanAuthenticationUrl, hasRedeemSwanCodeForTokenInitiated ] )

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
              Enter details for the new  Swan Account
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
                placeholder={'Enter a description'}
                placeholderTextColor={FormStyles.placeholderText.color}
                underlineColorAndroid={FormStyles.placeholderText.color}
                value={accountDescription}
                numberOfLines={2}
                onChangeText={setAccountDescription}
              />
            </View>
            <View style={{
              marginBottom: 12
            }}>
              <BottomInfoBox
                containerStyle={{
                  textAlign: 'justify',
                  marginTop: 0,
                  paddingTop: 0,
                  paddingHorizontal: 12,

                }}
                infoText={'Bitcoin Tribe  Swan Account enables BTC purchases using Apple Pay, debit card, bank transfer as well as easy transfers using open banking where available\n\nPayment methods available may vary based on your country. By proceeding, you understand that Bitcoin Tribe does not operate the payment and processing of the  Swan service. BTC purchased will be transferred to a new Bitcoin Tribe  Swan account.'}
              />
            </View>
            <View style={styles.footerSection}>
              <Button
                raised
                buttonStyle={ButtonStyles.primaryActionButton}
                title="Proceed to  Swan"
                titleStyle={ButtonStyles.actionButtonText}
                onPress={handleProceedButtonPress}
                disabled={canProceed === false}
              />
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{


                }}>
                  Powered by
                </Text>
                <Image
                  source={require( '../../../../assets/images/icons/swan_logo_large.png' )}
                  style={{
                    marginLeft: 5,
                    width: 62,
                    height: 27,

                  }}
                />
              </View>
            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>
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


export default NewSwanAccountDetailsScreen
