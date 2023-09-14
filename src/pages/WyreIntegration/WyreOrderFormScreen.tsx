import React, { useEffect, useMemo, useState } from 'react'
import { View, StyleSheet, Text, ScrollView, Image } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import ListStyles from '../../common/Styles/ListStyles'
import { Button, ListItem } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import useWyreIntegrationState from '../../utils/hooks/state-selectors/accounts/UseWyreIntegrationState'
import openLink from '../../utils/OpenLink'
import { clearWyreCache, fetchWyreReservation, fetchWyreReceiveAddress } from '../../store/actions/WyreIntegration'
import useWyreReservationFetchEffect from '../../utils/hooks/wyre-integration/UseWyreReservationFetchEffect'
import DepositSubAccountShellListItem from '../Accounts/AddNew/WyreAccount/DepositAccountShellListItem'
import useAccountShellForID from '../../utils/hooks/state-selectors/accounts/UseAccountShellForID'
import { RFValue } from 'react-native-responsive-fontsize'


export type Props = {
  navigation: any;
  route: any;
};

const WyreOrderFormScreen: React.FC<Props> = ( { navigation, route }: Props ) => {

  const dispatch = useDispatch()
  const { wyreHostedUrl, wyreReceiveAddress } = useWyreIntegrationState()

  const [ hasButtonBeenPressed, setHasButtonBeenPressed ] = useState<boolean | false>()

  const currentSubAccount: ExternalServiceSubAccountInfo = useMemo( () => {
    return route.params?.currentSubAccount
  }, [ route.params ] )

  const wyreAccountShell = useAccountShellForID( currentSubAccount.accountShellID )

  function handleProceedButtonPress() {
    if( !hasButtonBeenPressed ){dispatch( fetchWyreReservation() )}
    setHasButtonBeenPressed( true )
  }

  useEffect( () => {
    dispatch( clearWyreCache() )
    dispatch( fetchWyreReceiveAddress() )
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

            <Text style={styles.bottomNoteInfoText}>
              {wyreReceiveAddress}
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
            {'Hexa Wyre Account enables BTC purchases using Apple Pay and debit cards.\n\nBy proceeding, you understand that Hexa does not operate the payment and processing of the Wyre service. BTC purchased will be transferred to the Hexa Wyre account.'}
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
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  }
} )


export default WyreOrderFormScreen
