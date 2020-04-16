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
import NetInfo from '@react-native-community/netinfo';
import firebase from "react-native-firebase";

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
        onPressTryAgain={() => { (NoInternetBottomSheet as any).current.snapTo(0)}}
        onPressIgnore={() => { (NoInternetBottomSheet as any).current.snapTo(0)}}
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
