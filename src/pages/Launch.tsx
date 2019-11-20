import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { useDispatch } from "react-redux";
import Video from "react-native-video";
import { initializeDB } from "../store/actions/storage";

export default function Launch(props) {
  const dispatch = useDispatch();
  setTimeout(() => {
    props.navigation.replace("PasscodeConfirm");
  }, 5000);

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
