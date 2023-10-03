import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { useLayoutEffect } from 'react'
import Colors from '../../../common/Colors'
import AssetsDetailScreen from '../../../pages/Assets/AssetsDetailScreen'
import AssetsScreen from '../../../pages/Assets/AssetsScreen'
import AssetMetaData from '../../../pages/rgb/AssetMetaData'
import AssetTransferDetails from '../../../pages/rgb/AssetTransferDetails'
import CollectibleDetailScreen from '../../../pages/rgb/CollectibleDetailScreen'
import IssueScreen from '../../../pages/rgb/IssueScreen'
import NewRGBWallet from '../../../pages/rgb/NewRGBWallet'
import RGB121TxDetail from '../../../pages/rgb/RGB121TxDetail'
import RGBReceive from '../../../pages/rgb/RGBReceive'
import RGBSendManually from '../../../pages/rgb/RGBSendManually'
import RGBSendWithQR from '../../../pages/rgb/RGBSendWithQR'
import RGBTxDetail from '../../../pages/rgb/RGBTxDetail'
import RGBWalletDetail from '../../../pages/rgb/RGBWalletDetail'
import SendAsset from '../../../pages/rgb/SendAsset'
import UnspentList from '../../../pages/rgb/UnspentList'
import QRStack from '../home/QRStack'

// const strings  = translations[ 'stackTitle' ]
const Stack = createNativeStackNavigator()

const AssetsStack = ( { navigation, route } ) => {
  useLayoutEffect( () => {
    const routeName = getFocusedRouteNameFromRoute( route ) ?? 'AssetsScreen'
    if ( routeName === 'AssetsScreen' ){
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
      initialRouteName='AssetsScreen'
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="AssetsScreen" component={AssetsScreen} />
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
      <Stack.Screen name="QRScanner" component={QRStack} options={{
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
    </Stack.Navigator>
  )
}

export default AssetsStack
