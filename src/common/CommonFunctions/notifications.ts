import firebase from 'react-native-firebase';
import { NOTIFICATION_HOUR } from 'react-native-dotenv';
import { AsyncStorage } from 'react-native';

export const createNotificationListeners = async () => {
  /*
   * Triggered when a particular notification has been received in foreground
   * */
  this.notificationListener = firebase
    .notifications()
    .onNotification((notification) => {
      onNotificationArrives(notification);
    });

  /*
   * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
   * */
  this.notificationOpenedListener = firebase
    .notifications()
    .onNotificationOpened((notificationOpen) => {
      const { title, body } = notificationOpen.notification;
      console.log("notificationOpen.notification onNotificationOpened", notificationOpen.notification);
    });

  /*
   * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
   * */
  const notificationOpen = await firebase
    .notifications()
    .getInitialNotification();
  if (notificationOpen) {
    const { title, body } = notificationOpen.notification;
    console.log("notificationOpen.notification getInitialNotification", notificationOpen.notification);
  }
  /*
   * Triggered for data only payload in foreground
   * */
  this.messageListener = firebase.messaging().onMessage((message) => {
    //process data message
  });
};

export const scheduleNotification = async () => {
  const notification = new firebase.notifications.Notification()
    .setTitle('We have not seen you in a while!')
    .setBody(
      'Opening your app regularly ensures you get all the notifications and security updates',
    )
    .setNotificationId('1')
    .setSound('default')
    .setData({
      title: 'We have not seen you in a while!',
      body:
        'Opening your app regularly ensures you get all the notifications and security updates',
    })
    .android.setChannelId('reminder')
    .android.setPriority(firebase.notifications.Android.Priority.High);

  // Schedule the notification for 2hours on development and 2 weeks on Production in the future
  const date = new Date();
  date.setHours(date.getHours() + Number(NOTIFICATION_HOUR));

  console.log('DATE', date, NOTIFICATION_HOUR, date.getTime());
  await firebase
    .notifications()
    .scheduleNotification(notification, {
      fireDate: date.getTime(),
      //repeatInterval: 'hour',
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

const onNotificationArrives = async (notification) => {
  let androidObject = {
    actions: notification.android.actions,
    autoCancel: notification.android.autoCancel,
    badgeIconType: notification.android.badgeIconType,
    bigPicture: notification.android.bigPicture,
    bigText: notification.android.bigText,
    category: notification.android.category,
    channelId: notification.android.channelId,
    clickAction: notification.android.clickAction,
    color: notification.android.color,
    colorized: notification.android.colorized,
    contentInfo: notification.android.contentInfo,
    defaults: notification.android.defaults,
    group: notification.android.group,
    groupAlertBehaviour: notification.android.groupAlertBehaviour,
    groupSummary: notification.android.groupSummary,
    largeIcon: notification.android.largeIcon,
    lights: notification.android.lights,
    localOnly: notification.android.localOnly,
    number: notification.android.number,
    ongoing: notification.android.ongoing,
    onlyAlertOnce: notification.android.onlyAlertOnce,
    people: notification.android.people,
    priority: notification.android.priority,
    progress: notification.android.progress,
    remoteInputHistory: notification.android.remoteInputHistory,
    shortcutId: notification.android.shortcutId,
    showWhen: notification.android.showWhen,
    smallIcon: notification.android.smallIcon,
    sortKey: notification.android.sortKey,
    tag: notification.android.tag,
    ticker: notification.android.ticker,
    timeoutAfter: notification.android.timeoutAfter,
    usesChronometer: notification.android.usesChronometer,
    vibrate: notification.android.vibrate,
    visibility: notification.android.visibility,
    when: notification.android.when,
  };
  let iosObject = {
    alertAction: notification.ios.alertAction,
    attachments: notification.ios.attachments,
    badge: notification.ios.badge,
    category: notification.ios.category,
    hasAction: notification.ios.hasAction,
    launchImage: notification.ios.launchImage,
    threadIdentifier: notification.ios.threadIdentifier,
    complete: notification.ios.complete,
  };
  let objTemp = {
    android: androidObject,
    body: notification.body,
    title: notification.title,
    sound: notification.sound,
    notificationId: notification.notificationId,
    ios: iosObject,
    data: notification.data,
    subtitle: notification.subtitle,
  };
  console.log('objTemp', objTemp);
  let notificationList = JSON.parse(
    await AsyncStorage.getItem('notificationList'),
  );
  if (!notificationList) {
    notificationList = [];
  }
  let notificationObject = {
    type: 'update',
    isMandatory: true,
    read: false,
    title: notification.title,
    time: '2h ago',
    info: notification.body,
    data: objTemp,
    notificationId: notification.notificationId,
  };
  notificationList.push(notificationObject);
  await AsyncStorage.setItem(
    'notificationList',
    JSON.stringify(notificationList),
  );
  console.log('notificationList', notificationList);
  console.log('notificationsss', notification, notification.android.channelId);

  const { title, body } = notification;
  const deviceTrayNotification = new firebase.notifications.Notification()
    .setTitle(title)
    .setBody(body)
    .setNotificationId(notification.notificationId)
    .setSound('default')
    .android.setPriority(firebase.notifications.Android.Priority.High)
    .android.setChannelId(
      notification.android.channelId
        ? notification.android.channelId
        : 'foregroundNotification',
    ) // previously created
    .android.setAutoCancel(true); // To remove notification when tapped on it

  const channelId = new firebase.notifications.Android.Channel(
    notification.android.channelId,
    notification.android.channelId ? 'Reminder' : 'ForegroundNotification',
    firebase.notifications.Android.Importance.High,
  );
  firebase.notifications().android.createChannel(channelId);
  console.log('deviceTrayNotification', deviceTrayNotification);
  firebase.notifications().displayNotification(deviceTrayNotification);
};
