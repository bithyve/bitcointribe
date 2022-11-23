import React, { ReactElement, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import HeadingStyles from '../../../common/Styles/HeadingStyles'
import BottomInfoBox from '../../../components/BottomInfoBox'
import CoveredQRCodeScanner from '../../../components/qr-code-scanning/CoveredQRCodeScanner'
import RecipientAddressTextInputSection from '../../../components/send/RecipientAddressTextInputSection'
import RecipientSelectionStrip from '../../../components/send/RecipientSelectionStrip'
import AccountShell from '../../../common/data/models/AccountShell'
import { ContactRecipientDescribing, RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import { BarCodeReadEvent } from 'react-native-camera'
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view'
import { makeAccountRecipientDescription } from '../../../utils/sending/RecipientFactories'
import RecipientKind from '../../../common/data/enums/RecipientKind'
import useSelectedRecipientsForSending from '../../../utils/hooks/state-selectors/sending/UseSelectedRecipientsForSending'
import { translations } from '../../../common/content/LocContext'
import { hp, wp } from '../../../common/data/responsiveness/responsive'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import SelectAccount from '../../../components/SelectAccount'

export type Props = {
  accountShell: AccountShell;
  setAccountShell: any;
  sendableContacts: ContactRecipientDescribing[];
  sendableAccountShells: AccountShell[];
  onQRScanned: ( { data: barcodeDataString }: BarCodeReadEvent ) => void;
  onAddressSubmitted: ( address: string ) => void;
  onPaymentURIEntered: ( uri: string ) => void;
  onRecipientSelected: ( recipient: RecipientDescribing ) => void;
  address: string;
};

export enum SectionKind {
  CURRENT_ACCOUNT,
  SCAN_QR,
  ENTER_ADDRESS,
  SELECT_CONTACTS,
  SELECT_ACCOUNT_SHELLS,
}

const sectionListItemKeyExtractor = ( index ) => String( index )


const AccountSendScreen: React.FC<Props> = ( {
  accountShell,
  setAccountShell,
  sendableContacts,
  sendableAccountShells,
  onQRScanned,
  onAddressSubmitted,
  onPaymentURIEntered,
  onRecipientSelected,
  address,
}: Props ) => {
  const selectedRecipients = useSelectedRecipientsForSending()
  const common  = translations[ 'common' ]
  const strings  = translations[ 'accounts' ]
  const accountRecipients = useMemo( () => {
    return sendableAccountShells.map( makeAccountRecipientDescription )
  }, [ sendableAccountShells ] )

  const isShowingSelectableAccountsSection = useMemo( () => {
    return Boolean( sendableAccountShells.length )
  }, [ sendableAccountShells, accountShell.primarySubAccount.kind ] )

  const selectedContactRecipients = useMemo( () => {
    return selectedRecipients.filter( recipient => recipient.kind == RecipientKind.CONTACT )
  }, [ selectedRecipients ] )

  const selectedAccountRecipients = useMemo( () => {
    return selectedRecipients.filter( recipient => recipient.kind == RecipientKind.ACCOUNT_SHELL )
  }, [ selectedRecipients ] )

  function renderSectionHeader(
    sectionKind: SectionKind,
  ): ReactElement | null {
    switch ( sectionKind ) {
        case SectionKind.SELECT_CONTACTS:
          return <Text style={styles.listSectionHeading}>{'or send to a contact'}</Text>
        case SectionKind.SELECT_ACCOUNT_SHELLS:
          return <Text style={styles.listSectionHeading}>{strings.Sendtoaccount}</Text>
    }
  }

  const sections = useMemo( () => {
    return [
      ...[
        {
          kind: SectionKind.CURRENT_ACCOUNT,
          data: [ null ],
          renderItem: () => {
            return (
              <SelectAccount onSelect={( item ) => {
                setAccountShell( item )
              }} />
            )
          }
        },
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
                    width: widthPercentageToDP( 95 ),
                    alignSelf: 'center'
                  }}
                  address={address}
                  placeholder={strings.Enteraddressmanually}
                  accountShell={accountShell}
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
                      accountKind={accountShell.primarySubAccount.kind}
                      recipients={sendableContacts}
                      selectedRecipients={selectedContactRecipients}
                      onRecipientSelected={onRecipientSelected}
                    />
                  ) ) || (
                    <BottomInfoBox
                      containerStyle={styles.infoBoxContainer}
                      title={strings.YouhavenotaddedanyContacts}
                      infoText={strings.AddaContact}
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
                  accountKind={accountShell.primarySubAccount.kind}
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
  }, [ sendableContacts ] )

  return (
    <View style={styles.rootContainer}>
      <StatusBar
        animated={true}
        backgroundColor={Colors.blue} />

      <KeyboardAwareSectionList
        extraData={[
          sendableContacts,
          sendableAccountShells,
        ]}
        contentContainerStyle={{
          paddingVertical: 16
        }}
        showsVerticalScrollIndicator={false}
        sections={sections}
        keyExtractor={sectionListItemKeyExtractor}
        renderSectionHeader={( { section } ) => {
          return renderSectionHeader( section.kind )
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
    paddingHorizontal: 20,
  },

  listSectionHeading: {
    ...HeadingStyles.listSectionHeading,
    marginBottom: 9,
    paddingHorizontal: 28,
    fontSize: RFValue( 13 ),
  },

  qrScannerContainer: {
    // width: '100%',
    // maxWidth: qrScannerHeight * ( 1.40 ),
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
  accountSelectionView: {
    width: '90%',
    // shadowOpacity: 0.06,
    // shadowOffset: {
    //   width: 10, height: 10
    // },
    // shadowRadius: 10,
    // elevation: 2,
    alignSelf: 'center',
    marginTop: hp( 2 ),
    marginBottom: hp( 2 ),
  },
  availableToSpendText: {
    color: '#505050',
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.RobotoSlabLight,
    lineHeight: 15,
  },
  balanceText: {
    color: '#505050',
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.RobotoSlabLight,
    lineHeight: 15,
  },
} )

export default AccountSendScreen
