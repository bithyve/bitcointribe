import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native'
import Colors from '../../common/Colors'
import FiatCurrencies from '../../common/FiatCurrencies'
import FormStyles from '../../common/Styles/FormStyles'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import ListStyles from '../../common/Styles/ListStyles'
import { Input, Button } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import { addNewAccountShell } from '../../store/actions/accounts'
import useAccountShellCreationCompletionEffect from '../../utils/hooks/account-effects/UseAccountShellCreationCompletionEffect'
import { resetToHomeAction } from '../../navigation/actions/NavigationActions'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import useWyreIntegrationState from '../../utils/hooks/state-selectors/accounts/UseWyreIntegrationState'
import openLink from '../../utils/OpenLink'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import DropDownPicker from 'react-native-dropdown-picker'
import { clearWyreCache } from '../../store/actions/WyreIntegration'
import { RFValue } from 'react-native-responsive-fontsize'

export type Props = {
  navigation: any;
};


const WyreOrderFormScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const amountInputRef = useRef<Input>( null )

  const currentSubAccount: ExternalServiceSubAccountInfo = useMemo( () => {
    return navigation.getParam( 'currentSubAccount' )
  }, [ navigation.state.params ] )

  const { wyreHostedUrl, wyreReservationSucceeded } = useWyreIntegrationState()
  const [ amountToBuyValue, setAmountToBuyValue ] = useState( '' )
  const preferredCurrencyCode = useCurrencyCode()

  const [ selectedCurrencyCodeChoice, setSelectedCurrencyCodeChoice ] = useState( {
    value: preferredCurrencyCode, label: preferredCurrencyCode,
  } )

  const currencyCodeChoices = useMemo( () => {
    return FiatCurrencies.map( item => {
      return {
        value: item.code,
        label: `${item.symbol} ${item.code}`,
      }
    } )
  }, [ FiatCurrencies ] )

  const canProceed = useMemo( () => {
    return (
      wyreReservationSucceeded &&
      wyreHostedUrl &&
      Boolean( Number( amountToBuyValue ) ) &&
      Number( amountToBuyValue ) > 0
    )
  }, [ amountToBuyValue, wyreReservationSucceeded, wyreHostedUrl ] )


  function handleProceedButtonPress() {
    openLink( wyreHostedUrl )
  }

  useEffect( () => {
    dispatch( clearWyreCache() )
  }, [] )

  useEffect( () => {
    amountInputRef.current?.focus()
  }, [] )

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
            <Text style={ListStyles.infoHeaderSubtitleText}>
              Enter details for your order
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={{
              zIndex: 10,
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
              paddingHorizontal: 30,
              marginBottom: 24,
            }}>
              <Text style={{
                flex: 0,
                marginBottom: 12,
                fontSize: RFValue( 14 ),
                fontWeight: '600',
                color: Colors.blue,
              }}>
                Enter the amount you'd like to order in:
              </Text>

              <DropDownPicker
                items={currencyCodeChoices}
                defaultValue={selectedCurrencyCodeChoice.value}
                containerStyle={{
                  minWidth: 130,
                  flex: 0,
                  height: 40,
                  marginBottom: 12,
                }}
                style={{
                  backgroundColor: Colors.secondaryBackgroundColor,
                }}
                itemStyle={{
                  justifyContent: 'flex-start',
                }}
                selectedLabelStyle={{
                  color: 'black'
                }}
                dropDownStyle={{
                  backgroundColor: Colors.backgroundColor,
                  paddingHorizontal: 12,
                  paddingVertical: 14,
                }}
                scrollViewProps={{
                  indicatorStyle: 'black',
                }}
                onChangeItem={item => setSelectedCurrencyCodeChoice( item )}
              />
            </View>

            <Input
              inputContainerStyle={[ FormStyles.textInputContainer, styles.textInputContainer ]}
              inputStyle={FormStyles.inputText}
              placeholder={'Enter An Amount'}
              placeholderTextColor={FormStyles.placeholderText.color}
              underlineColorAndroid={FormStyles.placeholderText.color}
              value={amountToBuyValue}
              maxLength={24}
              numberOfLines={1}
              keyboardType="number-pad"
              onChangeText={setAmountToBuyValue}
              ref={amountInputRef}
            />

            <View style={styles.proceedButtonContainer}>
              <Button
                raised
                buttonStyle={ButtonStyles.primaryActionButton}
                title="Proceed to Wyre"
                titleStyle={ButtonStyles.actionButtonText}
                onPress={handleProceedButtonPress}
                disabled={canProceed === false}
              />

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text style={{
                }}>
                  Powered by
                </Text>
                <Image
                  source={require( '../../assets/images/icons/wyre_large.png' )}
                  style={{
                    marginLeft: 2,
                    width: 50,
                    height: 30,
                  }}
                />
              </View>
            </View>

          </View>
        </View>

      </ScrollView>
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

  proceedButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  textInputContainer: {
    marginBottom: 12,
  },

  footerSection: {
    paddingHorizontal: 16,
  },
} )


export default WyreOrderFormScreen
