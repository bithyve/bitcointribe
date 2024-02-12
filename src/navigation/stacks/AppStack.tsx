import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import Colors from '../../common/Colors.js'
import { translations } from '../../common/content/LocContext'
import { default as SmallNavHeaderBackButton, default as SmallNavHeaderCloseButton } from '../../components/navigation/SmallNavHeaderBackButton'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import AccountSettingsEditDisplayPropertiesScreen from '../../pages/Accounts/AccountSettings/AccountSettingsEditDisplayPropertiesScreen'
import AccountSettingsMainScreen from '../../pages/Accounts/AccountSettings/AccountSettingsMainScreen'
import DonationAccountWebViewSettingsScreen from '../../pages/Accounts/AccountSettings/DonationAccountWebViewSettingsScreen'
import AccountSettingsEditVisibilityScreen from '../../pages/Accounts/AccountSettings/EditVisibilityScreen'
import AccountSettingsMergeAccountShellsScreen from '../../pages/Accounts/AccountSettings/MergeAccountShellsScreen'
import ReassignTransactionsMainOptionsScreen from '../../pages/Accounts/AccountSettings/ReassignTransactions/MainOptionsScreen'
import ReassignTransactionsSelectDestinationScreen from '../../pages/Accounts/AccountSettings/ReassignTransactions/SelectDestinationAccountScreen'
import SelectReassignableTransactionsScreen from '../../pages/Accounts/AccountSettings/ReassignTransactions/SelectReassignableTransactionsScreen'
import ReassignSubAccountSourcesSelectSourcesScreen from '../../pages/Accounts/AccountSettings/ReassignTransactions/SelectSubAccountSourcesScreen'
import XPubDetailsScreen from '../../pages/Accounts/AccountSettings/XPubDetailsScreen'
import NewRampAccountDetailsScreen from '../../pages/Accounts/AddNew/RampAccount/NewRampAccountDetailsScreen'
import NewWyreAccountDetailsScreen from '../../pages/Accounts/AddNew/WyreAccount/NewWyreAccountDetailsScreen'
import AccountDetailsContainerScreen from '../../pages/Accounts/Details/AccountDetailsContainerScreen'
import GoogleAuthenticatorOTP from '../../pages/Accounts/GoogleAuthenticatorOTP'
import NewTwoFASecret from '../../pages/Accounts/NewTwoFASecret'
import Receive from '../../pages/Accounts/Receive'
import SecureScan from '../../pages/Accounts/SecureScan'
import AccountSendConfirmationContainerScreen from '../../pages/Accounts/Send/AccountSendConfirmationContainerScreen'
import AccountSendContainerScreen from '../../pages/Accounts/Send/AccountSendContainerScreen'
import OTPAuthenticationScreen from '../../pages/Accounts/Send/OTPAuthentication'
import SentAmountForContactFormScreen from '../../pages/Accounts/Send/SentAmountForContactFormScreen'
import SubAccountTFAHelpScreen from '../../pages/Accounts/SubAccountTFAHelpScreen'
import TransactionDetailsContainerScreen from '../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import TransactionsListContainerScreen from '../../pages/Accounts/Transactions/TransactionsListContainerScreen'
import TwoFASetup from '../../pages/Accounts/TwoFASetup'
import TwoFASweepFunds from '../../pages/Accounts/TwoFASweepFunds'
import TwoFAValidation from '../../pages/Accounts/TwoFAValidation'
import AssetsDetailScreen from '../../pages/Assets/AssetsDetailScreen'
import BackupGridMnemonic from '../../pages/borderwallet/BackupGridMnemonic'
import BorderWalletGridScreen from '../../pages/borderwallet/BorderWalletGridScreen'
import ConfirmDownload from '../../pages/borderwallet/ConfirmDownload'
import CreatePassPhrase from '../../pages/borderwallet/CreatePassPhrase'
import CreateWithBorderWallet from '../../pages/borderwallet/CreateWithBorderWallet'
import DownloadEncryptGrid from '../../pages/borderwallet/DownloadEncryptGrid'
import ImportBorderWallet from '../../pages/borderwallet/ImportBorderWallet'
import ImportBWGrid from '../../pages/borderwallet/ImportBWGrid'
import ImportWalletPassphrase from '../../pages/borderwallet/ImportWalletPassphrase'
import PreviewPattern from '../../pages/borderwallet/PreviewPattern'
import RecoverBorderWallet from '../../pages/borderwallet/RecoverBorderWallet'
import SelectChecksumWord from '../../pages/borderwallet/SelectChecksumWord'
import SelectEntropyGridType from '../../pages/borderwallet/SelectEntropyGridType'
import ValidateBorderWalletChecksum from '../../pages/borderwallet/ValidateBorderWalletChecksum'
import ValidateBorderWalletPattern from '../../pages/borderwallet/ValidateBorderWalletPattern'
import AddContactAddressBook from '../../pages/Contacts/AddContactAddressBook'
import AddContactSendRequest from '../../pages/Contacts/AddContactSendRequest'
import ContactDetails from '../../pages/Contacts/ContactDetails'
import SendRequest from '../../pages/Contacts/SendRequest'
import ContactsListForAssociateContact from '../../pages/CustodianRequest/ContactsListForAssociateContact'
import CustodianRequestAccepted from '../../pages/CustodianRequest/CustodianRequestAccepted'
import CustodianRequestOTP from '../../pages/CustodianRequest/CustodianRequestOTP'
import PairNewWallet from '../../pages/FastBitcoin/PairNewWallet'
import VoucherScanner from '../../pages/FastBitcoin/VoucherScanner'
import CreateGift from '../../pages/FriendsAndFamily/CreateGift'
import EnterGiftDetails from '../../pages/FriendsAndFamily/EnterGiftDetails'
import FriendsAndFamilyScreen from '../../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import GiftDetails from '../../pages/FriendsAndFamily/GiftDetails'
import GiftQRScannerScreen from '../../pages/FriendsAndFamily/GiftQrScanner'
import ManageGifts from '../../pages/FriendsAndFamily/ManageGifts'
import SendGift from '../../pages/FriendsAndFamily/SendGift'
import SendViaLinkAndQR from '../../pages/FriendsAndFamily/SendViaLinkAndQR'
import FundingSourceDetailsScreen from '../../pages/FundingSources/FundingSourceDetailsScreen'
import FundingSourcesScreen from '../../pages/FundingSources/FundingSourcesContainerScreen'
import ClaimSatsScreen from '../../pages/Gift/ClaimSatsScreen'
import GiftCreatedScreen from '../../pages/Gift/GiftCreatedScreen'
import SetUpSatCardScreen from '../../pages/Gift/SetUpSatCardScreen'
import SetUpSatNextCardScreen from '../../pages/Gift/SetUpSatNextCardScreen'
import HomeQRScannerScreen from '../../pages/Home/HomeQRScannerScreen'
import ReceiveQrScreen from '../../pages/Home/ReceiveQrScreen'
import Intermediate from '../../pages/Intermediate'
import Launch from '../../pages/Launch'
import EnterNodeConfig from '../../pages/lightningAccount/EnterNodeConfigScreen'
import ScanNodeConfig from '../../pages/lightningAccount/ScanNodeConfigScreen'
import Login from '../../pages/Login'
import AppInfo from '../../pages/MoreOptions/AppInfo/Appinfo'
import NodeSettingsContainerScreen from '../../pages/MoreOptions/NodeSettings/NodeSettingsContainerScreen'
import WalletBackup from '../../pages/MoreOptions/WalletBackup'
import BackupMethods from '../../pages/NewBHR/BackupMethods'
import BackupSeedWordsContent from '../../pages/NewBHR/BackupSeedWordsContent'
import BackupWithKeeper from '../../pages/NewBHR/BackupWithKeeper'
import CheckPasscodeComponent from '../../pages/NewBHR/CheckPasscodeComponent'
import CloudBackupHistory from '../../pages/NewBHR/CloudBackupHistory'
import FNFToKeeper from '../../pages/NewBHR/FNFToKeeper'
import ManageBackupNewBHR from '../../pages/NewBHR/ManageBackup'
import PersonalCopyHistoryNewBHR from '../../pages/NewBHR/PersonalCopyHistory'
import QrAndLink from '../../pages/NewBHR/QrAndLink'
import SecondaryDeviceHistoryNewBHR from '../../pages/NewBHR/SecondaryDeviceHistoryNewBHR'
import SecurityQuestionHistoryNewBHR from '../../pages/NewBHR/SecurityQuestionHistory'
import SeedBackupHistory from '../../pages/NewBHR/SeedBackupHistory'
import SetNewPassword from '../../pages/NewBHR/SetNewPassword'
import TrustedContactHistoryNewBHR from '../../pages/NewBHR/TrustedContactHistoryKeeper'
import TrustedContactNewBHR from '../../pages/NewBHR/TrustedContacts'
import NewOwnQuestions from '../../pages/NewOwnQuestions'
import PasscodeChangeSuccessPage from '../../pages/PasscodeChangeSuccessPage'
import RampOrderFormScreen from '../../pages/RampIntegration/RampOrderFormScreen'
import NewWalletGenerationOTP from '../../pages/RegenerateShare/NewWalletGenerationOTP'
import NewWalletNameRegenerateShare from '../../pages/RegenerateShare/NewWalletNameRegenerateShare'
import NewWalletQuestionRegenerateShare from '../../pages/RegenerateShare/NewWalletQuestionRegenerateShare'
import SweepFundsFromExistingAccount from '../../pages/RegenerateShare/SweepFundsFromExistingAccount'
import WalletCreationSuccess from '../../pages/RegenerateShare/WalletCreationSuccess'
import ReLogin from '../../pages/ReLogin'
import RestoreSeedWordsContent from '../../pages/RestoreHexaWithKeeper/RestoreSeedWordsContent'
import RestoreWithICloud from '../../pages/RestoreHexaWithKeeper/RestoreWithICloud'
import RestoreWithoutICloud from '../../pages/RestoreHexaWithKeeper/RestoreWithoutICloud'
import ScanRecoveryKey from '../../pages/RestoreHexaWithKeeper/ScanRecoveryKey'
import AssetMetaData from '../../pages/rgb/AssetMetaData'
import AssetTransferDetails from '../../pages/rgb/AssetTransferDetails'
import CollectibleDetailScreen from '../../pages/rgb/CollectibleDetailScreen'
import IssueScreen from '../../pages/rgb/IssueScreen'
import NewRGBWallet from '../../pages/rgb/NewRGBWallet'
import RGB121TxDetail from '../../pages/rgb/RGB121TxDetail'
import RGBReceive from '../../pages/rgb/RGBReceive'
import RGBSendManually from '../../pages/rgb/RGBSendManually'
import RGBSendWithQR from '../../pages/rgb/RGBSendWithQR'
import RGBTxDetail from '../../pages/rgb/RGBTxDetail'
import RGBWalletDetail from '../../pages/rgb/RGBWalletDetail'
import SendAsset from '../../pages/rgb/SendAsset'
import UnspentList from '../../pages/rgb/UnspentList'
import SettingGetNewPin from '../../pages/SettingGetNewPin'
import SettingsContents from '../../pages/SettingsContents'
import SweepConfirmation from '../../pages/SweepFunds/SweepConfirmation'
import SweepFunds from '../../pages/SweepFunds/SweepFunds'
import SweepFundsEnterAmount from '../../pages/SweepFunds/SweepFundsEnterAmount'
import SweepFundUseExitKey from '../../pages/SweepFunds/SweepFundUseExitKey'
import UpdateApp from '../../pages/UpdateApp'
import ConfirmKeys from '../../pages/UpgradeBackupWithKeeper/ConfirmKeys'
import UpgradeBackup from '../../pages/UpgradeBackupWithKeeper/UpgradeBackup'
import VersionHistoryScreen from '../../pages/VersionHistoryScreen'
import WyreIntegrationScreen from '../../pages/WyreIntegration/WyreIntegrationScreen'
import WyreOrderFormScreen from '../../pages/WyreIntegration/WyreOrderFormScreen'
import HomeScreen from '../screens/HomeScreen'
import AddNewAccountStack from '../stacks/accounts/AddNewAccountStack'
import AccountManagementStack from '../stacks/more-options/AccountManagementStack'
import WalletSettingsStack from '../stacks/more-options/WalletSettingsStack'

