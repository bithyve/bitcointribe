import React, { Component } from "react";
import { SCLAlert, SCLAlertButton } from "react-native-scl-alert";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  Text,
  StyleSheet,
  View,
  StatusBar,
  ImageBackground,
  RefreshControl
} from "react-native";
interface Props {
  data: [];
  click_Ok: Function;
}

export default class SCLAlertJointAccountAuthoriseConfirmation extends Component<
  Props,
  any
> {
  constructor(props: any) {
    super(props);
  }
  render() {
    return (
      <View style={styles.container}>
      <SCLAlert  
        theme="info"
        show={this.props.data.length != 0 ? this.props.data[0].status : false}
        slideAnimationDuration={0}
        cancellable={false}
        headerIconComponent={
          <Icon
            name={this.props.data.length != 0 ? this.props.data[0].icon : null}
            size={50}
            color="#fff"
          />
        }
        title={this.props.data.length != 0 ? this.props.data[0].title : null}
        subtitle={
          this.props.data.length != 0 ? this.props.data[0].subtitle : null
        }
       
        subtitleStyle={{fontSize: 14}}   
      >
        <View >
          <Text style={[styles.txtTransactionDetials]}>
            Transaction Details:
          </Text>
          <View>
            <Text style={styles.txtHeader}>From :</Text>
            <Text style={[styles.txtHeaderDetails,{textAlign:'center'}]}>
              {this.props.data.length != 0 ? this.props.data[0].form : null}
            </Text>
          </View>
          <View>
            <Text style={styles.txtHeader}>To :</Text>
            <Text style={[styles.txtHeaderDetails,{textAlign:'center'}]}>
              {this.props.data.length != 0 ? this.props.data[0].to : null}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.txtHeader}>Amount :</Text>
            <Text style={styles.txtHeaderDetails}>
              {this.props.data.length != 0 ? this.props.data[0].amount : null}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.txtHeader}>Transaction Fee :</Text>
            <Text style={styles.txtHeaderDetails}>
              {this.props.data.length != 0 ? this.props.data[0].transFee : null}
            </Text>
          </View>
        </View>
        <SCLAlertButton theme="info" onPress={() => this.props.click_Ok(true)}>
          {this.props.data.length != 0 ? this.props.data[0].confirmTitle : null}
        </SCLAlertButton>
        <SCLAlertButton theme="info" onPress={() => this.props.click_Ok(false)}>
          CANCEL
        </SCLAlertButton>
      </SCLAlert>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },  
  //txt:txtTransactionDetials
  txtTransactionDetials: {
    fontSize: 20,
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginBottom: 10
  },
  //txt:txtHeader
  txtHeader: {
    fontSize: 14,
    fontWeight: "bold"
  },
  //txt:txtHeaderDetails
  txtHeaderDetails: {
    fontSize: 14,
    paddingLeft: 5
  }
});
