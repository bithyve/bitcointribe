import React, { useState, useEffect } from "react";
import Navigator from "./src/navigation/Navigator";
// import DummyNav from "./src/navigation/Dummy-Navigator";
import { store, Provider } from "./src/store";
import NoInternetModalContents from './src/components/NoInternetModalContents';
import TransparentHeaderModal from './src/components/TransparentHeaderModal';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
const prefix = 'hexa://'
export default () => {
  console.disableYellowBox = true;
  const [NoInternetBottomSheet, setNoInternetBottomSheet] = useState(
    React.createRef(),
  );
  const [Internet, setInternet] = useState(true);
  const renderNoInternetModalContent = () => {
    return (
      <NoInternetModalContents
        onPressTryAgain={() => { }}
        onPressIgnore={() => { }}
      />
    );
  };

  const renderNoInternetModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (NoInternetBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  useEffect(()=>{
    if(!Internet){
      (NoInternetBottomSheet as any).current.snapTo(1);
    }
  }, [Internet])

  useEffect(() => {
    NetInfo.addEventListener(state => {
      if (state.isInternetReachable==true)
        setInternet(true); 
      else if (state.isInternetReachable==false){
        setInternet(false); 
      }
    });
  },[]);

  
  return (
    <Provider store={store} uriPrefix={prefix}>
      <Navigator />
      <BottomSheet
        onCloseEnd={() => { }}
        enabledInnerScrolling={true}
        ref={NoInternetBottomSheet}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderNoInternetModalContent}
        renderHeader={renderNoInternetModalHeader}
      />
    </Provider>
  );
};
