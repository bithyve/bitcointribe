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
    componentDidMount();
    
  },[]);

  const componentDidMount =()=> {
    createNotificationListeners();

    const channel = new firebase.notifications.Android.Channel(
      "foregroundNotification", // channelId
      "ForegroundNotification", // channel name
      firebase.notifications.Android.Importance.High // channel importance
    ).setDescription("Used for getting foreground notification"); // channel description
    firebase.notifications().android.createChannel(channel);
  }

  const createNotificationListeners = async () => {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    let notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const { title, body } = notification;
        const deviceTrayNotification = new firebase.notifications.Notification()
          .setTitle(title)
          .setBody(body)
          .setNotificationId("1")
          .setSound("default")
          .android.setPriority(firebase.notifications.Android.Priority.High)
          .android.setChannelId("foregroundNotification") // previously created
          .android.setAutoCancel(true); // To remove notification when tapped on it

        firebase.notifications().displayNotification(deviceTrayNotification);
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    let notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        const { title, body } = notificationOpen.notification;
      });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
    }
    /*
     * Triggered for data only payload in foreground
     * */
    let messageListener = firebase.messaging().onMessage(message => {
      //process data message
    });
  };
  
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
