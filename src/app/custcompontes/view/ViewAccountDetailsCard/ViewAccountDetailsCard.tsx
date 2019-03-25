import React, { Component } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Left,
  Right,
  Body,
  Text,
  List,
  ListItem,
  Thumbnail
} from "native-base";
import SvgImage from "react-native-remote-svg";

import {
  colors,
  images,
  localDB,
  errorMessage
} from "bithyve/src/app/constants/Constants";
import renderIf from "bithyve/src/app/constants/validation/renderIf";
var utils = require("bithyve/src/app/constants/Utils");

interface Props {
  data: [];
  click_Done: Function;
  click_OpenRecentTrans: Function;
}

export default class ViewAccountDetailsCard extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View
          style={[
            utils.getDeviceModel() == "IphoneX" ? { flex: 0.5 } : { flex: 0.8 },
            {
              backgroundColor: "#F4F4F4",
              borderTopLeftRadius: 10,
              borderTopEndRadius: 10,
              alignItems: "center"
            }
          ]}
        >
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 100,
                height: 40,
                marginTop: 20
              }}
            >
              <SvgImage
                source={images.svgImages.walletScreen.accountLogo}
                style={[styles.svgImage]}
              />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>
              Regular Account
            </Text>
          </View>
          {/* TOTAL DEPOSTIS and AVALABLE FOUNDS show  */}
          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ fontSize: 12, color: "gray" }}>
                TOTAL DEPOSTIS
              </Text>
              <Text style={{ fontSize: 16 }}>$150,000</Text>
            </View>

            <View style={{ flex: 1, flexDirection: "row" }}>
              <View
                style={{
                  height: 30,
                  width: 1,
                  backgroundColor: "gray",
                  marginLeft: 5,
                  marginRight: 5,
                  justifyContent: "center",
                  alignSelf: "center",
                  alignItems: "center"
                }}
              />
              <View>
                <Text style={{ fontSize: 12, color: "gray" }}>
                  AVALABLE FOUNDS
                </Text>
                <Text style={{ fontSize: 16 }}>$150,000</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    borderRadius: 10
  },
  svgImage: {
    width: "100%",
    height: "100%"
  }
});
