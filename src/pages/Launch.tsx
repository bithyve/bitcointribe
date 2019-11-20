import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { useDispatch } from "react-redux";
import Video from "react-native-video";
import { initializeDB } from "../store/actions/storage";
import AsyncStorage from "@react-native-community/async-storage";
import { credsAuth } from "../store/actions/wallet-setup";

export default function Launch(props) {
  const dispatch = useDispatch();

  const postVideoNav = async () => {
    //TODO: move to login and post authentication to the RestoreAndRecover (if wallet setup isn't in place already)
    if (await AsyncStorage.getItem("hasCreds")) {
      if (await AsyncStorage.getItem("walletExists")) {
        dispatch(credsAuth("1111")); //mocking passcode entered@Login
        props.navigation.replace("Home");
      } else props.navigation.replace("RestoreAndReoverWallet");
    } else props.navigation.replace("PasscodeConfirm");
  };

  setTimeout(postVideoNav, 5000);

  useEffect(() => {
    dispatch(initializeDB());
  }, []);

  return (
    <View style={styles.container}>
      <Video
        source={require("../assets/video/splash_animation.mp4")}
        style={{
          flex: 1
        }}
        muted={true}
        repeat={false}
        resizeMode={"cover"}
        rate={1.0}
        ignoreSilentSwitch={"obey"}
      />
      <StatusBar
        backgroundColor={"white"}
        hidden={true}
        barStyle="dark-content"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
