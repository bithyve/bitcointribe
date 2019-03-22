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
}

export default class ViewRecentTransaction extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        {renderIf(
          this.props.data.length != 0 ? this.props.data[0].isNoTranstion : null
        )(
          <View style={styles.viewNoTransaction}>
            <Thumbnail
              source={require("bithyve/src/assets/images/faceIcon/normalFaceIcon.png")}
            />
            <Text style={styles.txtNoTransaction} note>
              No Transactions
            </Text>
          </View>
        )}
        {renderIf(
          this.props.data.length != 0
            ? this.props.data[0].tranDetails != 0
            : null
        )(
          <View style={styles.recentTransListView}>
            <FlatList
              data={
                this.props.data.length != 0
                  ? this.props.data[0].tranDetails
                  : null
              }
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <List>
                  <ListItem
                    thumbnail
                    onPress={() => this.props.openRecentTrans(item)}
                    style={{
                      height: 70
                    }}
                  >
                    <Left style={{ flex: 0.16 }}>
                      {renderIf(item.transactionType == "Sent")(
                        <SvgImage
                          source={
                            images.svgImages.viewRecentTransaction.sentIcon
                          }
                          style={[styles.svgImage]}
                        />
                      )}
                      {renderIf(item.transactionType == "Received")(
                        <SvgImage
                          source={
                            images.svgImages.viewRecentTransaction.receivedIcon
                          }
                          style={[styles.svgImage]}
                        />
                      )}
                    </Left>
                    <Body style={{ flex: 2, flexDirection: "row" }}>
                      <View style={{ flex: 2 }}>
                        <Text numberOfLines={1} style={styles.txtTransTitle}>
                          {item.transactionType}{" "}
                        </Text>
                        <Text style={styles.txtConfimation}>
                          {item.confirmationType}{" "}
                        </Text>
                        <Text note numberOfLines={1}>
                          {utils.getUnixToDateFormat(item.dateCreated)}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {renderIf(item.transactionType == "Sent")(
                          <Text style={styles.txtAmoundSent}>
                            {(item.balance / 1e8).toFixed(4)}
                          </Text>
                        )}
                        {renderIf(item.transactionType == "Received")(
                          <Text style={styles.txtAmoundRec}>
                            {(item.balance / 1e8).toFixed(4)}
                          </Text>
                        )}
                      </View>
                    </Body>
                  </ListItem>
                </List>
              )}
              keyExtractor={(item, index) => index}
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  txtTransTitle: {
    fontWeight: "bold"
  },
  txtAmoundRec: {
    color: "#228B22",
    fontWeight: "bold"
  },
  txtAmoundSent: {
    color: "red",
    fontWeight: "bold"
  },
  recentTransListView: {
    flex: 1
  },
  //No Transaction
  viewNoTransaction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  txtNoTransaction: {
    fontSize: 20,
    fontWeight: "bold"
  },
  txtConfimation: {
    fontSize: 10,
    color: "gray"
  },
  svgImage: {
    width: "100%"
  }
});
