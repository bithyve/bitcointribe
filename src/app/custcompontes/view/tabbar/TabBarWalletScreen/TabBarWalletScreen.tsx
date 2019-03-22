import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import SvgImage from "react-native-remote-svg";
import testSvg from "bithyve/src/assets/images/svg/TabBarWalletScreen/icon_wallet_selected.svg";

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

export default class TabBarWalletScreen extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View
          style={{
            flex: 1
          }}
        >
          <SvgImage
            source={images.svgImages.tabBarWalletScreen.walletIcon}
            style={[styles.svgImage]}
          />

          <Text
            style={[styles.tabBarTitle, { color: colors.tabbarActiveColor }]}
          >
            Wallet
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <SvgImage
            source={images.svgImages.tabBarWalletScreen.transactionIcon}
            style={styles.svgImage}
          />
          <Text style={styles.tabBarTitle}>Trasnactions</Text>
        </View>

        <View style={{ flex: 1 }}>
          <SvgImage
            source={images.svgImages.tabBarWalletScreen.qrscanIcon}
            style={styles.svgImage}
          />
          <Text style={styles.tabBarTitle}>QR Scan</Text>
        </View>
        <View style={{ flex: 1 }}>
          <SvgImage
            source={images.svgImages.tabBarWalletScreen.settingIcon}
            style={styles.svgImage}
          />
          <Text style={styles.tabBarTitle}>Settings</Text>
        </View>
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
    flexDirection: "row",
    alignItems: "center"
  },
  svgImage: {
    width: "100%",
    height: "100%"
  },
  tabBarTitle: {
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "FiraSans-Medium",
    fontSize: 10
  }
});
