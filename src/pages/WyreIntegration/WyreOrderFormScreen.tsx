import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native'
import Colors from '../../common/Colors'
import FormStyles from '../../common/Styles/FormStyles'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import ListStyles from '../../common/Styles/ListStyles'
import { Input, Button } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import useWyreIntegrationState from '../../utils/hooks/state-selectors/accounts/UseWyreIntegrationState'
import openLink from '../../utils/OpenLink'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import DropDownPicker from 'react-native-dropdown-picker'
import { clearWyreCache, fetchWyreReservation } from '../../store/actions/WyreIntegration'
import { RFValue } from 'react-native-responsive-fontsize'
import useWyreCurrencyCodeChoices, { WyreCurrencyCodePickerItem } from '../../utils/hooks/wyre-integration/UseWyreCurrencyCodeChoices'
import useWyreReservationFetchEffect from '../../utils/hooks/wyre-integration/UseWyreReservationFetchEffect'


export type Props = {
  navigation: any;
};

const WyreOrderFormScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const amountInputRef = useRef<Input>( null )


  const { wyreHostedUrl, hasWyreReservationFetchSucceeded } = useWyreIntegrationState()
  const [ amountToBuyValue, setAmountToBuyValue ] = useState( '' )
  const preferredCurrencyCode = useCurrencyCode()
  const currencyCodeChoices = useWyreCurrencyCodeChoices()

  const [ selectedCurrencyCodeChoice, setSelectedCurrencyCodeChoice ] = useState<WyreCurrencyCodePickerItem>( {
    value: preferredCurrencyCode,
    label: preferredCurrencyCode,
  } )

  const canProceed = useMemo( () => {
    return (
      Boolean( Number( amountToBuyValue ) ) &&
      Number( amountToBuyValue ) > 0
    )
  }, [ amountToBuyValue ] )


  useEffect( ()=>{
    if ( wyreHostedUrl && hasWyreReservationFetchSucceeded && Boolean( Number( amountToBuyValue ) ) &&
    Number( amountToBuyValue ) > 0 ) {
      openLink( wyreHostedUrl )
    }
  }, [ wyreHostedUrl, hasWyreReservationFetchSucceeded ] )

  function handleProceedButtonPress() {
    dispatch( fetchWyreReservation(
      amountToBuyValue,
      selectedCurrencyCodeChoice.value,
    ) )
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
} )


export default WyreOrderFormScreen