import AddNewDonationAccountDetailsScreen from '../../pages/Accounts/AddNew/DonationAccount/AddNewDonationAccountDetailsScreen'
import NewHexaAccountDetailsScreen from '../../pages/Accounts/AddNew/HexaAccount/NewHexaAccountDetailsScreen'
import NewAccountSelectionContainerScreen from '../../pages/Accounts/AddNew/NewAccountSelectionContainerScreen'
import NewSwanAccountDetailsScreen from '../../pages/Accounts/AddNew/SwanAccount/NewSwanAccountDetailsScreen'
import ChangeCurrencyScreen from '../../pages/ChangeCurrencyScreen'
import CreateKeeperScreen from '../../pages/CreateKeeperScreen'
import LNAccountDetails from '../../pages/lightningAccount/AccountDetails'
import OnChainSendScreen from '../../pages/lightningAccount/OnChainSendScreen'
import PayInvoiceScreen from '../../pages/lightningAccount/PayInvoiceScreen'
import PaymentsScreen from '../../pages/lightningAccount/PaymentsScreen'
import ChannelInfoScreen from '../../pages/lightningAccount/screens/ChannelInfoScreen'
import ChannelOpenScreen from '../../pages/lightningAccount/screens/ChannelOpenScreen'
import ChannelsListScreen from '../../pages/lightningAccount/screens/ChannelsListScreen'
import InvoiceDetailsScreen from '../../pages/lightningAccount/screens/InvoiceDetailsScreen'
import NodeInfoScreen from '../../pages/lightningAccount/screens/NodeInfoScreen'
import PaymentDetailsScreen from '../../pages/lightningAccount/screens/PaymentDetailsScreen'
import ReceiveCoinScreen from '../../pages/lightningAccount/screens/ReceiveCoinScreen'
import ScanOpenChannel from '../../pages/lightningAccount/screens/ScanOpenChannel'
import SettingsScreen from '../../pages/lightningAccount/screens/SettingsScreen'
import TransactionDetailsScreen from '../../pages/lightningAccount/screens/TransactionDetailsScreen'
import SendScreen from '../../pages/lightningAccount/SendScreen'
import ViewAllScreen from '../../pages/lightningAccount/ViewAllScreen'
import ManagePasscodeScreen from '../../pages/ManagePasscodeScreen'
import AccountManagementContainerScreen from '../../pages/MoreOptions/AccountManagement/AccountManagementContainerScreen'
import PanAccountSettingsContainerScreen from '../../pages/MoreOptions/AccountManagement/PanAccountSettings/PanAccountSettingsContainerScreen'
import SecurityQuestionScreen from '../../pages/MoreOptions/AccountManagement/PanAccountSettings/SecurityQuestionScreen'
import EnterPasscodeScreen from '../../pages/MoreOptions/AppInfo/EnterPasscodeScreen'
import MoreOptionsContainerScreen from '../../pages/MoreOptions/MoreOptionsContainerScreen'
import WalletSettingsContainerScreen from '../../pages/MoreOptions/WalletSettings/WalletSettingsContainerScreen'
import NewWalletName from '../../pages/NewWalletName'
import NewWalletQuestion from '../../pages/NewWalletQuestion'
import NewRecoveryOwnQuestions from '../../pages/Recovery/NewRecoveryOwnQuestions'
import RestoreSelectedContactsList from '../../pages/Recovery/RestoreSelectedContactsList'
import AllTransactionsContainerScreen from '../../pages/Transactions/AllTransactionsContainerScreen'
import defaultStackScreenNavigationOptions from '../options/DefaultStackScreenNavigationOptions'
import RGBTransactionsList from '../../pages/rgb/RGBTransactionsList'




