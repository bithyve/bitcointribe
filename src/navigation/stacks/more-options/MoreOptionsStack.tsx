import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import MoreOptionsContainerScreen from '../../../pages/MoreOptions/MoreOptionsContainerScreen'
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import FundingSourcesScreen from '../../../pages/FundingSources/FundingSourcesContainerScreen'
import FundingSourceDetailsScreen from '../../../pages/FundingSources/FundingSourceDetailsScreen'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import WalletSettingsStack from './WalletSettingsStack'
import AccountManagementStack from './AccountManagementStack'
import NodeSettingsContainerScreen from '../../../pages/MoreOptions/NodeSettings/NodeSettingsContainerScreen'
import QRStack from '../home/QRStack'
import Colors from '../../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../../common/Fonts'
import Launch from '../../../pages/Launch'
import ReLogin from '../../../pages/ReLogin'
import Login from '../../../pages/Login'
import Intermediate from '../../../pages/Intermediate'
import PasscodeChangeSuccessPage from '../../../pages/PasscodeChangeSuccessPage'
import AppInfo from '../../../pages/MoreOptions/AppInfo/Appinfo'
import VersionHistoryScreen from '../../../pages/VersionHistoryScreen'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import WalletBackupStack from './WalletBackupStack'
import BackupWithKeeper from '../../../pages/NewBHR/BackupWithKeeper'
import BackupMethods from '../../../pages/NewBHR/BackupMethods'
import ValidateBorderWalletPattern from '../../../pages/borderwallet/ValidateBorderWalletPattern'
import ValidateBorderWalletChecksum from '../../../pages/borderwallet/ValidateBorderWalletChecksum'
import PreviewPattern from '../../../pages/borderwallet/PreviewPattern'
import BackupGridMnemonic from '../../../pages/borderwallet/BackupGridMnemonic'
import CheckPasscodeComponent from '../../../pages/NewBHR/CheckPasscodeComponent'

const Stack = createNativeStackNavigator()
const MoreOptionsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName='Home'
      //TODO: screen option
      // defaultNavigationOptions={( { navigation } )=>{
      //   return {
      //     ...defaultStackScreenNavigationOptions,
      //     headerLeft: () => {
      //       return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
      //     },
      //   }
      // }}
      // screenOptions={({navigation})=>{

      // }}

    >
      <Stack.Screen name="MoreOptionsContainerScreen" component={MoreOptionsContainerScreen} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="Launch" component={Launch} />
      <Stack.Screen name="Login" component={Login} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="Intermediate" component={Intermediate} />
      <Stack.Screen name="ReLogin" component={ReLogin} options={{
        headerShown: false,
        gestureEnabled:false,
      }} />
      <Stack.Screen name="AccountManagement" component={AccountManagementStack} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsContainerScreen} />
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
      <Stack.Screen name="PreviewPattern" component={PreviewPattern} options={{
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
        options={( { navigation } ) => {
          return {
            title: 'Node Settings',
            headerTitleStyle:{
              color: Colors.blue,
              fontSize: RFValue( 18 ),
              fontFamily: Fonts.Medium,
              textAlign: 'left',
              marginHorizontal: 0
            },
            headerLeft: () => {
              return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
            },
          }
        }}
      />
      <Stack.Screen name="FundingSources" component={FundingSourcesScreen} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="FundingSourceDetails" component={FundingSourceDetailsScreen} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="QRScanner" component={QRStack} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="VersionHistory" component={VersionHistoryScreen} options={{
        title: 'Version History',
      }} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsStack} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="SeedBackup" component={WalletBackupStack} options={{
        headerShown: false,
      }} />
    </Stack.Navigator>
  )
}

// TODO: add all the below screens to stack
// const MoreOptionsStack = createStackNavigator(
//   {
//     Home: {
//       screen: MoreOptionsContainerScreen,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     Launch,
//     Login:{
//       screen: Login,
//       navigationOptions: {
//         header: null
//       }
//     },
//     Intermediate,
//     ReLogin: {
//       screen: ReLogin,
//       navigationOptions: {
//         gesturesEnabled: false,
//         header: null,
//       },
//     },
//     AccountManagement: {
//       screen: AccountManagementStack,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     TransactionDetails: {
//       screen: TransactionDetailsContainerScreen,
//     },
//     PasscodeChangeSuccessPage: {
//       screen: PasscodeChangeSuccessPage,
//       navigationOptions: {
//         gesturesEnabled: false,
//         header: null,
//       },
//     },
//     FriendsAndFamily: {
//       screen: FriendsAndFamilyScreen,
//       navigationOptions: {
//         title: 'Friends & Family',
//       },
//     },
//     BackupWithKeeper: {
//       screen: BackupWithKeeper,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     BackupGridMnemonic: {
//       screen: BackupGridMnemonic,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     ValidateBorderWalletChecksum: {
//       screen: ValidateBorderWalletChecksum,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     ValidateBorderWalletPattern: {
//       screen: ValidateBorderWalletPattern,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     PreviewPattern: {
//       screen: PreviewPattern,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     CheckPasscode:{
//       screen: CheckPasscodeComponent,
//       navigationOptions:{
//         header:null
//       }
//     },
//     BackupMethods: {
//       screen: BackupMethods,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     NodeSettings: {
//       screen: NodeSettingsContainerScreen,
//       navigationOptions: ( { navigation } ) => {
//         return {
//           title: 'Node Settings',
//           headerTitleStyle:{
//             color: Colors.blue,
//             fontSize: RFValue( 18 ),
//             fontFamily: Fonts.Medium,
//             textAlign: 'left',
//             marginHorizontal: 0
//           },
//           headerLeft: () => {
//             return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
//           },
//         }
//       },
//     },
//     FundingSources: {
//       screen: FundingSourcesScreen,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     FundingSourceDetails: {
//       screen: FundingSourceDetailsScreen,
//     },
//     WalletSettings: {
//       screen: WalletSettingsStack,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     QRScanner: {
//       screen: QRStack,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     AppInfo: {
//       screen: AppInfo,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     VersionHistory: {
//       screen: VersionHistoryScreen,
//       navigationOptions: {
//         title: 'Version History',
//       },
//     },
//     AccountDetails: {
//       screen: AccountDetailsStack,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     SeedBackup: {
//       screen: WalletBackupStack,
//       navigationOptions: {
//         header: null,
//       },
//     },
//   },
//   {
//     initialRouteName: 'Home',
//     navigationOptions: ( { navigation } ) => {
//       let tabBarVisible = false
//       if ( ( navigation.state.index === 0  && navigation.state.routes[ 0 ].routeName === 'Home' || navigation.state.index === 1 && navigation.state.routes[ 1 ]?.routeName === 'Home' ) ) {
//         tabBarVisible = true
//       }

//       return {
//         tabBarVisible,
//       }
//     },
//     defaultNavigationOptions: ( { navigation } ) => {
//       return {
//         ...defaultStackScreenNavigationOptions,
//         headerLeft: () => {
//           return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
//         },
//       }
//     },
//   },
// )


export default MoreOptionsStack
