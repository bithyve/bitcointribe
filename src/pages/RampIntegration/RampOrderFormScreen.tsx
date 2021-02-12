import React, { useEffect, useMemo, useState } from 'react'
import { View, StyleSheet, Text, ScrollView, Image } from 'react-native'
import Colors from '../../common/Colors'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import ListStyles from '../../common/Styles/ListStyles'
import { Button, ListItem } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import useRampIntegrationState from '../../utils/hooks/state-selectors/accounts/UseRampIntegrationState'
import openLink from '../../utils/OpenLink'
import { clearRampCache, fetchRampReservation } from '../../store/actions/RampIntegration'
import useRampReservationFetchEffect from '../../utils/hooks/ramp-integration/UseRampReservationFetchEffect'
import DepositSubAccountShellListItem from '../Accounts/AddNew/RampAccount/DepositAccountShellListItem'
import useAccountShellForID from '../../utils/hooks/state-selectors/accounts/UseAccountShellForID'


export type Props = {
  navigation: any;
};

const RampOrderFormScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const { rampHostedUrl } = useRampIntegrationState()
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  const currentSubAccount: ExternalServiceSubAccountInfo = useMemo( () => {
    return navigation.getParam( 'currentSubAccount' )
  }, [ navigation.state.params ] )

  const rampAccountShell = useAccountShellForID( currentSubAccount.accountShellID )

  function handleProceedButtonPress() {
    if( !hasButtonBeenPressed ){dispatch( fetchRampReservation() )}
    setHasButtonBeenPressed( true )
  }

  useEffect( () => {
    dispatch( clearRampCache() )
  }, [] )


  useRampReservationFetchEffect( {
    onSuccess: () => {
      openLink( rampHostedUrl )
    },
    onFailure: () => {
      setHasButtonBeenPressed( true )
    }
  } )

  return (
    <ScrollView style={{
      flex: 1
    }}>
      <View style={styles.rootContentContainer}>

        <View style={ListStyles.infoHeaderSection}>

          <Text style={{
            ...ListStyles.infoHeaderTitleText, marginBottom: 10
          }}>
            Ramp Destination Account:
          </Text>

          <ListItem
            containerStyle={{
              backgroundColor: Colors.secondaryBackgroundColor,
              borderRadius: 12,
            }}
            disabled
          >
            <DepositSubAccountShellListItem accountShell={rampAccountShell} />
          </ListItem>
        </View>

        <View style={{
          paddingHorizontal: ListStyles.infoHeaderSection.paddingHorizontal,
          marginBottom: ListStyles.infoHeaderSection.paddingVertical,
        }}>
          <Text style={ListStyles.infoHeaderSubtitleText}>
            {'Hexa Ramp Account enables purchases of BTC using Apple Pay and debit cards.\n\nBy proceeding, you understand that Hexa does not operate the payment and processing of the Ramp service. BTC purchased will be transferred to the Hexa Ramp account.'}
          </Text>
        </View>

        <View style={styles.proceedButtonContainer}>
          <Button
            disabled={hasButtonBeenPressed}
            raised
            buttonStyle={ButtonStyles.primaryActionButton}
            title="Proceed to Ramp"
            titleStyle={ButtonStyles.actionButtonText}
            onPress={handleProceedButtonPress}
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
              source={require( '../../assets/images/icons/ramp_logo_large.png' )}
              style={{
                marginLeft: 5,
                width: 100,
                height: 40,
              }}
            />
          </View>
        </View>

      </View>
    </ScrollView>
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


export default RampOrderFormScreen
