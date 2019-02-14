import React, { Component } from "react";
import { SCLAlert, SCLAlertButton } from "react-native-scl-alert";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  data: [];
  click_Ok: Function;
}

export default class SCLAlertSimpleConfirmation extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }
  render() {
    return (  
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
      >
        <SCLAlertButton theme="info" onPress={() => this.props.click_Ok(true)}>
          {this.props.data.length != 0 ? this.props.data[0].confirmTitle : null}
        </SCLAlertButton>
        <SCLAlertButton theme="info" onPress={() => this.props.click_Ok(false)}>
          CANCEL
        </SCLAlertButton>
      </SCLAlert>
    );
  }
}
