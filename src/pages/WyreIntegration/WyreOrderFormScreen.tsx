import React, { useEffect, useMemo, useState } from 'react'
import { View, StyleSheet, Text, ScrollView, Image } from 'react-native'
import Colors from '../../common/Colors'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import ListStyles from '../../common/Styles/ListStyles'
import { Button, ListItem } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import useWyreIntegrationState from '../../utils/hooks/state-selectors/accounts/UseWyreIntegrationState'
import openLink from '../../utils/OpenLink'
import { clearWyreCache, fetchWyreReservation } from '../../store/actions/WyreIntegration'
import useWyreReservationFetchEffect from '../../utils/hooks/wyre-integration/UseWyreReservationFetchEffect'
import DepositSubAccountShellListItem from '../Accounts/AddNew/WyreAccount/DepositAccountShellListItem'
import useAccountShellForID from '../../utils/hooks/state-selectors/accounts/UseAccountShellForID'


export type Props = {
  navigation: any;
};

const WyreOrderFormScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const { wyreHostedUrl } = useWyreIntegrationState()
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  const currentSubAccount: ExternalServiceSubAccountInfo = useMemo( () => {
    return navigation.getParam( 'currentSubAccount' )
  }, [ navigation.state.params ] )

  const wyreAccountShell = useAccountShellForID( currentSubAccount.accountShellID )

  function handleProceedButtonPress() {
    if( !hasButtonBeenPressed ){dispatch( fetchWyreReservation() )}
    setHasButtonBeenPressed( true )
  }

  useEffect( () => {
    dispatch( clearWyreCache() )
  }, [] )


  useWyreReservationFetchEffect( {
    onSuccess: () => {
      openLink( wyreHostedUrl )
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
            Wyre Destination Account:
          </Text>

          <ListItem
            containerStyle={{
              backgroundColor: Colors.secondaryBackgroundColor,
              borderRadius: 12,
            }}
            disabled
          >
            <DepositSubAccountShellListItem accountShell={wyreAccountShell} />
          </ListItem>
        </View>

        <View style={{
          paddingHorizontal: ListStyles.infoHeaderSection.paddingHorizontal,
          marginBottom: ListStyles.infoHeaderSection.paddingVertical,
        }}>
          <Text style={ListStyles.infoHeaderSubtitleText}>
            {'Hexa Wyre Account enables purchases of BTC using Apple Pay and debit cards.\n\nBy proceeding, you understand that Hexa does not operate the payment and processing of the Wyre service. BTC purchased will be transferred to the Hexa Wyre account.'}
          </Text>
        </View>

        <View style={styles.proceedButtonContainer}>
          <Button
            disabled={hasButtonBeenPressed}
            raised
            buttonStyle={ButtonStyles.primaryActionButton}
            title="Proceed to Wyre"
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
              source={require( '../../assets/images/icons/wyre_logo_large.png' )}
              style={{
                marginLeft: 2,
                width: 50,
                height: 30,
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


export default WyreOrderFormScreen
