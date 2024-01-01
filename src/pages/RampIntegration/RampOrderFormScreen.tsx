import React, { useEffect, useMemo, useState } from 'react'
import { View, StyleSheet, Text, ScrollView, Image } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import ListStyles from '../../common/Styles/ListStyles'
import { Button, ListItem } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import useRampIntegrationState from '../../utils/hooks/state-selectors/accounts/UseRampIntegrationState'
import openLink from '../../utils/OpenLink'
import { clearRampCache, fetchRampReservation, fetchRampReceiveAddress } from '../../store/actions/RampIntegration'
import useRampReservationFetchEffect from '../../utils/hooks/ramp-integration/UseRampReservationFetchEffect'
import DepositSubAccountShellListItem from '../Accounts/AddNew/RampAccount/DepositAccountShellListItem'
import useAccountShellForID from '../../utils/hooks/state-selectors/accounts/UseAccountShellForID'
import { RFValue } from 'react-native-responsive-fontsize'


export type Props = {
  navigation: any;
  route: any;
};

const RampOrderFormScreen: React.FC<Props> = ( { navigation, route }: Props ) => {
  const dispatch = useDispatch()
  const { rampHostedUrl, rampReceiveAddress } = useRampIntegrationState()
  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()
  const currentSubAccount: ExternalServiceSubAccountInfo = useMemo( () => {
    return route.params?.currentSubAccount
  }, [ route.params ] )

  const rampAccountShell = useAccountShellForID( currentSubAccount.accountShellID )

  function handleProceedButtonPress() {
    if( !hasButtonBeenPressed ){dispatch( fetchRampReservation() )}
    setHasButtonBeenPressed( true )
  }

  useEffect( () => {
    dispatch( clearRampCache() )
    dispatch( fetchRampReceiveAddress() )
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
          <Text style={{
            ...ListStyles.infoHeaderTitleText, marginBottom: 10, marginTop: 10
          }}>
            Bitcoin receving address:
          </Text>
          <ListItem
            containerStyle={{
              backgroundColor: Colors.secondaryBackgroundColor,
              borderRadius: 12,
            }}
            disabled
          >

            <Text style={{
              ...styles.bottomNoteInfoText
            }}>
              {rampReceiveAddress}
            </Text>
          </ListItem>
        </View>

        <View style={{
          paddingHorizontal: ListStyles.infoHeaderSection.paddingHorizontal,
          marginBottom: ListStyles.infoHeaderSection.paddingVertical,
        }}>
          <Text style={{
            textAlign: 'justify', ...ListStyles.infoHeaderSubtitleText
          }}>
            {'Bitcoin Tribe Ramp Account enables BTC purchases using Apple Pay, debit card, bank transfer as well as easy transfers using open banking where available\n\nPayment methods available may vary based on your country. By proceeding, you understand that Bitcoin Tribe does not operate the payment and processing of the Ramp service. BTC purchased will be transferred to the Bitcoin Tribe Ramp account address displayed above.'}
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
                width: 62,
                height: 27,

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
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  }
} )


export default RampOrderFormScreen
