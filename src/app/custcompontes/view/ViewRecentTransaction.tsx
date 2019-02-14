import React, { Component } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import {
  Left,
  Right,
  Body,
  Text,
  List,
  ListItem,
  Thumbnail
} from "native-base";
import { DotIndicator } from "react-native-indicators";

import { colors } from "../../constants/Constants";
import renderIf from "../../constants/validation/renderIf";
var utils = require("../../../app/constants/Utils");

interface Props {
  data: [];
  openRecentTrans: Function;
}

export default class ViewRecentTransaction extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.viewTitleRecentTrans}>
          <Text style={styles.txtRecentTran}>
            {this.props.data.length != 0 ? this.props.data[0].title : null}
          </Text>
          {renderIf(
            this.props.data.length != 0 ? this.props.data[0].isLoading1 : null
          )(
            <View style={styles.loading}>
              <DotIndicator size={5} color={colors.appColor} />
            </View>
          )}
        </View>
        {renderIf(
          this.props.data.length != 0 ? this.props.data[0].isNoTranstion : null
        )(
          <View style={styles.viewNoTransaction}>
            <Thumbnail
              source={require("../../../assets/images/faceIcon/normalFaceIcon.png")}
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
                  >
                    <Left>
                      <Thumbnail
                        source={require("../../../assets/images/bitcoinLogo.jpg")}
                      />
                    </Left>
                    <Body>
                      <Text numberOfLines={1} style={styles.txtTransTitle}>
                        {item.transactionType}{" "}
                        <Text style={styles.txtConfimation}>
                          {item.confirmationType}{" "}
                        </Text>{" "}
                      </Text>
                      <Text note numberOfLines={1}>
                        {utils.getUnixToDateFormat(item.dateCreated)}
                      </Text>
                    </Body>
                    <Right>
                      {renderIf(item.transactionType == "Sent")(
                        <Text style={styles.txtAmoundSent}>
                          - {item.balance / 1e8}
                        </Text>
                      )}
                      {renderIf(item.transactionType == "Received")(
                        <Text style={styles.txtAmoundRec}>
                          + {item.balance / 1e8}
                        </Text>
                      )}
                    </Right>
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
  viewTitleRecentTrans: {
    marginLeft: 20,
    flexDirection: "row",
    flex: 0.2
  },
  txtRecentTran: {
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 10,
    color: "#000"
  },
  txtTransTitle: {
    flexDirection: "row",
    fontWeight: "bold",
    marginBottom: 5
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
    flex: 0.2,
    alignItems: "center"
  },
  txtNoTransaction: {
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 5
  },
  txtConfimation: {
    fontSize: 10,
    color: "gray"
  }
});
