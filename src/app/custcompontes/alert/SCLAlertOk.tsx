import React, { Component } from "react";
import { SCLAlert, SCLAlertButton } from "react-native-scl-alert";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  data: [];
  click_Ok: Function;
}

export default class SCLAlertOk extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }
  render() {
    return (
      <SCLAlert
        theme={this.props.data.length != 0 ? this.props.data[0].theme : null}
        show={this.props.data.length != 0 ? this.props.data[0].status : false}
        cancellable={false}
        slideAnimationDuration={0}
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
        <SCLAlertButton
          theme={this.props.data.length != 0 ? this.props.data[0].theme : null}
          onPress={() => {
            if (this.props.data[0].goBackStatus) {
              this.props.click_Ok(true);
            } else {
              this.props.click_Ok(false);
            }
          }}
        >
          Ok
        </SCLAlertButton>
      </SCLAlert>
    );
  }
}
