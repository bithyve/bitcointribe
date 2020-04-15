import firebase from "react-native-firebase";

export const firebaseNotificationListener = async()=> {
    const enabled = await firebase.messaging().hasPermission();
    console.log('enabledqqq', enabled)
    if (!enabled) {
        await firebase.messaging().requestPermission();
    }
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
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        console.log("notificationsss", notification)
        const { title, body } = notification;
        const deviceTrayNotification = new firebase.notifications.Notification()
          .setTitle(title)
          .setBody(body)
          .setNotificationId(notification.notificationId)
          .setSound("default")
          .android.setPriority(firebase.notifications.Android.Priority.High)
          .android.setChannelId(notification.android.channelId ? notification.android.channelId : "foregroundNotification" ) // previously created
          .android.setAutoCancel(true); // To remove notification when tapped on it

        firebase.notifications().displayNotification(deviceTrayNotification);
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