import React, { Component } from "react";
import { FlatList } from "react-native";
import { SCLAlert, SCLAlertButton } from "react-native-scl-alert";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  status: boolean;
  data: [];
  onPress: Function;
  onRequestClose: Function;
}

interface State {
  name:string;
}
  
export default class SCLAlertAccountTypes extends Component<Props, State> {
  constructor(props:any) {
    super(props);
  }   

  render() {
    return (
      <SCLAlert
        theme="success"
        title=""
        subtitle=""
        show={this.props.status}
        onRequestClose={() => this.props.onRequestClose()}
        slideAnimationDuration={0}
        cancellable={true}
        headerIconComponent={<Icon name="plus-circle" size={60} color="#fff" />}
      >   
        <FlatList
          data={this.props.data.length != 0 ? this.props.data[0].data : null}
          style={{ marginTop: -80 }}
          renderItem={({ item }) => (
            <SCLAlertButton
              theme="success"
              onPress={() => this.props.onPress(item.name)}
            >
              {item.name}
            </SCLAlertButton>
          )}
          keyExtractor={(item,index) => index}
        />
      </SCLAlert>
    );
  }
}
