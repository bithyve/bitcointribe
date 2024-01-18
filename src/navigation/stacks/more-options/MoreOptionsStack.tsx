import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { useLayoutEffect } from 'react'
import Colors from '../../../common/Colors'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import BackupGridMnemonic from '../../../pages/borderwallet/BackupGridMnemonic'
import PreviewPattern from '../../../pages/borderwallet/PreviewPattern'
import ValidateBorderWalletChecksum from '../../../pages/borderwallet/ValidateBorderWalletChecksum'
import ValidateBorderWalletPattern from '../../../pages/borderwallet/ValidateBorderWalletPattern'
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import FundingSourceDetailsScreen from '../../../pages/FundingSources/FundingSourceDetailsScreen'
import FundingSourcesScreen from '../../../pages/FundingSources/FundingSourcesContainerScreen'
import Intermediate from '../../../pages/Intermediate'
import Launch from '../../../pages/Launch'
import Login from '../../../pages/Login'
import AppInfo from '../../../pages/MoreOptions/AppInfo/Appinfo'
import MoreOptionsContainerScreen from '../../../pages/MoreOptions/MoreOptionsContainerScreen'
import NodeSettingsContainerScreen from '../../../pages/MoreOptions/NodeSettings/NodeSettingsContainerScreen'
import BackupMethods from '../../../pages/NewBHR/BackupMethods'
import BackupWithKeeper from '../../../pages/NewBHR/BackupWithKeeper'
import CheckPasscodeComponent from '../../../pages/NewBHR/CheckPasscodeComponent'
import SeedBackupHistory from '../../../pages/NewBHR/SeedBackupHistory'
import PasscodeChangeSuccessPage from '../../../pages/PasscodeChangeSuccessPage'
import ReLogin from '../../../pages/ReLogin'
import VersionHistoryScreen from '../../../pages/VersionHistoryScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import QRStack from '../home/QRStack'
import AccountManagementStack from './AccountManagementStack'
import WalletBackupStack from './WalletBackupStack'
import WalletSettingsStack from './WalletSettingsStack'

const Stack = createNativeStackNavigator()
const MoreOptionsStack = ( { navigation, route } ) => {
  useLayoutEffect( () => {
    const routeName = getFocusedRouteNameFromRoute( route ) ?? 'MoreOptionsContainerScreen'
    if ( routeName === 'MoreOptionsContainerScreen' ){
      navigation.setOptions( {
        tabBarStyle: {
          display: 'flex', backgroundColor: Colors.darkBlue
        }
      } )
    }else {
      navigation.setOptions( {
        tabBarStyle: {
          display: 'none'
        }
      } )
    }
  }, [ navigation, route ] )
  return (
    <Stack.Navigator
      initialRouteName='MoreOptionsContainerScreen'
      screenOptions={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
          },
        }
      }}
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
      <Stack.Screen name="SeedBackupHistory" component={SeedBackupHistory} options={{
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
        headerShown: false,
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

export default MoreOptionsStack
