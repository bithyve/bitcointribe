import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar, AppState } from "react-native";
import { useDispatch } from "react-redux";
import Video from "react-native-video";
import Colors from "../common/Colors";

import { initializeDB } from "../store/actions/storage";
import AsyncStorage from "@react-native-community/async-storage";
import Login from "./Login";

export default function Launch(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeDB());
    setTimeout(async () => {
      if (await AsyncStorage.getItem("hasCreds"))
        props.navigation.replace("Login");
      else props.navigation.replace("PasscodeConfirm");
    }, 5000);
  }, []);

  return (
    <View style={styles.container}>
      <Video
        source={require("./../assets/video/splash_animation.mp4")}
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
    backgroundColor: Colors.white
  }
});
