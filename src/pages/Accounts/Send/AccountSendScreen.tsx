import React, { ReactElement, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import HeadingStyles from '../../../common/Styles/HeadingStyles'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import BottomInfoBox from '../../../components/BottomInfoBox'
import CoveredQRCodeScanner from '../../../components/qr-code-scanning/CoveredQRCodeScanner'
import RecipientAddressTextInputSection from '../../../components/send/RecipientAddressTextInputSection'
import RecipientSelectionStrip from '../../../components/send/RecipientSelectionStrip'
import AccountShell from '../../../common/data/models/AccountShell'
import { ContactRecipientDescribing, RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import { BarCodeReadEvent } from 'react-native-camera'
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view'
import { makeAccountRecipientDescription } from '../../../utils/sending/RecipientFactories'
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import RecipientKind from '../../../common/data/enums/RecipientKind'

export type Props = {
  primarySubAccount: SubAccountDescribing;
  sendableContacts: ContactRecipientDescribing[];
  sendableAccountShells: AccountShell[];
  onQRScanned: ( { data: barcodeDataString }: BarCodeReadEvent ) => void;
  onAddressSubmitted: ( address: string ) => void;
  onPaymentURIEntered: ( uri: string ) => void;
  onRecipientSelected: ( recipient: RecipientDescribing ) => void;
};

export enum SectionKind {
  SCAN_QR,
  ENTER_ADDRESS,
  SELECT_CONTACTS,
  SELECT_ACCOUNT_SHELLS,
}

const sectionListItemKeyExtractor = ( index ) => String( index )

function renderSectionHeader(
  sectionKind: SectionKind,
  subAccountKind: SubAccountKind,
): ReactElement | null {
  switch ( sectionKind ) {
      case SectionKind.SELECT_CONTACTS:
        return <Text style={styles.listSectionHeading}>Send To Contacts</Text>
      case SectionKind.SELECT_ACCOUNT_SHELLS:
        if ( subAccountKind != SubAccountKind.TEST_ACCOUNT ) {
          return <Text style={styles.listSectionHeading}>Send To Accounts</Text>
        }
  }
}

const AccountSendScreen: React.FC<Props> = ( {
  primarySubAccount,
  sendableContacts,
  sendableAccountShells,
  onQRScanned,
  onAddressSubmitted,
  onPaymentURIEntered,
  onRecipientSelected,
}: Props ) => {
  const sendingState = useSendingState()

  const accountRecipients = useMemo( () => {
    return sendableAccountShells.map( makeAccountRecipientDescription )
  }, [ sendableAccountShells ] )

  const isShowingSelectableAccountsSection = useMemo( () => {
    return primarySubAccount.kind != SubAccountKind.TEST_ACCOUNT && sendableAccountShells.length
  }, [ sendableAccountShells, primarySubAccount.kind ] )

  const selectedContactRecipients = useMemo( () => {
    return sendingState
      .selectedRecipients
      .filter( recipient => recipient.kind == RecipientKind.CONTACT )
  }, [ sendingState ] )


  const selectedAccountRecipients = useMemo( () => {
    return sendingState
      .selectedRecipients
      .filter( recipient => recipient.kind == RecipientKind.ACCOUNT_SHELL )
  }, [ sendingState ] )

  const sections = useMemo( () => {
    return [
      ...[
        {
          kind: SectionKind.SCAN_QR,
          data: [ null ],
          renderItem: () => {
            return (
              <View style={styles.viewSectionContainer}>
                <CoveredQRCodeScanner
                  onCodeScanned={onQRScanned}
                  containerStyle={styles.qrScannerContainer}
                />
              </View>
            )
          },
        },
        {
          kind: SectionKind.ENTER_ADDRESS,
          data: [ null ],
          renderItem: () => {
            return (
              <View style={styles.viewSectionContainer}>
                <RecipientAddressTextInputSection
                  containerStyle={{
                    ...styles.viewSectionContentContainer, margin: 0
                  }}
                  placeholder="Enter Address Manually"
                  subAccountKind={primarySubAccount.kind}
                  onAddressEntered={onAddressSubmitted}
                  onPaymentURIEntered={onPaymentURIEntered}
                />
              </View>
            )
          },
        },
        {
          kind: SectionKind.SELECT_CONTACTS,
          data: [ null ],
          renderItem: () => {
            return (
              <View style={styles.viewSectionContainer}>
                <View style={styles.viewSectionContentContainer}>
                  {( sendableContacts.length && (
                    <RecipientSelectionStrip
                      accountKind={primarySubAccount.kind}
                      recipients={sendableContacts}
                      selectedRecipients={selectedContactRecipients}
                      onRecipientSelected={onRecipientSelected}
                    />
                  ) ) || (
                    <BottomInfoBox
                      containerStyle={styles.infoBoxContainer}
                      title="You have not added any Contacts"
                      infoText="Add a Contact to send them sats without having to scan an address"
                    />
                  )}
                </View>
              </View>
            )
          },
        },
      ],
      ...( isShowingSelectableAccountsSection ? [ {
        kind: SectionKind.SELECT_ACCOUNT_SHELLS,
        data: [ null ],
        renderItem: () => {
          return (
            <View style={styles.viewSectionContainer}>
              <View style={styles.viewSectionContentContainer}>
                <RecipientSelectionStrip
                  accountKind={primarySubAccount.kind}
                  recipients={accountRecipients}
                  selectedRecipients={selectedAccountRecipients}
                  onRecipientSelected={onRecipientSelected}
                />
              </View>
            </View>
          )
        },
      } ] : [] ),
    ]
  }, [] )

  return (
    <View style={styles.rootContainer}>
      <KeyboardAwareSectionList
        extraData={[
          sendableContacts,
          sendableAccountShells,
        ]}
        showsVerticalScrollIndicator={false}
        sections={sections}
        keyExtractor={sectionListItemKeyExtractor}
        renderSectionHeader={( { section } ) => {
          return renderSectionHeader( section.kind, primarySubAccount.kind )
        }}
        stickySectionHeadersEnabled={false}
      />
    </View>
  )
}


const qrScannerHeight = heightPercentageToDP( 35 )

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: 'white',
  },

  viewSectionContainer: {
    marginBottom: 16,
  },

  viewSectionContentContainer: {
    paddingHorizontal: 22,
  },

  listSectionHeading: {
    ...HeadingStyles.listSectionHeading,
    marginBottom: 9,
    paddingHorizontal: 28,
    fontSize: RFValue( 13 ),
  },

  qrScannerContainer: {
    width: '100%',
    maxWidth: qrScannerHeight * ( 1.31 ),
    height: qrScannerHeight,
    marginBottom: 9,
  },

  // Undo the info box component's coupling to margin
  infoBoxContainer: {
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
  },
} )

export default AccountSendScreen
