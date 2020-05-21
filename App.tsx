console.disableYellowBox = true;
import React, { Component, useState, useEffect } from "react";
import Navigator from "./src/navigation/Navigator";
import { store, Provider } from "./src/store";
import NoInternetModalContents from './src/components/NoInternetModalContents';
import TransparentHeaderModal from './src/components/TransparentHeaderModal';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import NetInfo from '@react-native-community/netinfo';
import { getVersion, getBuildId } from 'react-native-device-info'
import { setApiHeaders } from "./src/services/api";

const prefix = 'hexa://'

class App extends Component {
  private NoInternetBottomSheet: React.RefObject<any>;

  constructor(props) {
    super(props);
    this.NoInternetBottomSheet = React.createRef();
    this.unsubscribe = null
  }


  componentWillMount = () => {
    this.getAppVersion()
  };

  getAppVersion = async () => {
    let version = await getVersion()
    let buildNumber = await getBuildId()
    setApiHeaders({ appVersion: version, appBuildNumber: buildNumber })
  }


  unsubscribe = NetInfo.addEventListener(state => {
    if (state.isInternetReachable) {
      (this.NoInternetBottomSheet as any).current.snapTo(0);
    } else {
      (this.NoInternetBottomSheet as any).current.snapTo(1);
    }
  });

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }


  render() {
    return (
      <Provider store={store} uriPrefix={prefix}>
        <Navigator />
        <BottomSheet
          onCloseEnd={() => { }}
          enabledInnerScrolling={true}
          ref={this.NoInternetBottomSheet}
          snapPoints={[-50, hp('60%')]}
          renderContent={() =>
            <NoInternetModalContents
              onPressTryAgain={() => { (this.NoInternetBottomSheet as any).current.snapTo(0) }}
              onPressIgnore={() => { (this.NoInternetBottomSheet as any).current.snapTo(0) }}
            />
          }
          renderHeader={() => <TransparentHeaderModal
            onPressheader={() => {
              (this.NoInternetBottomSheet as any).current.snapTo(0);
            }}
          />}
        />
      </Provider>
    )
  }
}

export default App

// export default () => {

//   const [NoInternetBottomSheet, setNoInternetBottomSheet] = useState(
//     React.createRef(),
//   );
//   const [Internet, setInternet] = useState(true);
//   const renderNoInternetModalContent = () => {
//     return (
//       <NoInternetModalContents
//         onPressTryAgain={() => { (NoInternetBottomSheet as any).current.snapTo(0) }}
//         onPressIgnore={() => { (NoInternetBottomSheet as any).current.snapTo(0) }}
//       />
//     );
//   };

//   const renderNoInternetModalHeader = () => {
//     return (
//       <TransparentHeaderModal
//         onPressheader={() => {
//           (NoInternetBottomSheet as any).current.snapTo(0);
//         }}
//       />
//     );
//   };

//   useEffect(() => {
//     if (!Internet) {
//       (NoInternetBottomSheet as any).current.snapTo(1);
//     }
//   }, [Internet])

//   useEffect(() => {
//     NetInfo.addEventListener(state => {
//       if (state.isInternetReachable == true)
//         setInternet(true);
//       else if (state.isInternetReachable == false) {
//         setInternet(false);
//       }
//     });
//   }, []);


//   useEffect(() => {
//     const getAppVersion = async () => {
//       let version = await getVersion()
//       let buildNumber = await getBuildId()
//       setApiHeaders({ appVersion: version, appBuildNumber: buildNumber })
//     }

//     getAppVersion()
//   })

//   return (

//   );
// };