const strings  = translations[ 'stackTitle' ]


function AppStack() {
  const Stack = createNativeStackNavigator()
  return (
    <Stack.Navigator initialRouteName='Home' screenOptions={{
      headerShown: false,
      ...defaultStackScreenNavigationOptions,
    }} >
      <Stack.Screen name="Home" component={HomeScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="Launch" component={Launch} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="LNAccountDetails" component={LNAccountDetails} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerShown: true,
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }} />
      <Stack.Screen name="ReLogin" component={ReLogin} options={{
        gestureEnabled: false,
        headerShown: false
      }} />
      <Stack.Screen name="AddNewAccount" component={AddNewAccountStack} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ScanNodeConfig" component={ScanNodeConfig} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ImportBorderWallet" component={ImportBorderWallet} options={{
        headerShown: false
      }} />
      <Stack.Screen name="CreateWithBorderWalletAccount" component={CreateWithBorderWallet} options={{
        headerShown: false
      }} />
      <Stack.Screen name="SelectEntropyGridTypeAccount" component={SelectEntropyGridType} options={{
        headerShown: false
      }} />
      <Stack.Screen name="SelectEntropyGridType" component={SelectEntropyGridType} options={{
        headerShown: false
      }} />
      <Stack.Screen name="DownloadEncryptGrid" component={DownloadEncryptGrid} options={{
        headerShown: false
      }} />
      <Stack.Screen name="BorderWalletGridScreen" component={BorderWalletGridScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="SelectChecksumWordAccount" component={SelectChecksumWord} options={{
        headerShown: false
      }} />
      <Stack.Screen name="SelectChecksumWord" component={SelectChecksumWord} />
      <Stack.Screen name="CreatePassPhraseAccount" component={CreatePassPhrase} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ImportWalletPassphrase" component={ImportWalletPassphrase} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ConfirmDownloadAccount" component={ConfirmDownload} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ConfirmDownload" component={ConfirmDownload} options={{
        headerShown: false
      }} />
      <Stack.Screen name="PreviewPattern" component={PreviewPattern} options={{
        headerShown: false
      }} />
      <Stack.Screen name="RecoverBorderWallet" component={RecoverBorderWallet} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ImportBWGrid" component={ImportBWGrid} options={{
        headerShown: false
      }} />
      <Stack.Screen name="EnterNodeConfig" component={EnterNodeConfig} options={{
        headerShown: false
      }} />
      <Stack.Screen name="MoreOptionsContainerScreen" component={MoreOptionsContainerScreen} options={{
        headerShown: false,
      }} />

      <Stack.Screen name="PlaceWyreOrder" component={WyreOrderFormScreen} options={{
        title: 'Buy with Wyre'
      }} />
      <Stack.Screen name="PlaceRampOrder" component={RampOrderFormScreen} options={{
        title: 'Buy with Ramp' 
      }} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsContainerScreen} options={{
        headerShown:false,
        title: 'Transaction Details'
      }} />
      <Stack.Screen name="Receive" component={Receive} options={{
        headerShown: false
      }} />
      <Stack.Screen name="WalletBackupAlert" component={WalletBackup} options={{
        headerShown: false
      }} />
      <Stack.Screen name="WalletBackup" component={WalletBackup} options={{
        headerShown: false
      }} />
      <Stack.Screen name="BackupSeedWordsContent" component={BackupSeedWordsContent} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="SeedBackupHistory" component={SeedBackupHistory} options={{
        headerShown: false
      }} />
      <Stack.Screen name="TwoFASetup" component={TwoFASetup} options={{
        gestureEnabled: false,
      }} />
      <Stack.Screen name="UpdateApp" component={UpdateApp} options={{
        gestureEnabled: false,
      }} />
      <Stack.Screen name="WyreIntegrationScreen" component={WyreIntegrationScreen} options={{
        title: 'Wyre Home'
      }} />
      <Stack.Screen name="Intermediate" component={Intermediate} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="CustodianRequestOTP" component={CustodianRequestOTP} />
      <Stack.Screen name="CustodianRequestAccepted" component={CustodianRequestAccepted} />
      <Stack.Screen name="SweepFundsFromExistingAccount" component={SweepFundsFromExistingAccount} />
      <Stack.Screen name="NewWalletNameRegenerateShare" component={NewWalletNameRegenerateShare} />
      <Stack.Screen name="NewWalletName" component={NewWalletName} />
      <Stack.Screen name="NewWalletQuestionRegenerateShare" component={NewWalletQuestionRegenerateShare} />
      <Stack.Screen name="NewWalletGenerationOTP" component={NewWalletGenerationOTP} />
      <Stack.Screen name="WalletCreationSuccess" component={WalletCreationSuccess} />
      <Stack.Screen name="SecureScan" component={SecureScan} />
      <Stack.Screen name="GoogleAuthenticatorOTP" component={GoogleAuthenticatorOTP} />
      <Stack.Screen name="SecondaryDeviceHistoryNewBHR" component={SecondaryDeviceHistoryNewBHR} />
      <Stack.Screen name="SettingGetNewPin" component={SettingGetNewPin} />
      <Stack.Screen name="ContactsListForAssociateContact" component={ContactsListForAssociateContact} options={{
        headerShown: false
      }} />
      <Stack.Screen name="NewTwoFASecret" component={NewTwoFASecret} />
      <Stack.Screen name="TwoFASweepFunds" component={TwoFASweepFunds} />
      <Stack.Screen name="SendRequest" component={SendRequest} />
      <Stack.Screen name="VoucherScanner" component={VoucherScanner} />
      <Stack.Screen name="AddContactSendRequest" component={AddContactSendRequest} />
      <Stack.Screen name="PairNewWallet" component={PairNewWallet} />
      <Stack.Screen name="ManageBackupNewBHR" component={ManageBackupNewBHR} />
      <Stack.Screen name="SecurityQuestionHistoryNewBHR" component={SecurityQuestionHistoryNewBHR} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerShown: true,
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.goBack() }} />
          },
        }
      }} />
      <Stack.Screen name="TrustedContactHistoryNewBHR" component={TrustedContactHistoryNewBHR} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerShown: true,
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.goBack() }} />
          },
        }
      }} />
      <Stack.Screen name="PersonalCopyHistoryNewBHR" component={PersonalCopyHistoryNewBHR} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerShown: true,
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.goBack() }} />
          },
        }
      }} />
      <Stack.Screen name="NewOwnQuestions" component={NewOwnQuestions} />
      <Stack.Screen name="RestoreWithICloud" component={RestoreWithICloud} />
      <Stack.Screen name="RestoreWithoutICloud" component={RestoreWithoutICloud} />
      <Stack.Screen name="SettingsContents" component={SettingsContents} />
      <Stack.Screen name="SweepFunds" component={SweepFunds} />
      <Stack.Screen name="SweepFundsEnterAmount" component={SweepFundsEnterAmount} />
      <Stack.Screen name="SweepFundUseExitKey" component={SweepFundUseExitKey} />
      <Stack.Screen name="SweepConfirmation" component={SweepConfirmation} />
      <Stack.Screen name="ScanRecoveryKey" component={ScanRecoveryKey} />
      <Stack.Screen name="UpgradeBackup" component={UpgradeBackup} />
      <Stack.Screen name="ConfirmKeys" component={ConfirmKeys} />
      <Stack.Screen name="TwoFAValidation" component={TwoFAValidation} />
      <Stack.Screen name="NewRGBWallet" component={NewRGBWallet} options={{
        headerShown: false
      }} />
      <Stack.Screen name="RGBWalletDetail" component={RGBWalletDetail} options={{
        headerShown: false
      }} />
      <Stack.Screen name="RGBReceive" component={RGBReceive} options={{
        headerShown: false
      }} />
      <Stack.Screen name="RGBSendWithQR" component={RGBSendWithQR} options={{
        headerShown: false
      }} />
      <Stack.Screen name="RGBSendManually" component={RGBSendManually} options={{
        headerShown: false
      }} />
      <Stack.Screen name="SendAsset" component={SendAsset} options={{
        headerShown: false
      }} />
      <Stack.Screen name="IssueScreen" component={IssueScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="RGB121TxDetail" component={RGB121TxDetail} options={{
        headerShown: false
      }} />
      <Stack.Screen name="RGBTxDetail" component={RGBTxDetail} options={{
        headerShown: false
      }} />
      <Stack.Screen name="AssetMetaData" component={AssetMetaData} options={{
        headerShown: false
      }} />
      <Stack.Screen name="UnspentList" component={UnspentList} options={{
        headerShown: false
      }} />
      <Stack.Screen name="AssetTransferDetails" component={AssetTransferDetails} options={{
        headerShown: false
      }} />
      <Stack.Screen name="AssetsDetailScreen" component={AssetsDetailScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="CollectibleDetailScreen" component={CollectibleDetailScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="FriendsAndFamilyScreen" component={FriendsAndFamilyScreen} />
      <Stack.Screen name="ManageGifts" component={ManageGifts} />
      <Stack.Screen name="GiftDetails" component={GiftDetails} />
      <Stack.Screen name="QRRoot" component={HomeQRScannerScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ReceiveQR" component={ReceiveQrScreen} options={( { navigation } ) => {
        return {
          animation:'none',
          headerShown:true,
          title: 'Receive',
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.goBack() }} />
          },
        }
      }} />
      <Stack.Screen name="AddContact" component={AddContactAddressBook} />
      <Stack.Screen name="RequestKeyFromContact" component={RequestKeyFromContact} />
      <Stack.Screen name="EnterGiftDetails" component={EnterGiftDetails} />
      <Stack.Screen name="SendViaLinkAndQR" component={SendViaLinkAndQR} />
      <Stack.Screen name="CreateGift" component={CreateGift} />
      <Stack.Screen name="SendGift" component={SendGift}/>
      <Stack.Screen name="ContactDetails" component={ContactDetails} />
      <Stack.Screen name="QrAndLink" component={QrAndLink} />
      <Stack.Screen name="SetUpSatCard" component={SetUpSatCardScreen} />
      <Stack.Screen name="SetUpSatNextCard" component={SetUpSatNextCardScreen} />
      <Stack.Screen name="GiftCreated" component={GiftCreatedScreen} />
      <Stack.Screen name="ClaimSats" component={ClaimSatsScreen} />
      <Stack.Screen name="GiftQRScannerScreen" component={GiftQRScannerScreen}/>
      <Stack.Screen name="Login" component={Login} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="AccountManagement" component={AccountManagementStack} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="PasscodeChangeSuccessPage" component={PasscodeChangeSuccessPage} options={{
        headerShown: false,
        gestureEnabled:false,
      }}/>
      <Stack.Screen name="FriendsAndFamily" component={FriendsAndFamilyScreen} options={{
        title: 'Friends & Family',
      }}/>
      <Stack.Screen name="BackupWithKeeper" component={BackupWithKeeper} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="BackupGridMnemonic" component={BackupGridMnemonic} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="ValidateBorderWalletChecksum" component={ValidateBorderWalletChecksum} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="ValidateBorderWalletPattern" component={ValidateBorderWalletPattern} options={{
        headerShown: false,
      }} />

      <Stack.Screen name="CheckPasscode" component={CheckPasscodeComponent} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="BackupMethods" component={BackupMethods} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="AppInfo" component={AppInfo} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="WalletSettings" component={WalletSettingsStack} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="NodeSettings" component={NodeSettingsContainerScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="CreateKeeperScreen" component={CreateKeeperScreen} />
      <Stack.Screen name="FundingSources" component={FundingSourcesScreen} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="FundingSourceDetails" component={FundingSourceDetailsScreen} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="VersionHistory" component={VersionHistoryScreen} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="SeedBackup" component={SeedBackupHistory} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="FNFToKeeper" component={FNFToKeeper} />
      <Stack.Screen name="RestoreSeedWordsContent" component={RestoreSeedWordsContent} />
      <Stack.Screen name="TrustedContactNewBHR" component={TrustedContactNewBHR} />
      <Stack.Screen name="SetNewPassword" component={SetNewPassword} />
      <Stack.Screen name="CloudBackupHistory" component={CloudBackupHistory} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsContainerScreen}
        options={( { navigation } ) => {
          return {
            ...defaultStackScreenNavigationOptions,
            headerShown: true,
            headerLeft: () => {
              return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
            },
          }
        }}/>
      <Stack.Screen name="AccountDetailsRoot" component={AccountDetailsContainerScreen}   options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerShown: true,
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }}/>
      <Stack.Screen name="TransactionsList" component={TransactionsListContainerScreen} options={{
        headerShown: false
      }} />
       <Stack.Screen name="RGBTransactionsList" component={RGBTransactionsList} options={{
        headerShown: false
      }} />
      <Stack.Screen name="RestoreSelectedContactsList" component={RestoreSelectedContactsList} />
      <Stack.Screen name="DonationAccountWebViewSettings" component={DonationAccountWebViewSettingsScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="SubAccountSettings" component={AccountSettingsMainScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="AccountSettingsMain" component={AccountSettingsMainScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="SubAccountTFAHelp" component={SubAccountTFAHelpScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen
        name="EditDisplayProperties"
        component={AccountSettingsEditDisplayPropertiesScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ReassignTransactionsMainOptions"
        component={ReassignTransactionsMainOptionsScreen}
        options={{
          title: strings[ 'ReassignTransactions' ],
        }}
      />
      <Stack.Screen
        name="SelectReassignableTransactions"
        component={SelectReassignableTransactionsScreen}
        options={{
          title: strings[ 'ReassignTransactions' ],
        }}
      />
      <Stack.Screen
        name="ReassignSubAccountSourcesSelectSources"
        component={ReassignSubAccountSourcesSelectSourcesScreen}
        options={{
          title: strings[ 'ReassignSources' ],
        }}
      />
      <Stack.Screen name="NewRecoveryOwnQuestions" component={NewRecoveryOwnQuestions} />
      <Stack.Screen
        name="MergeAccounts"
        component={AccountSettingsMergeAccountShellsScreen}
        options={{
          title: strings[ 'MergeAccounts' ],
        }}
      />


      <Stack.Screen
        name="ReassignTransactionsSelectDestination"
        component={ReassignTransactionsSelectDestinationScreen}
      />
      <Stack.Screen
        name="EditVisibility"
        component={AccountSettingsEditVisibilityScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ShowXPub"
        component={XPubDetailsScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen name="SendRoot" component={AccountSendContainerScreen}
        options={( { navigation } ) => {
          return {
            title: 'Send',
            headerShown:true,
            headerLeft: () => {
              return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
            },
          }
        }}/>
      <Stack.Screen name="Send" component={AccountSendContainerScreen}
        options={( { navigation } ) => {
          return {
            title: 'Send',
            headerShown:true,
            headerLeft: () => {
              return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
            },
          }
        }}/>
      <Stack.Screen name="AccountSend" component={AccountSendContainerScreen}  />
      <Stack.Screen name="SentAmountForContactForm" component={SentAmountForContactFormScreen} options={( { navigation } ) => {
          return {
            title: 'Send To',
            headerShown:true,
            headerLeft: () => {
              return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
            },
          }
        }} />
      <Stack.Screen name="SendConfirmation" component={AccountSendConfirmationContainerScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="OTPAuthentication" component={OTPAuthenticationScreen} options={{
        headerShown:false
      }} />
      <Stack.Screen name="AllTransactionsRoot" component={AllTransactionsContainerScreen}
        options={( { navigation } ) => {
          return {
            title: 'Transactions',
            headerShown:true,
            headerLeft: () => {
              return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
            },
          }
        }}/>
      <Stack.Screen name="ViewAll" component={ViewAllScreen} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerShown:true,
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }}/>
      <Stack.Screen name="ReceiveCoin" component={ReceiveCoinScreen} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerShown:true,
          title: '',
          headerShadowVisible: false,
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }}/>
      <Stack.Screen name="ScanOpenChannel" component={ScanOpenChannel} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="NodeInfoScreen" component={NodeInfoScreen}
        options={( { navigation } ) => {
          return {
            ...defaultStackScreenNavigationOptions,
            headerShown:true,
            title: '',
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: Colors.offWhite
            },
            headerLeft: () => {
              return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
            },
          }
        }}
      />
      <Stack.Screen name="Payments" component={PaymentsScreen}
        options={( { navigation } ) => {
          return {
            ...defaultStackScreenNavigationOptions,
            title: '',
            headerShadowVisible: false,
            headerShown:true,
            headerLeft: () => {
              return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
            },
          }
        }} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsMainScreen} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="OnChainSend" component={OnChainSendScreen}
        options={( { navigation } ) => {
          return {
            ...defaultStackScreenNavigationOptions,
            title: 'Send To',
            headerShadowVisible: false,
            headerShown:true,
            headerLeft: () => {
              return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
            },
          }
        }}/>
      <Stack.Screen name="PaymentDetailsScreen" component={PaymentDetailsScreen}  options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          title: '',
          headerShadowVisible: false,
          headerShown:true,
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }}/>
      <Stack.Screen name="PayInvoice" component={PayInvoiceScreen} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          title: '',
          headerShadowVisible: false,
          headerShown:true,
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }}/>
      <Stack.Screen name="SendScreen" component={SendScreen} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          title: '',
          headerShadowVisible: false,
          headerShown:true,
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }}/>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          title: '',
          headerShadowVisible: false,
          headerShown:true,
          headerStyle: {
            backgroundColor: Colors.offWhite
          },
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }}/>
      <Stack.Screen name="ChannelsListScreen" component={ChannelsListScreen} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          title: '',
          headerShadowVisible: false,
          headerShown:true,
          headerStyle: {
            backgroundColor: Colors.offWhite
          },
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }}/>
      <Stack.Screen name="ChannelInfoScreen" component={ChannelInfoScreen} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          title: '',
          headerShadowVisible: false,
          headerShown:true,
          headerStyle: {
            backgroundColor: Colors.offWhite
          },
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }}/>
      <Stack.Screen name="InvoiceDetailsScreen" component={InvoiceDetailsScreen} options={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          title: '',
          headerShadowVisible: false,
          headerShown:true,
          headerStyle: {
            backgroundColor: Colors.offWhite
          },
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }}/>
      <Stack.Screen name="TransactionDetailsScreen" component={TransactionDetailsScreen}/>
      
      <Stack.Screen name="ChannelOpenScreen" component={ChannelOpenScreen} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="AccountSelectionList" component={NewAccountSelectionContainerScreen} options={{
        header: null
      }} />
      <Stack.Screen name="NewHexaAccountDetails" component={NewHexaAccountDetailsScreen} options={{
        title: 'Setup New Account'
      }} />
      <Stack.Screen name="NewWyreAccountDetails" component={NewWyreAccountDetailsScreen} options={{
        title: 'Setup Wyre Account'
      }} />
      <Stack.Screen name="NewRampAccountDetails" component={NewRampAccountDetailsScreen} options={{
        title: 'Setup Ramp Account'
      }} />
      <Stack.Screen name="NewSwanAccountDetails" component={NewSwanAccountDetailsScreen} options={{
        title: 'Setup Swan Account'
      }} />
      <Stack.Screen name="AddNewDonationAccountDetails" component={AddNewDonationAccountDetailsScreen} options={{
        header: null
      }} />
      <Stack.Screen name="WalletSettingsRoot" component={WalletSettingsContainerScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="NewWalletQuestion" component={NewWalletQuestion} />
      <Stack.Screen name="ManagePasscode" component={ManagePasscodeScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ChangeCurrency" component={ChangeCurrencyScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="PanAccountSettingsRoot" component={PanAccountSettingsContainerScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="AccountManagementRoot" component={AccountManagementContainerScreen} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="PanAccountSettings" component={PanAccountSettingsContainerScreen} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="EnterPasscode" component={EnterPasscodeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="SecurityQuestion" component={SecurityQuestionScreen} options={( { navigation } ) => {
        return {
          headerShown:true,
          title: strings[ 'ShowAllAccounts' ],
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.goBack() }} />
          },
        }
      }} />

    </Stack.Navigator>
  )
}

export default AppStack

