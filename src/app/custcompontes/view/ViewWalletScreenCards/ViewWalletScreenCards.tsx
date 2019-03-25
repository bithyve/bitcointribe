import React, { Component } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Carousel from "react-native-snap-carousel";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Left,
  Right,
  Body,
  Text
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
import SvgImage from "react-native-remote-svg";

import {
  colors,
  images,
  localDB,
  errorMessage
} from "bithyve/src/app/constants/Constants";
var utils = require("bithyve/src/app/constants/Utils");
import renderIf from "bithyve/src/app/constants/validation/renderIf";

//TODO: Custome compontes
import ViewRecentTransaction from "bithyve/src/app/custcompontes/view/ViewRecentTransactons/ViewRecentTransactons";

const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  "window"
);
function wp(percentage: number) {
  const value = (percentage * viewportWidth) / 100;
  return Math.round(value);
}
const slideHeight = viewportHeight * 0.36;
const slideWidth = wp(75);
const itemHorizontalMargin = wp(2);
const sliderWidth = viewportWidth;
const itemWidth = slideWidth + itemHorizontalMargin * 2;
const SLIDER_1_FIRST_ITEM = 0;

interface Props {
  data: [];
  click_Details: Function;
  click_OpenRecentTrans: Function;
}

export default class ViewWalletScreenCards extends Component<Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      arr_RecentTransaction: []
    };
  }

  _renderItem({ item, index }) {
    return (
      <View
        key={"card" + index}
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          borderRadius: 10
        }}
      >
        {renderIf(item.accountType == "UnKnown")(
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Icon name="plus-circle" size={40} color={colors.appColor} />
            <Text>Create Wallet</Text>
          </View>
        )}
        {renderIf(item.accountType != "UnKnown")(
          <View style={{ flex: 1 }}>
            <View
              style={[
                utils.getDeviceModel() == "IphoneX"
                  ? { flex: 0.5 }
                  : { flex: 0.8 },
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
                    marginTop: 10
                  }}
                >
                  <SvgImage
                    source={images.svgImages.walletScreen.accountLogo}
                    style={[styles.svgImage]}
                  />
                </View>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", marginTop: 5 }}
                >
                  {item.accountType}
                </Text>
              </View>
              {/* TOTAL DEPOSTIS and AVALABLE FOUNDS show  */}
              <View style={{ flexDirection: "row", marginTop: 10 }}>
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
            {/* Recent Transactions View*/}
            <View
              style={{
                flex: 1
              }}
            >
              {renderIf(
                this.props.data.length != 0
                  ? this.props.data[0].recentTransaction != 0
                  : null
              )(
                <ViewRecentTransaction
                  data={this.props.data[0].recentTransaction}
                  click_OpenRecentTrans={(item: any) => {
                    this.props.click_OpenRecentTrans(item);
                  }}
                />
              )}
            </View>
            {/* Bottom View Details Button View*/}
            <View
              style={[
                utils.getDeviceModel() == "IphoneX"
                  ? { flex: 0.24 }
                  : { flex: 0.4 },
                {
                  backgroundColor: "#ffffff",
                  borderBottomLeftRadius: 10,
                  borderBottomEndRadius: 10
                }
              ]}
            >
              <Button
                full
                style={{
                  margin: 10,
                  borderRadius: 10,
                  backgroundColor: colors.appColor
                }}
                onPress={() => this.props.click_Details("screen2", item, index)}
              >
                <Text style={{ color: "#ffffff", fontSize: 16 }}>
                  View Details
                </Text>
              </Button>
            </View>
          </View>
        )}
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {renderIf(
          this.props.data.length != 0
            ? this.props.data[0].accountTypeList != 0
            : null
        )(
          <Carousel
            ref={c => {
              this._carousel = c;
            }}
            data={
              this.props.data.length != 0
                ? this.props.data[0].accountTypeList
                : null
            }
            renderItem={this._renderItem.bind(this)}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  svgImage: {
    width: "100%",
    height: "100%"
  }
});
