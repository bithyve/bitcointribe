import React, { Component } from "react";
import { Image } from "react-native";

import Onboarding from "react-native-onboarding-swiper";

interface Props {
  data: [];
  click_Done: Function;
}

export default class ViewOnBoarding extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }

  //TODO: renderItem
  renderItem(item: any) {
    let i: number;
    let swipItem: any[] = [];
    for (i = 0; i < item.length; i++) {
      swipItem.push({
        backgroundColor: item[i].backgroundColor,
        image: (
          <Image
            style={{ width: 240, height: 240 }}
            resizeMode="contain"
            source={item[i].image}
          />
        ),
        title: item[i].title,
        subtitle: item[i].subtitle
      });
    }
    return swipItem;
  }

  render() {
    return (
      <Onboarding
        onDone={() => this.props.click_Done()}
        onSkip={() => this.props.click_Done()}
        pages={this.renderItem(this.props.data)}
      />
    );
  }
}
