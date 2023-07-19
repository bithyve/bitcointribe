import React from 'react'
import { createStackNavigator, StackViewTransitionConfigs } from 'react-navigation-stack'
import AssetsDetailScreen from '../../../pages/Assets/AssetsDetailScreen'
import AssetsScreen from '../../../pages/Assets/AssetsScreen'
import AssetMetaData from '../../../pages/rgb/AssetMetaData'
import AssetTransferDetails from '../../../pages/rgb/AssetTransferDetails'
import CollectibleDetailScreen from '../../../pages/rgb/CollectibleDetailScreen'
import IssueScreen from '../../../pages/rgb/IssueScreen'
import NewRGBWallet from '../../../pages/rgb/NewRGBWallet'
import RGB121TxDetail from '../../../pages/rgb/RGB121TxDetail'
import RGBReceive from '../../../pages/rgb/RGBReceive'
import RGBSend from '../../../pages/rgb/RGBSend'
import RGBTxDetail from '../../../pages/rgb/RGBTxDetail'
import RGBWalletDetail from '../../../pages/rgb/RGBWalletDetail'

// const strings  = translations[ 'stackTitle' ]

const AssetsStack = createStackNavigator(
  {
    Home: {
      screen: AssetsScreen,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    NewRGBWallet: {
      screen: NewRGBWallet,
      navigationOptions: {
        header: null
      }
    },
    RGBWalletDetail: {
      screen: RGBWalletDetail,
      navigationOptions: {
        header: null
      }
    },
    RGBReceive: {
      screen: RGBReceive,
      navigationOptions: {
        header: null
      }
    },
    RGBSend: {
      screen: RGBSend,
      navigationOptions: {
        header: null
      }
    },
    IssueScreen: {
      screen: IssueScreen,
      navigationOptions: {
        header: null
      }
    },
    RGB121TxDetail: {
      screen: RGB121TxDetail,
      navigationOptions: {
        header: null
      }
    },
    RGBTxDetail: {
      screen: RGBTxDetail,
      navigationOptions: {
        header: null
      }
    },
    AssetMetaData: {
      screen: AssetMetaData,
      navigationOptions: {
        header: null
      }
    },
    AssetTransferDetails: {
      screen: AssetTransferDetails,
      navigationOptions: {
        header: null
      }
    },
    AssetsDetailScreen: {
      screen: AssetsDetailScreen,
      navigationOptions: {
        header: null
      }
    },
    CollectibleDetailScreen: {
      screen: CollectibleDetailScreen,
      navigationOptions: {
        header: null
      }
    },
    // ManageGifts,
  },
  {
    // mode: 'modal',
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      header: null
    },
    navigationOptions: ( { navigation } ) => {
      let tabBarVisible = false
      if ( ( navigation.state.index === 0  && navigation.state.routes[ 0 ].routeName === 'Home' || navigation.state.index === 1 && navigation.state.routes[ 1 ]?.routeName === 'Home' ) ) {
        tabBarVisible = true
      }

      return {
        tabBarVisible,
      }
    },
  },
)

export default AssetsStack
