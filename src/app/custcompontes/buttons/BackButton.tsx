import React, { Component } from "react";
import { Button } from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  click_Done: Function;
}
export default class BackButton extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Button
        transparent
        style={{ width: 50 }}
        onPress={() => this.props.click_Done()}
      >
        <Icon name="chevron-left" size={25} color="#ffffff" />
      </Button>
    );
  }
}
