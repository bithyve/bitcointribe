import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

import {
  colors,
  images,
  localDB,
  errorMessage
} from "bithyve/src/app/constants/Constants";

interface Props {
  data: [];
  click_Done: Function;
}

export default class WalletScreenCards extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return <View style={styles.container} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
