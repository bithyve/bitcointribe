import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  data: [];
  click_Done: Function;
}

export default class TabBarWalletScreen extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#000" }}>hi</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 10,
    flexDirection: "row"
  }
});
