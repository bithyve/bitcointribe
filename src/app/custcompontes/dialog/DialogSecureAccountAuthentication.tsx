import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  View,
  StatusBar,
  ImageBackground,
  RefreshControl,
  Dimensions,
  TextInput
} from "react-native";
import { Button, Text } from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import Dialog, {
  SlideAnimation,
  DialogContent
} from "react-native-popup-dialog";

interface Props {
  click_Sent: Function;
  click_Cancel: Function;
}
export default class DialogSecureAccountAuthentication extends Component<
  Props,
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      txt2FA: ""
    };
  }

  render() {
    return (
      <Dialog
        width={Dimensions.get("screen").width - 30}
        visible={
          this.props.data.length != 0 ? this.props.data[0].visible : false
        }
        dialogAnimation={
          new SlideAnimation({
            slideFrom: "bottom"
          })
        }
        dialogStyle={styles.dialogSecureAccount}
      >
        <DialogContent containerStyle={styles.dialogContainerSecureAccount}>
          <View style={styles.accountTypePopUP}>
            <Text style={[styles.txtTitle, { fontSize: 20 }]}>
              New Transaction
            </Text>

            <View style={styles.viewFeeShow}>
              <View style={[styles.viewLineText]}>
                <Text style={[styles.txtTitle, { flex: 1 }]}>Amount:</Text>
                <Text
                  style={[styles.txtTitle, { flex: 1, fontWeight: "bold" }]}
                >
                  ${" "}
                  {this.props.data.length != 0
                    ? this.props.data[0].amount
                    : null}
                </Text>
              </View>
              <View style={[styles.viewLineText]}>
                <Text style={[styles.txtTitle, { flex: 1 }]}>Fee:</Text>
                <Text
                  style={[styles.txtTitle, { flex: 1, fontWeight: "bold" }]}
                >
                  ${" "}
                  {this.props.data.length != 0 ? this.props.data[0].fee : null}
                </Text>
              </View>
            </View>

            <View style={styles.viewReceipint}>
              <Text style={[styles.txtTitle, { fontSize: 18 }]}>
                Recipient:
              </Text>
              <Text
                style={[
                  styles.txtTitle,
                  { textAlign: "center", fontSize: 18, fontWeight: "bold" }
                ]}
              >
                {this.props.data.length != 0
                  ? this.props.data[0].secureRecipientAddress
                  : null}
              </Text>
            </View>
            <View style={styles.view2FaInput}>
              <TextInput
                name={this.state.txt2FA}
                value={this.state.txt2FA}
                ref="txtInpAccountBal"
                autoFocus={true}
                keyboardType={"numeric"}
                returnKeyType={"next"}
                placeholder="2FA gauth token"
                placeholderTextColor="#EA4336"
                style={styles.input2FA}
                onChangeText={val => this.setState({ txt2FA: val })}
                onChange={val => this.setState({ txt2FA: val })}
              />
            </View>
            <View style={styles.viewBtn}>
              <Button
                transparent
                danger
                onPress={() => this.props.click_Cancel()}
              >
                <Text>CANCEL</Text>
              </Button>
              <Button
                transparent
                danger
                onPress={() => {
                  this.props.click_Sent(this.state.txt2FA);
                }}
              >
                <Text>SEND</Text>
              </Button>
            </View>
          </View>
        </DialogContent>
      </Dialog>
    );
  }
}

const styles = StyleSheet.create({
  txtTile: {
    color: "#ffffff"
  },
  txtTitle: {
    color: "#ffffff"
  },
  //popup
  dialogSecureAccount: {
    borderRadius: 5,
    backgroundColor: "#1F1E25"
  },
  dialogContainerSecureAccount: {},
  accountTypePopUP: {
    padding: 10,
    marginTop: 20
  },
  viewFeeShow: {
    marginTop: 20,
    marginBottom: 10
  },
  viewLineText: {
    flexDirection: "row"
  },
  viewReceipint: {},
  view2FaInput: {
    marginTop: 20
  },
  input2FA: {
    borderBottomWidth: 1,
    borderBottomColor: "#EA4336",
    color: "#EA4336",
    fontSize: 18
  },
  //view:Button
  viewBtn: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
    justifyContent: "flex-end"
  }
});
