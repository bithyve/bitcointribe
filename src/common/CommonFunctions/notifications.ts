import firebase from "react-native-firebase";
import { NOTIFICATION_HOUR } from 'react-native-dotenv';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateFCMTokens,
} from '../../store/actions/accounts';
import { AsyncStorage } from "react-native";

export const firebaseNotificationListener = async()=> {
  const enabled = await firebase.messaging().hasPermission();
    console.log('enabledqqq', enabled)
    if (!enabled) {
        await firebase
        .messaging()
        .requestPermission()
        .then(() => {
          // User has authorized
          scheduleNotification();
        })
        .catch(error => {
          // User has rejected permissions
          console.log(
            'PERMISSION REQUEST :: notification permission rejected', error
          );
        });
    } else {
      scheduleNotification();
    }
    createNotificationListeners();


  
    // const channel = new firebase.notifications.Android.Channel(
    //   "foregroundNotification", // channelId
    //   "ForegroundNotification", // channel name
    //   firebase.notifications.Android.Importance.High // channel importance
    // ).setDescription("Used for getting foreground notification"); // channel description
    // firebase.notifications().android.createChannel(channel);
  }
  
  const createNotificationListeners = async () => {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        onNotificationArrives(notification);
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = firebase
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
    this.messageListener = firebase.messaging().onMessage(message => {
      //process data message
    });
  };
  
  const scheduleNotification = async () => {
    const notification = new firebase.notifications.Notification()
      .setTitle('We have not seen you in a while!')
      .setBody('Opening your app regularly ensures you get all the notifications and security updates')
      .setNotificationId('1')
      .setSound('default')
      .setData({ title: 'We have not seen you in a while!', body: 'Opening your app regularly ensures you get all the notifications and security updates' })
      .android.setChannelId('reminder')
      .android.setPriority(firebase.notifications.Android.Priority.High);

    // Schedule the notification for 2hours on development and 2 weeks on Production in the future
    const date = new Date();
    date.setHours(date.getHours() + Number(NOTIFICATION_HOUR));
  
    console.log("DATE", date, NOTIFICATION_HOUR, date.getTime());
    await firebase
      .notifications()
      .scheduleNotification(notification, {
        fireDate: date.getTime(),
        repeatInterval: 'hour'
      })
      .then(() => {})
      .catch((err) => console.log('err', err));
    firebase
      .notifications()
      .getScheduledNotifications()
      .then((notifications) => {
        console.log('logging notifications', notifications);
      });
  };

  const onNotificationArrives = async(notification) =>{
    // let objTemp = {
    //   android: notification.android,
    //   body: notification.body,
    //   title: notification.title,
    //   sound: notification.sound,
    //   notificationId: notification.notificationId,
    //   ios: notification.ios,
    //   data: notification.data,
    //   subtitle: notification.subtitle
    // }
    // let notificationList = JSON.parse(await AsyncStorage.getItem("notificationList"));
    // if(!notificationList){
    //   notificationList = [];
    // }
    // let notificationObject = {
    //   type: 'update',
    //   isMandatory: true,
    //   read: false,
    //   title: notification.title,
    //   time: '2h ago',
    //   info: notification.body,
    //   data: objTemp,
    //   notificationId: notification.notificationId
    // }
    // notificationList.push(notificationObject);
    // await AsyncStorage.setItem("notificationList", JSON.stringify(notificationList));
    // console.log("notificationList", notificationList)
    console.log("notificationsss", notification, notification.android.channelId)
    const { title, body } = notification;
    const deviceTrayNotification = new firebase.notifications.Notification()
      .setTitle(title)
      .setBody(body)
      .setNotificationId(notification.notificationId)
      .setSound("default")
      .android.setPriority(firebase.notifications.Android.Priority.High)
      .android.setChannelId(notification.android.channelId ? notification.android.channelId : "foregroundNotification" ) // previously created
      .android.setAutoCancel(true); // To remove notification when tapped on it
      
    const channelId = new firebase.notifications.Android.Channel(notification.android.channelId, notification.android.channelId ? "Reminder" : "ForegroundNotification", firebase.notifications.Android.Importance.High);
    firebase.notifications().android.createChannel(channelId);
    console.log("deviceTrayNotification", deviceTrayNotification);
    firebase.notifications().displayNotification(deviceTrayNotification);
  }
