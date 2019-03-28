/**
 * Button component
 * Renders a button and calls a function passed via onPress prop once tapped
 */

import React, { Component } from "react";
import {
  StyleSheet, // CSS-like styles
  Text, // Renders text
  TouchableOpacity, // Pressable container
  View, // Container component
  Dimensions
} from "react-native";

export default class Button extends Component {
  render({ onPress } = this.props) {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.button}>
          <Text style={styles.text}>{this.props.text}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  // Button container
  button: {
    borderRadius: 5, // Rounded border
    borderWidth: 2, // 2 point border widht
    backgroundColor: "#0E7DC3",
    borderColor: "#0E7DC3", // White colored border
    height: 50,
    width: Dimensions.get("screen").width / 1.2,
    alignItems: "center",
    justifyContent: "center"
  },
  // Button text
  text: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontFamily: "Avenir",
    fontSize: 18
  }
});
