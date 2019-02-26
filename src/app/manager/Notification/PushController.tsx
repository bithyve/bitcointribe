import React, { Component } from "react";
import PushNotification from "react-native-push-notification";

export default class PushController extends Component {
  componentDidMount() {
    console.log("Did Mount");
    PushNotification.configure({
      onRegister: function(token: any) {
        console.log("TOKEN: ", token);
      },
      onNotification: function(notification) {
        console.log("NOTIFICATION: ", notification);
      },
      senderID: "1009086953729",
      popInitialNotification: true,
      requestPermissions: true
    });
  }

  render() {
    return null;
  }
}
