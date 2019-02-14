import React, { Component } from "react";
import { FlatList, StyleSheet, TextInput } from "react-native";
import { SCLAlert, SCLAlertButton } from "react-native-scl-alert";
import Icon from "react-native-vector-icons/FontAwesome5";
import DropdownAlert from "react-native-dropdownalert";
import { colors } from "../../constants/Constants";
interface Props {
  status: boolean;
  data: [];
  onPress: Function;
  onRequestClose: Function;
  onError: Function;
}

interface State {
  name: string;
  amount: any;
}

export default class SCLAlertTransferAccountAmount extends Component<
  Props,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {
      amount: null
    };
  }

  render() {
    return (
      <SCLAlert
        theme="info"
        title="TRANSFER AMOUNT"
        slideAnimationDuration={0}
        subtitle={
          this.props.data.length != 0 ? this.props.data[0].subtitle : false
        }
        show={this.props.data.length != 0 ? this.props.data[0].status : false}
        onRequestClose={() => this.props.onRequestClose()}
        cancellable={true}
        headerIconComponent={
          <Icon name="exchange-alt" size={50} color="#fff" />
        }
      >
        <TextInput
          name={this.state.amount}
          value={this.state.amount}
          placeholder="Enter BTC Amount"
          keyboardType={"numbers-and-punctuation"}
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          onChangeText={val =>
            this.setState({
              amount: val
            })
          }
          onChange={val =>
            this.setState({
              amount: val
            })
          }
        />
        <FlatList
          data={this.props.data.length != 0 ? this.props.data[0].data : null}
          renderItem={({ item }) => (
            <SCLAlertButton
              theme="info"
              onPress={() => {
                if (this.state.amount > 0) {
                  this.props.onPress(
                    item.accountType,
                    this.state.amount,
                    item.address,
                    "Amount " +
                      this.state.amount +
                      " savings account to secure account transfer confirm?"
                  );
                } else {
                  this.props.onError("Please enter amount.");
                }
              }}
            >
              {item.accountType}
            </SCLAlertButton>
          )}
          keyExtractor={(item, index) => index}
        />
        <DropdownAlert ref={ref => (this.dropdown = ref)} />
      </SCLAlert>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    height: 40,
    textAlign: "center",
    borderBottomColor: "#000000"
  }
});
